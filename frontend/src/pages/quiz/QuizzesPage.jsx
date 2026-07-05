import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trophy, Clock, CheckCircle, Play, BarChart2 } from "lucide-react";
import { quizApi } from "../../api/quiz";
import { useAuthStore } from "../../store/authStore";
import Spinner from "../../components/shared/Spinner";
import toast from "react-hot-toast";

export default function QuizzesPage() {
  const { hasRole } = useAuthStore();
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["quizzes"],
    queryFn: () => quizApi.list().then((r) => r.data?.content ?? r.data),
  });

  const { data: attempts } = useQuery({
    queryKey: ["myQuizAttempts"],
    queryFn: () => quizApi.myAttempts().then((r) => r.data),
  });

  const attemptedIds = new Set(attempts?.map((a) => a.quizId));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
          <p className="text-gray-500 mt-1">Test your knowledge — 5 questions · 5 minute timer</p>
        </div>
        <div className="flex gap-2">
          {hasRole("ROLE_INSTRUCTOR") && (
            <Link to="/instructor" className="btn-primary text-sm flex items-center gap-2">
              + Create Quiz
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      {attempts?.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900">{attempts.length}</div>
            <div className="text-sm text-gray-500">Attempts</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">
              {attempts.filter((a) => a.passed).length}
            </div>
            <div className="text-sm text-gray-500">Passed</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary-600">
              {attempts.length > 0
                ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
                : 0}%
            </div>
            <div className="text-sm text-gray-500">Avg Score</div>
          </div>
        </div>
      )}

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes?.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} attempted={attemptedIds.has(quiz.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function QuizCard({ quiz, attempted }) {
  return (
    <div className="card hover:shadow-md transition-shadow space-y-4">
      <div className="flex items-start justify-between">
        <div className="bg-yellow-50 text-yellow-600 p-2 rounded-lg">
          <Trophy size={20} />
        </div>
        {attempted && (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle size={12} /> Attempted
          </span>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
        {quiz.topic && <p className="text-xs text-gray-500 mt-0.5">{quiz.topic}</p>}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
          <Clock size={11} /> {quiz.durationMinutes ?? 5} min
        </span>
        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">
          {quiz.questionsCount ?? "5"} questions
        </span>
        {quiz.passingScore && (
          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
            Pass: {quiz.passingScore}%
          </span>
        )}
      </div>
      <Link
        to={`/quizzes/${quiz.id}`}
        className="btn-primary w-full text-sm flex items-center justify-center gap-2"
      >
        <Play size={14} /> {attempted ? "Retake Quiz" : "Start Quiz"}
      </Link>
    </div>
  );
}
