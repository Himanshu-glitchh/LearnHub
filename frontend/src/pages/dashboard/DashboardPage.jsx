import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BookOpen, Trophy, Calendar, Code2, ArrowRight, TrendingUp } from "lucide-react";
import CourseThumbnail from "../../components/shared/CourseThumbnail";
import { useAuthStore } from "../../store/authStore";
import { coursesApi } from "../../api/courses";
import { quizApi } from "../../api/quiz";
import Spinner from "../../components/shared/Spinner";

export default function DashboardPage() {
  const { user, hasRole } = useAuthStore();

  const { data: enrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ["myEnrollments"],
    queryFn: () => coursesApi.myEnrollments().then((r) => r.data),
  });

  const { data: attempts } = useQuery({
    queryKey: ["myQuizAttempts"],
    queryFn: () => quizApi.myAttempts().then((r) => r.data),
  });

  const quickLinks = [
    { to: "/courses", icon: BookOpen, label: "Browse Courses", color: "bg-blue-500" },
    { to: "/quizzes", icon: Trophy, label: "Take a Quiz", color: "bg-yellow-500" },
    { to: "/classrooms", icon: Calendar, label: "My Classrooms", color: "bg-purple-500" },
    { to: "/problems", icon: Code2, label: "Coding Prep", color: "bg-green-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="card bg-gradient-to-r from-primary-600 to-accent-600 text-white border-0">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.fullName?.split(" ")[0]}! 👋</h1>
        <p className="text-primary-100 text-sm">
          {hasRole("ROLE_INSTRUCTOR") ? "Ready to inspire learners today?" : "Keep up the great work!"}
        </p>
        <div className="flex gap-4 mt-4">
          <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
            <div className="text-xl font-bold">{enrollments?.length ?? 0}</div>
            <div className="text-xs text-primary-100">Enrolled Courses</div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
            <div className="text-xl font-bold">{attempts?.length ?? 0}</div>
            <div className="text-xs text-primary-100">Quizzes Taken</div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2 text-center">
            <div className="text-xl font-bold">
              {enrollments?.filter((e) => e.completed).length ?? 0}
            </div>
            <div className="text-xs text-primary-100">Completed</div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to}
              className="card hover:shadow-md transition-shadow flex flex-col items-center text-center gap-3 py-6">
              <div className={`${color} text-white w-10 h-10 rounded-xl flex items-center justify-center`}>
                <Icon size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* My Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
          <Link to="/courses" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
            Browse more <ArrowRight size={14} />
          </Link>
        </div>

        {loadingEnrollments ? (
          <Spinner />
        ) : enrollments?.length === 0 ? (
          <div className="card text-center text-gray-500 py-10">
            <BookOpen size={32} className="mx-auto mb-2 text-gray-300" />
            <p>You haven't enrolled in any courses yet.</p>
            <Link to="/courses" className="btn-primary mt-4 inline-block text-sm">Explore Courses</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments?.slice(0, 6).map((e) => (
              <Link key={e.id} to={`/courses/${e.courseId ?? e.course?.id}`}
                className="card hover:shadow-md transition-shadow block p-0 overflow-hidden rounded-xl">
                <CourseThumbnail title={e.courseTitle ?? e.course?.title ?? ""} category={e.course?.category ?? ""} size="sm" />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 truncate text-sm">{e.courseTitle ?? e.course?.title}</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <TrendingUp size={12} /> {e.progressPercent ?? 0}% complete
                    </span>
                    {e.completed && <span className="badge-easy text-xs">✓ Done</span>}
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-primary-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${e.progressPercent ?? 0}%` }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Instructor panel */}
      {hasRole("ROLE_INSTRUCTOR") && (
        <div className="card border-accent-500 border">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Instructor Hub</h2>
          <p className="text-sm text-gray-500 mb-4">Manage your courses, students, and classrooms.</p>
          <Link to="/instructor" className="btn-primary inline-flex items-center gap-2 text-sm">
            Go to Instructor Hub <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
