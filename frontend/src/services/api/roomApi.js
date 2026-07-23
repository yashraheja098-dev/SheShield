import axiosInstance from './axiosInstance';

export const roomApi = {
  // Get all rooms (for global view)
  getAllRooms: () => axiosInstance.get('/rooms'),
  
  // Get rooms the user has joined
  getMyRooms: () => axiosInstance.get('/rooms/my'),
  
  // Get a specific room details
  getRoomById: (id) => axiosInstance.get(`/rooms/${id}`),
  
  // Create a new room
  createRoom: (data) => axiosInstance.post('/rooms', data),
  
  // Join a room
  joinRoom: (id, travelMode) => axiosInstance.post(`/rooms/${id}/join`, { travelMode }),
  
  // Leave a room
  leaveRoom: (id) => axiosInstance.post(`/rooms/${id}/leave`),
  
  // Get members of a room
  getRoomMembers: (id) => axiosInstance.get(`/rooms/${id}/members`),
  
  // Mark as travelling today
  markTravelling: (id, travellingToday) => axiosInstance.post(`/rooms/${id}/travelling`, { travellingToday }),
  
  // Mark as reached safely
  markReached: (id, reached) => axiosInstance.post(`/rooms/${id}/reached`, { reached }),
  
  // Get room messages
  getRoomMessages: (id) => axiosInstance.get(`/rooms/${id}/messages`),
};
