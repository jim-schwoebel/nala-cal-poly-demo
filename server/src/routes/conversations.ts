import { Router } from "express";
import {
  createConversation,
  listConversations,
  getConversation,
  updateConversationTitle,
  deleteConversation,
} from "../db/queries";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";

const router = Router();

router.post("/", async (_req, res) => {
  try {
    const conversation = await createConversation(DEFAULT_USER_ID);
    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ error: "Failed to create conversation", code: "DB_ERROR" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const conversations = await listConversations(DEFAULT_USER_ID);
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: "Failed to list conversations", code: "DB_ERROR" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const conversation = await getConversation(req.params.id);
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found", code: "NOT_FOUND" });
      return;
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: "Failed to get conversation", code: "DB_ERROR" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || typeof title !== "string") {
      res.status(400).json({ error: "Title is required", code: "VALIDATION_ERROR" });
      return;
    }
    const conversation = await updateConversationTitle(req.params.id, title);
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found", code: "NOT_FOUND" });
      return;
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: "Failed to update conversation", code: "DB_ERROR" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await deleteConversation(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete conversation", code: "DB_ERROR" });
  }
});

export { router as conversationsRouter };
