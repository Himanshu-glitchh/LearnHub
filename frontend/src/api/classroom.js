import api from "./axios";

export const classroomApi = {
  list: () => api.get("/classrooms/my"),
  get: (id) => api.get(`/classrooms/${id}`),
  create: (data) => api.post("/classrooms", data),
  join: (joinCode) => api.post("/classrooms/join", { joinCode }),
  getAssignments: (classroomId) => api.get(`/classrooms/${classroomId}/assignments`),
  createAssignment: (classroomId, data) =>
    api.post(`/classrooms/${classroomId}/assignments`, data),
  submitAssignment: (assignmentId, data) =>
    api.post(`/assignments/${assignmentId}/submit`, data),
  gradeSubmission: (submissionId, data) =>
    api.patch(`/submissions/${submissionId}/grade`, data),
};
