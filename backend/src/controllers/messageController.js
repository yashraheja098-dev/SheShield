import Message from "../models/Message.js";
import Room from "../models/Room.js";

// GET /rooms/:id/messages
export const getRoomMessages = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Optional: Check if user is a member of the room
    const room = await Room.findOne({ roomId: id });
    if (!room) return res.status(404).json({ message: "Room not found" });

    const isMember = room.members.some(m => m.userId.toString() === req.user.id.toString());
    if (!isMember) return res.status(403).json({ message: "You are not a member of this room" });

    const messages = await Message.find({ roomId: id }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getRoomMessages:", error);
    res.status(500).json({ message: "Server error" });
  }
};
