import { Router, type Response } from "express";
import { z } from "zod";
import { isAuthenticated } from "../replitAuth";
import { supportService } from "../services/supportService";

const router = Router();

const createTicketSchema = z.object({
  subject: z.string().min(5).max(100),
  description: z.string().min(10).max(2000),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
});

router.post("/tickets", isAuthenticated, async (req: any, res: Response) => {
  try {
    const validation = createTicketSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: validation.error.format(),
      });
    }

    const { subject, description } = validation.data;
    const ticket = await supportService.createTicket(
      req.user?.claims?.sub || "anonymous",
      req.user?.claims?.first_name || "Guest User",
      req.user?.claims?.email || "support@weparlay.io",
      subject,
      description,
    );

    return res.status(201).json({
      ticketId: ticket.id,
      status: ticket.status,
      message: "Your ticket has been submitted for review.",
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return res.status(500).json({
      message: "An error occurred while creating your support ticket. Please try again later.",
    });
  }
});

router.get("/tickets", isAuthenticated, async (req: any, res: Response) => {
  try {
    const tickets = await supportService.getUserTickets(req.user?.claims?.sub || "anonymous");
    return res.status(200).json({
      tickets: tickets.map((ticket) => ({
        id: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        status: ticket.status,
        createTime: ticket.createTime,
        updateTime: ticket.updateTime,
        isResolved: ticket.status === "resolved",
        resolution: ticket.resolutionDetails?.message,
      })),
    });
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    return res.status(500).json({
      message: "An error occurred while fetching your support tickets. Please try again later.",
    });
  }
});

router.get("/tickets/:ticketId", isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user?.claims?.sub || "anonymous";
    const ticket = await supportService.getTicket(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    if (ticket.userId !== userId && req.user?.claims?.role !== "admin") {
      return res.status(403).json({ message: "You do not have permission to view this ticket" });
    }

    return res.status(200).json({
      id: ticket.id,
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      status: ticket.status,
      createTime: ticket.createTime,
      updateTime: ticket.updateTime,
      isResolved: ticket.status === "resolved",
      resolution: ticket.resolutionDetails,
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return res.status(500).json({
      message: "An error occurred while fetching the support ticket. Please try again later.",
    });
  }
});

router.get("/system-health", isAuthenticated, async (req: any, res: Response) => {
  try {
    if (req.user?.claims?.role !== "admin") {
      return res.status(403).json({ message: "You do not have permission to access system health data" });
    }

    return res.status(200).json({
      system: await supportService.performSystemHealthCheck(),
      support: {
        commonIssueCategories: await supportService.getCommonIssueCategories(),
      },
    });
  } catch (error) {
    console.error("Error checking system health:", error);
    return res.status(500).json({
      message: "An error occurred while checking system health. Please try again later.",
    });
  }
});

router.post("/tickets/:ticketId/resolve", isAuthenticated, async (req: any, res: Response) => {
  try {
    if (req.user?.claims?.role !== "admin") {
      return res.status(403).json({ message: "You do not have permission to resolve tickets" });
    }

    const resolutionSchema = z.object({
      message: z.string().trim().min(1),
      steps: z.array(z.string()).optional().default([]),
    });
    const validation = resolutionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Invalid resolution data",
        errors: validation.error.format(),
      });
    }

    const ticket = await supportService.resolveTicket(
      req.params.ticketId,
      validation.data.message,
      validation.data.steps,
    );
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).json({
      id: ticket.id,
      status: ticket.status,
      resolution: ticket.resolutionDetails,
    });
  } catch (error) {
    console.error("Error resolving ticket:", error);
    return res.status(500).json({
      message: "An error occurred while resolving the ticket. Please try again later.",
    });
  }
});

export default router;
