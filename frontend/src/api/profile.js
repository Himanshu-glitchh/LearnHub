import api from "./axios";

export const profileApi = {
  getMe: () => api.get("/users/me"),
  update: (data) => api.put("/users/me", data),
  changePassword: (data) => api.patch("/users/me/password", data),
};
