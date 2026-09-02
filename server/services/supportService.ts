import os from "node:os";

export interface SupportTicket {
  id: string;
  userId: string;
  username: string;
  email: string;
  subject: string;
  description: string;
  category: string;
  status: "open" | "resolved";
  createTime: Date;
  updateTime: Date;
  resolutionDetails?: {
    message: string;
    steps: string[];
  };
}

const supportTickets: SupportTicket[] = [];
let ticketCounter = 1000;

async function createTicket(
  userId: string,
  username: string,
  email: string,
  subject: string,
  description: string,
): Promise<SupportTicket> {
  const ticket: SupportTicket = {
    id: `T${ticketCounter++}`,
    userId,
    username,
    email,
    subject,
    description,
    category: "general",
    status: "open",
    createTime: new Date(),
    updateTime: new Date(),
  };

  supportTickets.push(ticket);
  console.log(`[Support] Ticket ${ticket.id} submitted by ${username} (${email})`);
  return ticket;
}

function getTicket(ticketId: string): SupportTicket | undefined {
  return supportTickets.find((ticket) => ticket.id === ticketId);
}

function getUserTickets(userId: string): SupportTicket[] {
  return supportTickets.filter((ticket) => ticket.userId === userId);
}

async function resolveTicket(
  ticketId: string,
  resolutionMessage: string,
  steps: string[] = [],
): Promise<SupportTicket | undefined> {
  const ticket = getTicket(ticketId);
  if (!ticket) return undefined;

  ticket.status = "resolved";
  ticket.updateTime = new Date();
  ticket.resolutionDetails = {
    message: resolutionMessage,
    steps,
  };

  return ticket;
}

async function performSystemHealthCheck(): Promise<{
  status: "healthy" | "degraded" | "critical";
  issues: string[];
}> {
  const issues: string[] = [];
  const usedMemoryPercent = 100 - Math.round((os.freemem() / os.totalmem()) * 100);

  if (usedMemoryPercent > 90) {
    issues.push("High memory usage detected");
  }

  return {
    status: issues.length === 0 ? "healthy" : issues.length >= 3 ? "critical" : "degraded",
    issues,
  };
}

function getCommonIssueCategories(): Array<{ category: string; count: number }> {
  const categories: Record<string, number> = {};
  for (const ticket of supportTickets) {
    categories[ticket.category] = (categories[ticket.category] || 0) + 1;
  }

  return Object.entries(categories)
    .map(([category, count]) => ({ category, count }))
    .sort((left, right) => right.count - left.count);
}

export const supportService = {
  createTicket,
  getTicket,
  getUserTickets,
  resolveTicket,
  performSystemHealthCheck,
  getCommonIssueCategories,
};