import os from "node:os";
import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { supportTicketLogs, supportTickets } from "@shared/schema";

export interface SupportTicket { id: string; userId: string; username: string; email: string; subject: string; description: string; category: string; status: "open" | "resolved"; createTime: Date; updateTime: Date; resolutionDetails?: { message: string; steps: string[] }; }
const map = (row: typeof supportTickets.$inferSelect): SupportTicket => ({ id: row.ticketNumber, userId: row.userId ?? "anonymous", username: "", email: "", subject: row.subject, description: row.description, category: row.category, status: row.status === "resolved" ? "resolved" : "open", createTime: row.createdAt ?? new Date(), updateTime: row.updatedAt ?? row.createdAt ?? new Date(), resolutionDetails: row.aiResolution ? { message: row.aiResolution, steps: row.resolutionSteps ?? [] } : undefined });

async function createTicket(userId: string, username: string, email: string, subject: string, description: string) {
  const ticketNumber = `T${crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
  const [row] = await db.insert(supportTickets).values({ ticketNumber, userId, subject, description, category: "general", priority: "medium", status: "open", aiAssigned: false }).returning();
  await db.insert(supportTicketLogs).values({ ticketId: row.id, action: "created", details: { username, email } });
  return map(row);
}
async function getTicket(id: string) { const [row] = await db.select().from(supportTickets).where(eq(supportTickets.ticketNumber, id)).limit(1); return row ? map(row) : undefined; }
async function getUserTickets(userId: string) { return (await db.select().from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.createdAt))).map(map); }
async function resolveTicket(id: string, message: string, steps: string[] = []) { const [row] = await db.update(supportTickets).set({ status: "resolved", aiResolution: message, resolutionSteps: steps, resolvedAt: new Date(), updatedAt: new Date() }).where(eq(supportTickets.ticketNumber, id)).returning(); if (!row) return undefined; await db.insert(supportTicketLogs).values({ ticketId: row.id, action: "resolved", details: { steps } }); return map(row); }
async function performSystemHealthCheck() { const high = 100 - Math.round((os.freemem() / os.totalmem()) * 100) > 90; return { status: high ? "degraded" as const : "healthy" as const, issues: high ? ["High memory usage detected"] : [] }; }
async function getCommonIssueCategories() { const rows = await db.select().from(supportTickets); const counts = rows.reduce<Record<string, number>>((all, row) => ({ ...all, [row.category]: (all[row.category] ?? 0) + 1 }), {}); return Object.entries(counts).map(([category, count]) => ({ category, count })); }
export const supportService = { createTicket, getTicket, getUserTickets, resolveTicket, performSystemHealthCheck, getCommonIssueCategories };
