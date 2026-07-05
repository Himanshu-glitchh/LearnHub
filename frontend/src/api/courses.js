import api from "./axios";

export const coursesApi = {
  list: (params) => api.get("/courses", { params }),
  get: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post("/courses", data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  deleteSection: (courseId, sectionId) => api.delete(`/courses/${courseId}/sections/${sectionId}`),
  enroll: (courseId) => api.post(`/courses/${courseId}/enroll`),
  myEnrollments: () => api.get("/courses/enrollments/my"),
  instructorEnrollments: () => api.get("/courses/enrollments/instructor"),
  myCreated: () => api.get("/courses/my"),
  updateProgress: (courseId, lessonId) =>
    api.patch(`/courses/${courseId}/progress`, { lessonId }),
  addReview: (courseId, data) => api.post(`/courses/${courseId}/reviews`, data),
  getReviews: (courseId) => api.get(`/courses/${courseId}/reviews`),
};
