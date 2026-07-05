import api from "./axios";

export const chatApi = {
  getOrCreateRoom: (tutorId) => api.post("/chat/rooms", { tutorId }),
  myRooms: () => api.get("/chat/rooms"),
  getMessages: (roomId) => api.get(`/chat/rooms/${roomId}/messages`),
  sendMessage: (roomId, content) =>
    api.post(`/chat/rooms/${roomId}/send`, { content }),
};
