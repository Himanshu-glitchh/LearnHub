import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/shared/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import CoursesPage from "./pages/courses/CoursesPage";
import CourseDetailPage from "./pages/courses/CourseDetailPage";
import QuizzesPage from "./pages/quiz/QuizzesPage";
import QuizTakePage from "./pages/quiz/QuizTakePage";
import CodingPage from "./pages/coding/CodingPage";
import ProblemDetailPage from "./pages/coding/ProblemDetailPage";
import ClassroomsPage from "./pages/classroom/ClassroomsPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import InstructorHub from "./pages/instructor/InstructorHub";
import ChatPage from "./pages/chat/ChatPage";
import ClassroomDetailPage from "./pages/classroom/ClassroomDetailPage";
import ProfilePage from "./pages/profile/ProfilePage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 30 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/problems" element={<CodingPage />} />
            <Route path="/problems/:id" element={<ProblemDetailPage />} />
            {/* Protected — any logged-in user */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/quizzes" element={<QuizzesPage />} />
              <Route path="/quizzes/:id" element={<QuizTakePage />} />
              <Route path="/classrooms" element={<ClassroomsPage />} />
              <Route path="/classrooms/:id" element={<ClassroomDetailPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Instructor only */}
            <Route element={<ProtectedRoute roles={["ROLE_INSTRUCTOR"]} />}>
              <Route path="/instructor" element={<InstructorHub />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </QueryClientProvider>
  );
}
