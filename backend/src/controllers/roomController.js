import Room from "../models/Room.js";
import crypto from "crypto";

// GET /rooms
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("createdBy", "name profileImage").sort({ createdAt: -1 });
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error in getAllRooms:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /rooms/my
export const getMyRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const rooms = await Room.find({ "members.userId": userId }).populate("createdBy", "name profileImage").sort({ createdAt: -1 });
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error in getMyRooms:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /rooms/:id
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findOne({ roomId: id }).populate("createdBy", "name profileImage").populate("members.userId", "name profileImage");
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.status(200).json(room);
  } catch (error) {
    console.error("Error in getRoomById:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /rooms
export const createRoom = async (req, res) => {
  try {
    const { startLocation, destination, frequency, preferredTime, preferredTravelMode, meetingPoint, reason } = req.body;
    
    // Generate a unique short ID for the room
    const roomId = crypto.randomBytes(4).toString("hex");

    const newRoom = new Room({
      roomId,
      createdBy: req.user.id,
      startLocation,
      destination,
      frequency,
      preferredTime,
      preferredTravelMode,
      meetingPoint,
      reason,
      members: [{
        userId: req.user.id,
        travelMode: preferredTravelMode || "WALK"
      }]
    });

    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (error) {
    console.error("Error in createRoom:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /rooms/:id/join
export const joinRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { travelMode } = req.body;
    const userId = req.user.id;

    const room = await Room.findOne({ roomId: id });
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Check if already a member
    const isMember = room.members.some(member => member.userId.toString() === userId.toString());
    if (isMember) return res.status(400).json({ message: "Already joined this room" });

    room.members.push({
      userId,
      travelMode: travelMode || "WALK"
    });

    await room.save();
    res.status(200).json(room);
  } catch (error) {
    console.error("Error in joinRoom:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /rooms/:id/leave
export const leaveRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const room = await Room.findOne({ roomId: id });
    if (!room) return res.status(404).json({ message: "Room not found" });

    room.members = room.members.filter(member => member.userId.toString() !== userId.toString());
    
    // If the creator leaves, we could reassign or just leave it. We'll just remove them.
    await room.save();
    res.status(200).json({ message: "Left room successfully" });
  } catch (error) {
    console.error("Error in leaveRoom:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /rooms/:id/members
export const getRoomMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findOne({ roomId: id }).populate("members.userId", "name profileImage");
    if (!room) return res.status(404).json({ message: "Room not found" });
    
    res.status(200).json(room.members);
  } catch (error) {
    console.error("Error in getRoomMembers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /rooms/:id/travelling
export const markTravellingToday = async (req, res) => {
  try {
    const { id } = req.params;
    const { travellingToday } = req.body;
    const userId = req.user.id;

    const room = await Room.findOne({ roomId: id });
    if (!room) return res.status(404).json({ message: "Room not found" });

    const member = room.members.find(m => m.userId.toString() === userId.toString());
    if (!member) return res.status(403).json({ message: "You are not a member of this room" });

    member.travellingToday = travellingToday;
    member.reachedSafely = false;

    if (travellingToday) {
      if (!room.activeTravellers.includes(userId)) {
        room.activeTravellers.push(userId);
      }
    } else {
      room.activeTravellers = room.activeTravellers.filter(t => t.toString() !== userId.toString());
    }

    await room.save();
    res.status(200).json(room.members);
  } catch (error) {
    console.error("Error in markTravellingToday:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /rooms/:id/reached
export const markReachedSafely = async (req, res) => {
  try {
    const { id } = req.params;
    const { reached } = req.body;
    const userId = req.user.id;

    const room = await Room.findOne({ roomId: id });
    if (!room) return res.status(404).json({ message: "Room not found" });

    const member = room.members.find(m => m.userId.toString() === userId.toString());
    if (!member) return res.status(403).json({ message: "You are not a member of this room" });

    member.reachedSafely = reached;
    
    if (reached) {
      member.travellingToday = false;
      room.activeTravellers = room.activeTravellers.filter(t => t.toString() !== userId.toString());
    }

    await room.save();
    res.status(200).json(room.members);
  } catch (error) {
    console.error("Error in markReachedSafely:", error);
    res.status(500).json({ message: "Server error" });
  }
};
