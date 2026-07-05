import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { quizApi } from "../../api/quiz";
import { useAuthStore } from "../../store/authStore";
import Spinner from "../../components/shared/Spinner";
import toast from "react-hot-toast";

export default function QuizTakePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const { data: quiz, isLoading: loadingQuiz } = useQuery({
    queryKey: ["quiz", id],
    queryFn: () => quizApi.get(id).then((r) => r.data),
  });

  const { data: questions, isLoading: loadingQ } = useQuery({
    queryKey: ["quizQuestions", id],
    queryFn: () => quizApi.getQuestions(id).then((r) => r.data),
  });

  const { data: reattemptData } = useQuery({
    queryKey: ["canReattempt", id],
    queryFn: () => quizApi.canReattempt(id).then((r) => r.data),
  });

  useEffect(() => {
    if (quiz?.durationMinutes) {
      setTimeLeft(quiz.durationMinutes * 60);
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft === null || showResult) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, showResult]);

  const submitMutation = useMutation({
    mutationFn: () => quizApi.submit(id, answers).then((r) => r.data),
    onSuccess: (data) => { setResult(data); setShowResult(true); },
    onError: (e) => toast.error(e.response?.data?.message || "Submit failed"),
  });

  const handleSubmit = useCallback(() => {
    if (!submitMutation.isPending) submitMutation.mutate();
  }, [answers]);

  if (loadingQuiz || loadingQ) return <Spinner />;
  if (!quiz || !questions) return <div className="text-center text-gray-500 py-20">Quiz not found.</div>;

  if (reattemptData?.canReattempt === false) {
    return (
      <div className="max-w-lg mx-auto card text-center py-16">
        <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Quiz Already Passed!</h2>
        <p className="text-gray-500 mb-6">You've already passed this quiz. No more attempts needed.</p>
        <button onClick={() => navigate("/quizzes")} className="btn-primary">Back to Quizzes</button>
      </div>
    );
  }

  if (showResult && result) {
    const passed = result.passed;
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className={`card text-center py-10 border-2 ${passed ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"}`}>
          {passed
            ? <CheckCircle size={56} className="mx-auto mb-4 text-green-500" />
            : <XCircle size={56} className="mx-auto mb-4 text-red-500" />}
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{passed ? "Passed! 🎉" : "Failed"}</h2>
          <p className="text-gray-600 mb-6">{passed ? "Great job! You cleared this quiz." : "Don't give up — you can retry!"}</p>
          <div className="flex justify-center gap-8 mb-6">
            <div>
              <div className="text-3xl font-bold text-gray-900">{result.score}/{result.totalMarks}</div>
              <div className="text-sm text-gray-500">Score</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${passed ? "text-green-600" : "text-red-600"}`}>{result.percentage}%</div>
              <div className="text-sm text-gray-500">Percentage</div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            {!passed && (
              <button onClick={() => { setShowResult(false); setAnswers({}); setCurrent(0); setTimeLeft(quiz.durationMinutes ? quiz.durationMinutes * 60 : null); }}
                className="btn-primary">Retry Quiz</button>
            )}
            <button onClick={() => navigate("/quizzes")} className="btn-secondary">Back to Quizzes</button>
          </div>
        </div>

        {/* Answer review */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Answer Review</h3>
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const submitted = answers[String(q.id)];
              const correct = submitted?.toLowerCase() === q.correctAnswer?.toLowerCase();
              return (
                <div key={q.id} className={`p-3 rounded-lg border ${correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                  <p className="text-sm font-medium text-gray-800 mb-2">{idx + 1}. {q.questionText}</p>
                  <p className="text-xs text-gray-600">Your answer: <span className={`font-semibold ${correct ? "text-green-700" : "text-red-700"}`}>{submitted ?? "Not answered"}</span></p>
                  {!correct && <p className="text-xs text-green-700 mt-1">Correct: <span className="font-semibold">{q.correctAnswer}</span></p>}
                  {q.explanation && <p className="text-xs text-gray-500 mt-1 italic">{q.explanation}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const options = q.options ?? (q.optionsJson ? JSON.parse(q.optionsJson) : []);
  const mins = timeLeft !== null ? Math.floor(timeLeft / 60) : null;
  const secs = timeLeft !== null ? timeLeft % 60 : null;
  const answered = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="card flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-sm text-gray-500">{answered}/{questions.length} answered</p>
        </div>
        {timeLeft !== null && (
          <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-lg ${timeLeft < 60 ? "bg-red-100 text-red-700" : "bg-primary-50 text-primary-700"}`}>
            <Clock size={18} />
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className="bg-primary-600 h-1.5 rounded-full transition-all"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="card space-y-5">
        <div className="flex items-start gap-3">
          <span className="bg-primary-100 text-primary-700 font-bold text-sm px-2.5 py-1 rounded-lg flex-shrink-0">
            Q{current + 1}
          </span>
          <p className="text-gray-900 font-medium leading-relaxed">{q.questionText}</p>
        </div>

        {/* MCQ options */}
        {(q.type === "MCQ" || options.length > 0) && (
          <div className="space-y-2">
            {options.map((opt, i) => {
              const selected = answers[String(q.id)] === opt;
              return (
                <button key={i} onClick={() => setAnswers({ ...answers, [String(q.id)]: opt })}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    selected ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 hover:border-primary-300 hover:bg-gray-50 text-gray-700"
                  }`}>
                  <span className="font-bold mr-3">{String.fromCharCode(65 + i)}.</span>{opt}
                </button>
              );
            })}
          </div>
        )}

        {/* True/False */}
        {q.type === "TRUE_FALSE" && (
          <div className="flex gap-3">
            {["True", "False"].map((opt) => (
              <button key={opt} onClick={() => setAnswers({ ...answers, [String(q.id)]: opt })}
                className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-all ${
                  answers[String(q.id)] === opt ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 hover:border-primary-300 text-gray-700"
                }`}>{opt}</button>
            ))}
          </div>
        )}

        {/* Short answer */}
        {q.type === "SHORT_ANSWER" && (
          <input className="input" placeholder="Type your answer..."
            value={answers[String(q.id)] ?? ""}
            onChange={(e) => setAnswers({ ...answers, [String(q.id)]: e.target.value })} />
        )}
      </div>

      {/* Question nav dots */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {questions.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
              i === current ? "bg-primary-600 text-white"
              : answers[String(questions[i].id)] ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}>{i + 1}</button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrent((c) => c - 1)} disabled={current === 0} className="btn-secondary flex items-center gap-2">
          <ChevronLeft size={16} /> Previous
        </button>
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent((c) => c + 1)} className="btn-primary flex items-center gap-2">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitMutation.isPending}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
            {submitMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}
