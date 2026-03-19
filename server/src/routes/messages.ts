import { Router } from "express";
import { createMessage, getConversation } from "../db/queries";
import type { MessageRole } from "@nala/shared";

const VALID_ROLES: MessageRole[] = ["user", "assistant"];

const router = Router({ mergeParams: true });

router.post("/", async (req, res) => {
  try {
    const { role, content } = req.body;
    const { id: conversationId } = req.params;

    if (!content || typeof content !== "string" || content.trim() === "") {
      res.status(400).json({ error: "Content is required", code: "VALIDATION_ERROR" });
      return;
    }

    if (!VALID_ROLES.includes(role)) {
      res.status(400).json({ error: "Role must be 'user' or 'assistant'", code: "VALIDATION_ERROR" });
      return;
    }

    const conversation = await getConversation(conversationId);
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found", code: "NOT_FOUND" });
      return;
    }

    const message = await createMessage(conversationId, role, content.trim());
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to create message", code: "DB_ERROR" });
  }
});

export { router as messagesRouter };
