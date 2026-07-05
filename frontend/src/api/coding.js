import api from "./axios";

export const codingApi = {
  listProblems: (params) => api.get("/problems", { params }),
  getProblem: (id) => api.get(`/problems/${id}`),
  submitAttempt: (problemId, data) => api.post(`/problems/${problemId}/attempt`, data),
  myAttempts: () => api.get("/problems/attempts/my"),
  getDiscussion: (problemId) => api.get(`/problems/${problemId}/discussion`),
  postComment: (problemId, content) =>
    api.post(`/problems/${problemId}/discussion`, { content }),
};
