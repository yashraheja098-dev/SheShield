import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getRoomMessages } from "../controllers/messageController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/rooms/:id/messages", getRoomMessages);

export default router;
