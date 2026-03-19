import express from "express";
import cors from "cors";
import { conversationsRouter } from "./routes/conversations";
import { messagesRouter } from "./routes/messages";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/conversations", conversationsRouter);
app.use("/api/conversations/:id/messages", messagesRouter);

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Nala server running on port ${PORT}`);
  });
}

export { app };
