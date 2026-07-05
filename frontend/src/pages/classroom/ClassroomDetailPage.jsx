import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, BookOpen, Trophy, Plus, Trash2, Upload, Send,
  CheckCircle, Clock, FileText, Loader2, ChevronDown, ChevronUp,
  Star, ExternalLink, Pencil, X, Key
} from "lucide-react";
import { classroomApi } from "../../api/classroom";
import { quizApi } from "../../api/quiz";
import { filesApi } from "../../api/files";
import api from "../../api/axios";
import { useAuthStore } from "../../store/authStore";
import Spinner from "../../components/shared/Spinner";
import toast from "react-hot-toast";

const TABS = [
  { key: "students", label: "Students", icon: Users },
  { key: "assignments", label: "Assignments", icon: BookOpen },
  { key: "quizzes", label: "Quizzes", icon: Trophy },
];

export default function ClassroomDetailPage() {
  const { id } = useParams();
  const { hasRole, user } = useAuthStore();
  const isInstructor = hasRole("ROLE_INSTRUCTOR");
  const [tab, setTab] = useState("students");

  const { data: classroom, isLoading } = useQuery({
    queryKey: ["classroom", id],
    queryFn: () => api.get(`/classrooms/${id}`).then((r) => r.data),
  });

  if (isLoading) return <Spinner />;
  if (!classroom) return <div className="text-center py-20 text-gray-500">Classroom not found.</div>;

  const isOwner = classroom.instructor?.id === user?.userId;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full translate-x-10 -translate-y-10" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-200 text-sm mb-1">Classroom</p>
              <h1 className="text-3xl font-bold mb-2">{classroom.name}</h1>
              {classroom.description && <p className="text-purple-100 max-w-xl">{classroom.description}</p>}
            </div>
          </div>
          <div className="flex gap-5 mt-4 text-sm text-purple-200">
            <span className="flex items-center gap-1"><Users size={14} /> {classroom.students?.length ?? 0} students</span>
            <span className="flex items-center gap-1"><BookOpen size={14} /> {classroom.assignments?.length ?? 0} assignments</span>
            <span>by {classroom.instructor?.fullName}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === key ? "border-purple-600 text-purple-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === "students" && <StudentsTab classroom={classroom} isOwner={isOwner} classroomId={id} />}
      {tab === "assignments" && <AssignmentsTab classroom={classroom} isOwner={isOwner} classroomId={id} userId={user?.userId} />}
      {tab === "quizzes" && <QuizzesTab classroom={classroom} isOwner={isOwner} classroomId={id} />}
    </div>
  );
}

