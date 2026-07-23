import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { handleAIChat } from "../controllers/aiController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/chat", handleAIChat);

export default router;
