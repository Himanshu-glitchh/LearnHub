import api from "./axios";

export const quizApi = {
  list: (params) => api.get("/quizzes", { params }),
  get: (id) => api.get(`/quizzes/${id}`),
  getQuestions: (id) => api.get(`/quizzes/${id}/questions`),
  create: (data, courseId) => api.post(`/quizzes${courseId ? `?courseId=${courseId}` : ""}`, data),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  delete: (id) => api.delete(`/quizzes/${id}`),
  addQuestion: (quizId, data) => api.post(`/quizzes/${quizId}/questions`, data),
  deleteQuestion: (quizId, questionId) => api.delete(`/quizzes/${quizId}/questions/${questionId}`),
  submit: (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, answers),
  myAttempts: () => api.get("/quizzes/attempts/my"),
  leaderboard: (quizId) => api.get(`/quizzes/${quizId}/leaderboard`),
  canReattempt: (quizId) => api.get(`/quizzes/${quizId}/can-reattempt`),
};