/* ── STUDENTS TAB ──────────────────────────────── */
function StudentsTab({ classroom, isOwner, classroomId }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch students enrolled in instructor's courses — ready-made pool to pick from
  const { data: enrolledStudents } = useQuery({
    queryKey: ["instructorEnrollments"],
    queryFn: () => api.get("/courses/enrollments/instructor").then((r) => r.data),
    enabled: isOwner,
  });

  // Unique students from enrollments not already in classroom
  const alreadyIn = new Set((classroom.students ?? []).map((s) => s.id));
  const pool = [];
  const seen = new Set();
  (enrolledStudents ?? []).forEach((e) => {
    const s = e.student;
    if (s && !alreadyIn.has(s.id) && !seen.has(s.id)) {
      seen.add(s.id);
      pool.push(s);
    }
  });
  const filtered = search
    ? pool.filter((s) => s.fullName?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()))
    : pool;

  const addMutation = useMutation({
    mutationFn: (studentId) => api.post(`/classrooms/${classroomId}/students`, { studentId }),
    onSuccess: () => { toast.success("Student added!"); setSelectedStudent(null); setSearch(""); queryClient.invalidateQueries(["classroom", classroomId]); queryClient.invalidateQueries(["instructorEnrollments"]); },
    onError: () => toast.error("Failed to add"),
  });

  const addByEmail = useMutation({
    mutationFn: async () => {
      const user = await api.get(`/users/search?email=${search}`).then((r) => r.data);
      return api.post(`/classrooms/${classroomId}/students`, { studentId: user.id });
    },
    onSuccess: () => { toast.success("Student added!"); setSearch(""); queryClient.invalidateQueries(["classroom", classroomId]); },
    onError: () => toast.error("No user found with that email"),
  });

  const removeMutation = useMutation({
    mutationFn: (studentId) => api.delete(`/classrooms/${classroomId}/students/${studentId}`),
    onSuccess: () => { toast.success("Removed!"); queryClient.invalidateQueries(["classroom", classroomId]); },
  });

  const students = classroom.students ?? [];

  return (
    <div className="space-y-4">
      {isOwner && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2"><Plus size={16} /> Add Students</h3>
          <p className="text-xs text-gray-400 mb-3">Students enrolled in your courses are shown below. Search by name or email.</p>

          <div className="relative mb-3">
            <input className="input pr-4" placeholder="Search by name or email..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {/* Pool of students from instructor's courses */}
          {filtered.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
              <div className="bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 border-b border-primary-100">
                {filtered.length} student{filtered.length !== 1 ? "s" : ""} from your courses
              </div>
              <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
                {filtered.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {s.fullName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{s.fullName}</p>
                      <p className="text-xs text-gray-400 truncate">{s.email}</p>
                    </div>
                    <button onClick={() => addMutation.mutate(s.id)} disabled={addMutation.isPending}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 flex-shrink-0">
                      <Plus size={11} /> Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fallback: add by exact email */}
          {filtered.length === 0 && search && (
            <div className="flex gap-2 items-center p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-500 flex-1">No match found. Add by exact email:</p>
              <button onClick={() => addByEmail.mutate()} disabled={addByEmail.isPending}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                {addByEmail.isPending ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />} Add "{search}"
              </button>
            </div>
          )}

          {pool.length === 0 && !search && (
            <p className="text-sm text-gray-400 text-center py-2">
              No students have enrolled in your courses yet. Share your courses first.
            </p>
          )}
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Enrolled Students</h3>
          <span className="text-sm text-gray-500">{students.length} student{students.length !== 1 ? "s" : ""}</span>
        </div>
        {students.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Users size={32} className="mx-auto mb-2 text-gray-200" />
            <p>No students yet. {isOwner ? "Add students via email or share the join code." : "Be the first to join!"}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {students.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center flex-shrink-0">
                  {s.fullName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{s.fullName}</p>
                  <p className="text-xs text-gray-400">{s.email}</p>
                </div>
                {isOwner && (
                  <button onClick={() => { if (window.confirm(`Remove ${s.fullName}?`)) removeMutation.mutate(s.id); }}
                    className="text-red-400 hover:text-red-600 p-1">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ASSIGNMENTS TAB ────────────────────────────── */
function AssignmentsTab({ classroom, isOwner, classroomId, userId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submitting, setSubmitting] = useState(null);

  const { data: allQuizzes } = useQuery({
    queryKey: ["allQuizzes"],
    queryFn: () => quizApi.list().then((r) => r.data),
    enabled: isOwner,
  });
  const [subContent, setSubContent] = useState("");
  const [subFileUrl, setSubFileUrl] = useState("");
  const subFileRef = useRef(null);
  const [grading, setGrading] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marks: "", feedback: "" });

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["classroomAssignments", classroomId],
    queryFn: () => api.get(`/classrooms/${classroomId}/assignments`).then((r) => r.data),
  });

  const { data: mySubmissions } = useQuery({
    queryKey: ["mySubmissions"],
    queryFn: () => api.get("/classrooms/submissions/my").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => api.post(`/classrooms/${classroomId}/assignments`, { ...form, fileUrl: uploadedFile?.url }),
    onSuccess: () => { toast.success("Assignment created!"); queryClient.invalidateQueries(["classroomAssignments", classroomId]); setShowForm(false); setForm({ title: "", description: "", dueDate: "", maxMarks: 100 }); setUploadedFile(null); },
    onError: () => toast.error("Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/classrooms/assignments/${id}`),
    onSuccess: () => { toast.success("Deleted!"); queryClient.invalidateQueries(["classroomAssignments", classroomId]); },
  });

  const submitMutation = useMutation({
    mutationFn: ({ assignmentId, content, fileUrl }) =>
      api.post(`/classrooms/assignments/${assignmentId}/submit`, { content, fileUrl }),
    onSuccess: () => { toast.success("Submitted!"); setSubmitting(null); setSubContent(""); setSubFileUrl(""); queryClient.invalidateQueries(["mySubmissions"]); },
    onError: () => toast.error("Submission failed"),
  });

  const gradeMutation = useMutation({
    mutationFn: ({ subId, marks, feedback }) =>
      api.patch(`/classrooms/submissions/${subId}/grade`, { marks: Number(marks), feedback }),
    onSuccess: () => { toast.success("Graded!"); setGrading(null); queryClient.invalidateQueries(["classroomAssignments", classroomId]); },
    onError: () => toast.error("Grade failed"),
  });

  const handleAttachUpload = async (e, setUrl) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadProgress(1);
    try {
      const res = await filesApi.upload(file, setUploadProgress);
      const base = (import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1").replace(/\/api\/v1\/?$/, "");
      setUrl(`${base}${res.data.url}`);
      toast.success("File attached!");
    } catch { toast.error("Upload failed"); }
    finally { setUploadProgress(0); }
  };

  const mySubMap = (mySubmissions ?? []).reduce((acc, s) => {
    const aid = s.assignment?.id ?? s.assignmentId;
    if (aid) acc[aid] = s;
    return acc;
  }, {});

  const statusColors = {
    SUBMITTED: "bg-blue-100 text-blue-700",
    GRADED: "bg-green-100 text-green-700",
    LATE: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="space-y-4">
      {isOwner && (
        <div className="flex justify-end">
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={14} /> New Assignment
          </button>
        </div>
      )}

      {/* Create form */}
      {showForm && isOwner && (
        <AssignmentCreateForm
          classroomId={classroomId}
          allQuizzes={allQuizzes}
          fileInputRef={fileInputRef}
          uploadedFile={uploadedFile}
          setUploadedFile={setUploadedFile}
          uploadProgress={uploadProgress}
          handleAttachUpload={handleAttachUpload}
          onSuccess={() => { queryClient.invalidateQueries(["classroomAssignments", classroomId]); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {isLoading ? <Spinner /> : assignments?.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <BookOpen size={40} className="mx-auto mb-2 text-gray-200" />
          <p>{isOwner ? "No assignments yet. Create one above." : "No assignments yet."}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments?.map((a) => {
            const mySub = mySubMap[a.id];
            const isExpanded = expandedAssignment === a.id;
            const isOverdue = a.dueDate && new Date(a.dueDate) < new Date();
            return (
              <div key={a.id} className="card overflow-hidden p-0">
                {/* Assignment header */}
                <div className="px-5 py-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900">{a.title}</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {mySub && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[mySub.status]}`}>{mySub.status}</span>}
                        {isOwner && (
                          <button onClick={() => { if (window.confirm("Delete assignment?")) deleteMutation.mutate(a.id); }}
                            className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>Max: {a.maxMarks} marks</span>
                      {a.dueDate && (
                        <span className={`flex items-center gap-1 ${isOverdue ? "text-red-500" : "text-gray-400"}`}>
                          <Clock size={11} /> Due: {new Date(a.dueDate).toLocaleString()}
                          {isOverdue && " (Overdue)"}
                        </span>
                      )}
                      {mySub?.marksObtained != null && (
                        <span className="text-green-600 font-semibold">✅ {mySub.marksObtained}/{a.maxMarks} marks</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 pb-3 flex gap-2 flex-wrap">
                  {!isOwner && (() => {
                    const isQuizBased = a.description?.startsWith("[QUIZ]");
                    const quizId = isQuizBased ? a.description?.match(/Quiz ID: (\d+)/)?.[1] : null;
                    if (isQuizBased && quizId) {
                      return (
                        <Link to={`/quizzes/${quizId}`}
                          className="text-xs btn-primary px-3 py-1.5 flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 border-yellow-500">
                          <Trophy size={12} /> Take Quiz →
                        </Link>
                      );
                    }
                    return (
                      <button onClick={() => setSubmitting(submitting === a.id ? null : a.id)}
                        className="text-xs btn-primary px-3 py-1.5 flex items-center gap-1">
                        <Send size={12} /> {mySub ? "Update Submission" : "Submit Work"}
                      </button>
                    );
                  })()}
                  {isOwner && (
                    <button onClick={() => setExpandedAssignment(isExpanded ? null : a.id)}
                      className="text-xs btn-secondary px-3 py-1.5 flex items-center gap-1">
                      <Users size={12} /> View Submissions {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  )}
                </div>

                {/* Student submission form — only for description assignments */}
                {!isOwner && submitting === a.id && !a.description?.startsWith("[QUIZ]") && (
                  <div className="px-5 pb-4 pt-2 border-t border-gray-100 space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">Your Submission</h4>
                    <div>
                      <label className="label">Answer / Notes</label>
                      <textarea className="input resize-none" rows={4} placeholder="Write your answer or notes here..."
                        value={subContent} onChange={(e) => setSubContent(e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Attach File (PDF/Video)</label>
                      {subFileUrl ? (
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle size={14} className="text-green-600" />
                          <span className="text-xs text-green-700 flex-1 truncate">File attached</span>
                          <button onClick={() => setSubFileUrl("")} className="text-green-600"><X size={12} /></button>
                        </div>
                      ) : (
                        <div onClick={() => subFileRef.current?.click()}
                          className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center cursor-pointer hover:border-purple-300 transition-colors">
                          <Upload size={16} className="mx-auto mb-1 text-gray-400" />
                          <p className="text-xs text-gray-400">Upload PDF / Video</p>
                          <input ref={subFileRef} type="file" className="hidden" accept=".pdf,video/*"
                            onChange={(e) => handleAttachUpload(e, setSubFileUrl)} />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => submitMutation.mutate({ assignmentId: a.id, content: subContent, fileUrl: subFileUrl })}
                        disabled={(!subContent && !subFileUrl) || submitMutation.isPending}
                        className="btn-primary text-sm flex items-center gap-2">
                        {submitMutation.isPending && <Loader2 size={14} className="animate-spin" />} Submit
                      </button>
                      <button onClick={() => setSubmitting(null)} className="btn-secondary text-sm">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Instructor: view submissions */}
                {isOwner && isExpanded && (
                  <SubmissionsView assignmentId={a.id} maxMarks={a.maxMarks} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── ASSIGNMENT CREATE FORM ─────────────────────── */
function AssignmentCreateForm({ classroomId, allQuizzes, fileInputRef, uploadedFile, setUploadedFile, uploadProgress, handleAttachUpload, onSuccess, onCancel }) {
  const [assignType, setAssignType] = useState(null); // null | "description" | "quiz"
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", maxMarks: 100 });
  const [selectedQuizId, setSelectedQuizId] = useState("");

  const createMutation = useMutation({
    mutationFn: () => api.post(`/classrooms/${classroomId}/assignments`, {
      title: form.title || (assignType === "quiz" ? allQuizzes?.find((q) => q.id === Number(selectedQuizId))?.title : ""),
      description: assignType === "quiz"
        ? `[QUIZ] Quiz ID: ${selectedQuizId}`
        : form.description,
      dueDate: form.dueDate || null,
      maxMarks: form.maxMarks,
      fileUrl: uploadedFile?.url,
    }),
    onSuccess: () => { onSuccess(); },
    onError: () => toast.error("Failed to create"),
  });

  const selectedQuiz = allQuizzes?.find((q) => q.id === Number(selectedQuizId));

  if (!assignType) return (
    <div className="card border-purple-200 border space-y-4">
      <h3 className="font-semibold text-gray-900">What type of assignment?</h3>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setAssignType("description")}
          className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-left group">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <FileText size={24} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Description / PDF</p>
            <p className="text-xs text-gray-500 mt-0.5">Write instructions + optionally attach a PDF or video. Students submit text or upload a file.</p>
          </div>
        </button>
        <button onClick={() => setAssignType("quiz")}
          className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-all text-left group">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
            <Trophy size={24} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Quiz Based</p>
            <p className="text-xs text-gray-500 mt-0.5">Link an existing quiz. Students click to take it with a timer and get auto-graded.</p>
          </div>
        </button>
      </div>
      <button onClick={onCancel} className="btn-secondary text-sm">Cancel</button>
    </div>
  );

  return (
    <div className={`card border space-y-4 ${assignType === "quiz" ? "border-yellow-300 bg-yellow-50/30" : "border-purple-200"}`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${assignType === "quiz" ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600"}`}>
          {assignType === "quiz" ? <Trophy size={16} /> : <FileText size={16} />}
        </div>
        <h3 className="font-semibold text-gray-900">{assignType === "quiz" ? "Quiz-Based Assignment" : "Description Assignment"}</h3>
        <button onClick={() => setAssignType(null)} className="ml-auto text-xs text-gray-400 hover:text-gray-600">← Change type</button>
      </div>

      {assignType === "quiz" ? (
        <>
          <div>
            <label className="label">Select Quiz *</label>
            <select className="input" value={selectedQuizId} onChange={(e) => setSelectedQuizId(e.target.value)}>
              <option value="">Choose a quiz from your library...</option>
              {allQuizzes?.map((q) => (
                <option key={q.id} value={q.id}>{q.title} — {q.durationMinutes}min · Pass {q.passingScore}%</option>
              ))}
            </select>
          </div>

          {selectedQuiz && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-1">
              <p className="font-medium text-yellow-900">📋 {selectedQuiz.title}</p>
              <p className="text-sm text-yellow-700">{selectedQuiz.topic} · {selectedQuiz.durationMinutes} min · Passing score: {selectedQuiz.passingScore}%</p>
              <p className="text-xs text-yellow-600">Students will take this quiz directly and be auto-graded.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Assignment Title (optional)</label><input className="input" placeholder={selectedQuiz?.title || "e.g. Week 3 Quiz"} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="label">Due Date (optional)</label><input type="datetime-local" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
          </div>
        </>
      ) : (
        <>
          <div><label className="label">Title *</label><input className="input" placeholder="e.g. Week 1 Homework" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div>
            <label className="label">Instructions / Description</label>
            <textarea className="input resize-none" rows={4} placeholder="What should students do? Be specific about requirements, format, submission expectations..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Due Date (optional)</label><input type="datetime-local" className="input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
            <div><label className="label">Max Marks</label><input type="number" className="input" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} /></div>
          </div>

          {/* PDF attachment */}
          <div>
            <label className="label">Attach Resource PDF / Video (optional)</label>
            {uploadedFile ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm text-green-800 flex-1 truncate">{uploadedFile.name}</span>
                <button onClick={() => setUploadedFile(null)} className="text-green-600"><X size={14} /></button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                <Upload size={20} className="mx-auto mb-1 text-gray-400" />
                <p className="text-sm text-gray-500">Attach a PDF, document or video for students to reference</p>
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,video/*,.doc,.docx"
                  onChange={(e) => handleAttachUpload(e, (url) => setUploadedFile({ url, name: e.target.files[0]?.name }))} />
              </div>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2"><div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-purple-600 h-1.5 rounded-full" style={{ width: uploadProgress + "%" }} /></div></div>
            )}
          </div>
        </>
      )}

      <div className="flex gap-3">
        <button onClick={() => createMutation.mutate()}
          disabled={assignType === "quiz" ? !selectedQuizId : !form.title || createMutation.isPending}
          className="btn-primary text-sm flex items-center gap-2">
          {createMutation.isPending && <Loader2 size={14} className="animate-spin" />}
          {assignType === "quiz" ? "Assign Quiz" : "Create Assignment"}
        </button>
        <button onClick={onCancel} className="btn-secondary text-sm">Cancel</button>
      </div>
    </div>
  );
}

function SubmissionsView({ assignmentId, maxMarks }) {
  const queryClient = useQueryClient();
  const [grading, setGrading] = useState(null);
  const [gradeForm, setGradeForm] = useState({ marks: "", feedback: "" });

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["submissions", assignmentId],
    queryFn: () => api.get(`/classrooms/assignments/${assignmentId}/submissions`).then((r) => r.data),
  });

  const gradeMutation = useMutation({
    mutationFn: ({ subId }) => api.patch(`/classrooms/submissions/${subId}/grade`, { marks: Number(gradeForm.marks), feedback: gradeForm.feedback }),
    onSuccess: () => { toast.success("Graded!"); setGrading(null); queryClient.invalidateQueries(["submissions", assignmentId]); },
    onError: () => toast.error("Failed"),
  });

  if (isLoading) return <div className="p-4"><Spinner size="sm" /></div>;

  const statusColors = { SUBMITTED: "bg-blue-100 text-blue-700", GRADED: "bg-green-100 text-green-700", LATE: "bg-yellow-100 text-yellow-700" };

  return (
    <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">Submissions ({submissions?.length ?? 0})</h4>
      {submissions?.length === 0 && <p className="text-sm text-gray-400">No submissions yet.</p>}
      {submissions?.map((sub) => (
        <div key={sub.id} className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">{sub.student?.fullName?.charAt(0)}</div>
              <div>
                <p className="text-sm font-medium text-gray-900">{sub.student?.fullName}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[sub.status]}`}>{sub.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {sub.marksObtained != null && <span className="text-sm font-bold text-green-700">{sub.marksObtained}/{maxMarks}</span>}
              <button onClick={() => { setGrading(sub.id); setGradeForm({ marks: sub.marksObtained ?? "", feedback: sub.feedback ?? "" }); }}
                className="text-xs btn-secondary px-2.5 py-1.5 flex items-center gap-1">
                <Star size={11} /> Grade
              </button>
            </div>
          </div>
          {sub.content && <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-2">{sub.content}</p>}
          {sub.fileUrl && (
            <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline mt-1 flex items-center gap-1">
              <FileText size={11} /> View attached file
            </a>
          )}
          {sub.feedback && <p className="text-xs text-gray-500 mt-1 italic">Feedback: {sub.feedback}</p>}

          {grading === sub.id && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <div className="flex gap-2">
                <div className="flex-1"><label className="label">Marks (/{maxMarks})</label><input type="number" className="input text-sm" max={maxMarks} value={gradeForm.marks} onChange={(e) => setGradeForm({ ...gradeForm, marks: e.target.value })} /></div>
              </div>
              <div><label className="label">Feedback</label><textarea className="input text-sm resize-none" rows={2} value={gradeForm.feedback} onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })} placeholder="Leave feedback for the student..." /></div>
              <div className="flex gap-2">
                <button onClick={() => gradeMutation.mutate({ subId: sub.id })} disabled={!gradeForm.marks || gradeMutation.isPending} className="btn-primary text-xs flex items-center gap-1">
                  {gradeMutation.isPending && <Loader2 size={11} className="animate-spin" />} Save Grade
                </button>
                <button onClick={() => setGrading(null)} className="btn-secondary text-xs">Cancel</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── QUIZZES TAB ────────────────────────────────── */
function QuizzesTab({ classroom, isOwner, classroomId }) {
  const queryClient = useQueryClient();
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(3);

  const { data: allQuizzes } = useQuery({
    queryKey: ["allQuizzes"],
    queryFn: () => quizApi.list().then((r) => r.data),
  });

  const { data: assignedQuizzes } = useQuery({
    queryKey: ["assignedQuizzes"],
    queryFn: () => api.get("/batches/assigned-quizzes").then((r) => r.data),
  });

  const assignMutation = useMutation({
    mutationFn: () => {
      const students = classroom.students ?? [];
      return Promise.all(students.map((s) =>
        api.post("/batches/assign-quiz-to-student", {
          studentId: s.id,
          quizId: Number(selectedQuizId),
          maxAttempts: Number(maxAttempts),
        })
      ));
    },
    onSuccess: () => {
      toast.success("Quiz assigned to all students!");
      queryClient.invalidateQueries(["assignedQuizzes"]);
      setSelectedQuizId("");
    },
    onError: () => toast.error("Failed to assign"),
  });

  return (
    <div className="space-y-4">
      {isOwner && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Trophy size={16} /> Assign Quiz to All Students</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="label">Select Quiz</label>
              <select className="input" value={selectedQuizId} onChange={(e) => setSelectedQuizId(e.target.value)}>
                <option value="">Choose a quiz...</option>
                {allQuizzes?.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Max Attempts</label>
              <input type="number" className="input" min={1} max={10} value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} />
            </div>
          </div>
          <button onClick={() => assignMutation.mutate()}
            disabled={!selectedQuizId || !classroom.students?.length || assignMutation.isPending}
            className="btn-primary text-sm mt-3 flex items-center gap-2">
            {assignMutation.isPending && <Loader2 size={14} className="animate-spin" />}
            <Trophy size={14} /> Assign to {classroom.students?.length ?? 0} Students
          </button>
          {!classroom.students?.length && <p className="text-xs text-yellow-600 mt-2">⚠️ Add students first before assigning quizzes.</p>}
        </div>
      )}

      {/* Available quizzes for students */}
      {!isOwner && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Your Assigned Quizzes</h3>
          <div className="space-y-3">
            {allQuizzes?.map((q) => (
              <div key={q.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{q.title}</p>
                  <p className="text-xs text-gray-500">{q.durationMinutes}min · Pass: {q.passingScore}%</p>
                </div>
                <Link to={`/quizzes/${q.id}`} className="btn-primary text-xs px-3 py-1.5">Take Quiz →</Link>
              </div>
            ))}
            {!allQuizzes?.length && <p className="text-sm text-gray-400">No quizzes available yet.</p>}
          </div>
        </div>
      )}

      {/* All quizzes list for instructor */}
      {isOwner && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">All Quizzes</h3>
          <div className="space-y-2">
            {allQuizzes?.map((q) => (
              <div key={q.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{q.title}</p>
                  <p className="text-xs text-gray-400">{q.topic} · {q.durationMinutes}min</p>
                </div>
                <span className="text-xs text-gray-400">{q.questionsCount ?? 0} questions</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
