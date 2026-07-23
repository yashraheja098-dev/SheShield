import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getAllRooms,
  getMyRooms,
  getRoomById,
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomMembers,
  markTravellingToday,
  markReachedSafely
} from "../controllers/roomController.js";

const router = express.Router();

// All room routes require authentication
router.use(authMiddleware);

router.get("/", getAllRooms);
router.post("/", createRoom);
router.get("/my", getMyRooms);
router.get("/:id", getRoomById);
router.post("/:id/join", joinRoom);
router.post("/:id/leave", leaveRoom);
router.get("/:id/members", getRoomMembers);
router.post("/:id/travelling", markTravellingToday);
router.post("/:id/reached", markReachedSafely);

export default router;
