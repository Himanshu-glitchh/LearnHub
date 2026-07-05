import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Trophy, Users, Plus, Loader2, GraduationCap, Upload, Link2, X, CheckCircle, Pencil, Trash2, Save, BarChart2 } from "lucide-react";
import { coursesApi } from "../../api/courses";
import { quizApi } from "../../api/quiz";
import { useAuthStore } from "../../store/authStore";
import { filesApi } from "../../api/files";
import api from "../../api/axios";
import { useRef } from "react";
import Spinner from "../../components/shared/Spinner";
import CourseThumbnail from "../../components/shared/CourseThumbnail";
import toast from "react-hot-toast";

const TABS = [
  { key: "courses", label: "My Courses", icon: BookOpen },
  { key: "quizzes", label: "My Quizzes", icon: Trophy },
  { key: "batches", label: "Batches", icon: Users },
  { key: "enrollments", label: "Enrollments", icon: GraduationCap },
  { key: "attempts", label: "Quiz Attempts", icon: BarChart2 },
];

export default function InstructorHub() {
  const [tab, setTab] = useState("courses");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Instructor Hub</h1>
        <p className="text-gray-500 mt-1">Manage your courses, quizzes, and student batches</p>
      </div>
      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === key ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>
      {tab === "courses" && <CoursesTab />}
      {tab === "quizzes" && <QuizzesTab />}
      {tab === "batches" && <BatchesTab />}
      {tab === "enrollments" && <EnrollmentsTab />}
      {tab === "attempts" && <QuizAttemptsTab />}
    </div>
  );
}

/* ---- COURSES TAB ---- */
function CoursesTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [form, setForm] = useState({
    title: "", description: "", category: "", level: "BEGINNER",
    price: 0, status: "PUBLISHED", courseType: "RECORDED", externalUrl: ""
  });

  const { data: courses, isLoading } = useQuery({
    queryKey: ["myCourses"],
    queryFn: () => coursesApi.myCreated().then((r) => r.data),
  });

  const { data: allEnrollments } = useQuery({
    queryKey: ["instructorEnrollments"],
    queryFn: () => api.get("/courses/enrollments/instructor").then((r) => r.data),
  });

  const enrollmentsByCourse = (allEnrollments ?? []).reduce((acc, e) => {
    const cid = e.course?.id;
    if (!cid) return acc;
    if (!acc[cid]) acc[cid] = [];
    acc[cid].push(e);
    return acc;
  }, {});

  const createMutation = useMutation({
    mutationFn: () => coursesApi.create(form).then((r) => r.data),
    onSuccess: () => { toast.success("Course created & published!"); queryClient.invalidateQueries(["myCourses"]); setShowForm(false); setForm({ title: "", description: "", category: "", level: "BEGINNER", price: 0, status: "PUBLISHED", courseType: "RECORDED", externalUrl: "" }); },
    onError: () => toast.error("Failed to create course"),
  });

  const [editingCourse, setEditingCourse] = useState(null);
  const [editForm, setEditForm] = useState({});

  const publishMutation = useMutation({
    mutationFn: (id) => coursesApi.update(id, { status: "PUBLISHED" }),
    onSuccess: () => { toast.success("Published!"); queryClient.invalidateQueries(["myCourses"]); },
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }) => coursesApi.update(id, data),
    onSuccess: () => { toast.success("Course updated!"); queryClient.invalidateQueries(["myCourses"]); setEditingCourse(null); },
    onError: () => toast.error("Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => coursesApi.delete(id),
    onSuccess: () => { toast.success("Course deleted!"); queryClient.invalidateQueries(["myCourses"]); },
    onError: () => toast.error("Delete failed"),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> New Course</button>
      </div>

      {showForm && (
        <div className="card border-primary-200 border space-y-5">
          <h3 className="font-semibold text-gray-900">Create Course</h3>

          {/* Course type toggle */}
          <div>
            <label className="label">Course Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button"
                onClick={() => setForm({ ...form, courseType: "RECORDED", externalUrl: "" })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  form.courseType === "RECORDED"
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <span className="text-2xl">🎬</span>
                <span className="font-semibold text-sm text-gray-800">Recorded Sections</span>
                <span className="text-xs text-gray-500 text-center">Add video lessons, PDFs and text content section by section</span>
              </button>
              <button type="button"
                onClick={() => setForm({ ...form, courseType: "EXTERNAL" })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  form.courseType === "EXTERNAL"
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                <span className="text-2xl">🔗</span>
                <span className="font-semibold text-sm text-gray-800">Link External Course</span>
                <span className="text-xs text-gray-500 text-center">Link a YouTube playlist, Coursera, Udemy or any external URL</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Course Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Complete React Bootcamp" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea className="input resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will students learn from this course?" />
            </div>
            <div>
              <label className="label">Category</label>
              <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Web Dev, Data Science, Design" />
            </div>
            <div>
              <label className="label">Level</label>
              <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                {["BEGINNER","INTERMEDIATE","ADVANCED"].map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>

            {/* External URL field — only shown if EXTERNAL type */}
            {form.courseType === "EXTERNAL" && (
              <div className="md:col-span-2">
                <label className="label">External Course URL</label>
                <input className="input" value={form.externalUrl}
                  onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                  placeholder="https://www.youtube.com/playlist?list=... or https://coursera.org/..." />
                <p className="text-xs text-gray-400 mt-1">
                  Supports YouTube playlists, Coursera, edX, Udemy, or any URL.
                  Students will be redirected to this link.
                </p>
                {/* Preview the link type */}
                {form.externalUrl && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-gray-500">Preview:</span>
                    <a href={form.externalUrl} target="_blank" rel="noreferrer"
                      className="text-primary-600 hover:underline truncate max-w-xs">
                      {form.externalUrl}
                    </a>
                    <span className="text-gray-400">
                      {form.externalUrl.includes("youtube") ? "📺 YouTube" :
                       form.externalUrl.includes("coursera") ? "🎓 Coursera" :
                       form.externalUrl.includes("udemy") ? "🎓 Udemy" :
                       form.externalUrl.includes("edx") ? "🎓 edX" : "🔗 External"}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="md:col-span-2 flex items-center gap-2">
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">🎓 All courses are Free</span>
            </div>
          </div>

          {/* Live thumbnail preview */}
          {form.title && (
            <div>
              <p className="label mb-2">Auto-generated Thumbnail Preview</p>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-32 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
                  <CourseThumbnail title={form.title} category={form.category} size="sm" className="h-20" />
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p className="font-medium text-gray-700">This thumbnail is automatically generated based on your course title and category.</p>
                  <p>Tip: Use keywords like <span className="text-primary-600 font-medium">React, Python, DSA, Design, AWS, Flutter</span> in your title or category for a matching icon.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => createMutation.mutate()}
              disabled={!form.title || (form.courseType === "EXTERNAL" && !form.externalUrl) || createMutation.isPending}
              className="btn-primary text-sm flex items-center gap-2">
              {createMutation.isPending && <Loader2 size={14} className="animate-spin" />} Create & Publish
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses?.map((c) => (
            <div key={c.id} className="card hover:shadow-md transition-shadow">
              {editingCourse === c.id ? (
                /* ---- Inline edit form ---- */
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Edit Course</p>
                  <div><label className="label">Title</label>
                    <input className="input text-sm" value={editForm.title ?? c.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                  </div>
                  <div><label className="label">Description</label>
                    <textarea className="input text-sm resize-none" rows={2} value={editForm.description ?? c.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="label">Category</label>
                      <input className="input text-sm" value={editForm.category ?? c.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
                    </div>
                    <div><label className="label">Level</label>
                      <select className="input text-sm" value={editForm.level ?? c.level}
                        onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}>
                        {["BEGINNER","INTERMEDIATE","ADVANCED"].map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editMutation.mutate({ id: c.id, data: editForm })}
                      disabled={editMutation.isPending}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                      {editMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                    </button>
                    <button onClick={() => setEditingCourse(null)} className="btn-secondary text-xs px-3 py-1.5">Cancel</button>
                  </div>
                </div>
              ) : (
                /* ---- Normal card view ---- */
                <>
                  {/* Thumbnail */}
                  <div className="rounded-xl overflow-hidden mb-3 -mx-6 -mt-6">
                    <CourseThumbnail title={c.title} category={c.category} size="sm" className="h-24" />
                  </div>

                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 flex-1 pr-2">{c.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${c.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{c.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{c.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <span>{c.category}</span>·<span>{c.level}</span>
                  </div>

                  {/* Enrolled students count + toggle */}
                  <button
                    onClick={() => setExpandedCourse(expandedCourse === c.id ? null : c.id)}
                    className="w-full flex items-center justify-between bg-primary-50 hover:bg-primary-100 rounded-lg px-3 py-2 mb-3 transition-colors"
                  >
                    <span className="text-xs font-semibold text-primary-700 flex items-center gap-1.5">
                      <Users size={12} /> {(enrollmentsByCourse[c.id] ?? []).length} student{(enrollmentsByCourse[c.id] ?? []).length !== 1 ? "s" : ""} enrolled
                    </span>
                    <span className="text-xs text-primary-500">{expandedCourse === c.id ? "▲ Hide" : "▼ Show"}</span>
                  </button>

                  {/* Enrolled student list */}
                  {expandedCourse === c.id && (
                    <div className="mb-3 border border-gray-100 rounded-lg overflow-hidden">
                      {(enrollmentsByCourse[c.id] ?? []).length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-3">No students enrolled yet</p>
                      ) : (
                        <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
                          {(enrollmentsByCourse[c.id] ?? []).map((e) => (
                            <div key={e.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50">
                              <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                {e.student?.fullName?.charAt(0) ?? "?"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-800 truncate">{e.student?.fullName}</p>
                                <p className="text-xs text-gray-400 truncate">{e.student?.email}</p>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <div className="w-12 bg-gray-100 rounded-full h-1">
                                  <div className="bg-primary-500 h-1 rounded-full" style={{ width: `${e.progressPercent ?? 0}%` }} />
                                </div>
                                <span className="text-xs text-gray-400">{e.progressPercent ?? 0}%</span>
                                {e.completed && <CheckCircle size={11} className="text-green-500" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {c.status !== "PUBLISHED" && (
                      <button onClick={() => publishMutation.mutate(c.id)} className="btn-primary text-xs px-3 py-1.5">Publish</button>
                    )}
                    <button onClick={() => { setEditingCourse(c.id); setEditForm({ title: c.title, description: c.description, category: c.category, level: c.level }); }}
                      className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => { if (window.confirm(`Delete "${c.title}"?`)) deleteMutation.mutate(c.id); }}
                      disabled={deleteMutation.isPending}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1 transition-colors">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <AddContentButton courseId={c.id} />
                  </div>
                </>
              )}
            </div>
          ))}
          {courses?.length === 0 && <p className="text-gray-500 col-span-2 text-center py-8">No courses yet. Create your first one!</p>}
        </div>
      )}
    </div>
  );
}

function AddContentButton({ courseId }) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState(null);
  const [sections, setSections] = useState([]);
  const [sectionTitle, setSectionTitle] = useState("");
  const [urlMode, setUrlMode] = useState("url");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [lessonForm, setLessonForm] = useState({
    sectionId: "", title: "", contentType: "VIDEO",
    contentUrl: "", description: "", durationSeconds: "", isFreePreview: false,
  });

  const loadSections = async () => {
    const res = await api.get(`/courses/${courseId}`);
    setSections(res.data.sections || []);
  };

  const addSection = useMutation({
    mutationFn: () => api.post(`/courses/${courseId}/sections`, { title: sectionTitle, orderIndex: 0 }),
    onSuccess: () => { toast.success("Section added!"); setSectionTitle(""); setMode(null); queryClient.invalidateQueries(["myCourses"]); },
    onError: () => toast.error("Failed to add section"),
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadProgress(1);
    try {
      const res = await filesApi.upload(file, setUploadProgress);
      const base = (import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1").replace(/\/api\/v1\/?$/, "");
      const url = `${base}${res.data.url}`;
      setUploadedFile({ name: res.data.originalName, url });
      setLessonForm((f) => ({ ...f, contentUrl: url }));
      toast.success("File uploaded!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploadProgress(0);
    }
  };

  const addLesson = useMutation({
    mutationFn: () => api.post(`/courses/sections/${lessonForm.sectionId}/lessons`, {
      title: lessonForm.title,
      contentType: lessonForm.contentType,
      contentUrl: lessonForm.contentUrl || null,
      description: lessonForm.description || null,
      durationSeconds: lessonForm.durationSeconds ? Number(lessonForm.durationSeconds) : null,
      isFreePreview: lessonForm.isFreePreview,
      orderIndex: 0,
    }),
    onSuccess: () => {
      toast.success("Lesson added!");
      setLessonForm({ sectionId: "", title: "", contentType: "VIDEO", contentUrl: "", description: "", durationSeconds: "", isFreePreview: false });
      setUploadedFile(null);
      setMode(null);
      queryClient.invalidateQueries(["myCourses"]);
    },
    onError: () => toast.error("Failed to add lesson"),
  });

  const getYoutubeId = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const videoPreviewUrl = lessonForm.contentType === "VIDEO" && lessonForm.contentUrl
    ? (getYoutubeId(lessonForm.contentUrl)
        ? `https://www.youtube.com/embed/${getYoutubeId(lessonForm.contentUrl)}`
        : lessonForm.contentUrl)
    : null;

  if (!mode) return (
    <div className="flex gap-2">
      <button onClick={() => setMode("section")} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
        <Plus size={12} /> Add Section
      </button>
      <button onClick={() => { setMode("lesson"); loadSections(); }} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
        <Plus size={12} /> Add Lesson
      </button>
    </div>
  );

  if (mode === "section") return (
    <div className="flex gap-2 w-full mt-2">
      <input className="input text-xs flex-1" placeholder="Section title e.g. Introduction" value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} />
      <button onClick={() => addSection.mutate()} disabled={!sectionTitle || addSection.isPending} className="btn-primary text-xs px-2 flex items-center gap-1">
        {addSection.isPending && <Loader2 size={10} className="animate-spin" />} Save
      </button>
      <button onClick={() => setMode(null)} className="btn-secondary text-xs px-2">✕</button>
    </div>
  );

  if (mode === "lesson") {
    return (
      <div className="mt-3 pt-3 border-t border-gray-100 space-y-3 w-full">
        <p className="text-xs font-semibold text-gray-600">Add Lesson</p>

        {sections.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-sm font-medium text-yellow-800">⚠️ No sections yet</p>
            <p className="text-xs text-yellow-600 mt-1">Add a section first, then come back to add lessons.</p>
            <button onClick={() => setMode("section")} className="btn-primary text-xs mt-3 px-4 py-1.5">+ Add Section Now</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Section</label>
                <select className="input text-sm" value={lessonForm.sectionId} onChange={(e) => setLessonForm({ ...lessonForm, sectionId: e.target.value })}>
                  <option value="">Select a section...</option>
                  {sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Lesson Title</label>
                <input className="input text-sm" placeholder="e.g. Introduction to React Hooks" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} />
              </div>
              <div>
                <label className="label">Content Type</label>
                <select className="input text-sm" value={lessonForm.contentType} onChange={(e) => setLessonForm({ ...lessonForm, contentType: e.target.value })}>
                  <option value="VIDEO">📹 Video</option>
                  <option value="PDF">📄 PDF / Document</option>
                  <option value="TEXT">📝 Text / Article</option>
                </select>
              </div>
              <div>
                <label className="label">Duration (seconds)</label>
                <input type="number" className="input text-sm" placeholder="e.g. 600 = 10min" value={lessonForm.durationSeconds} onChange={(e) => setLessonForm({ ...lessonForm, durationSeconds: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="label">
                {lessonForm.contentType === "VIDEO" ? "Video Source" : lessonForm.contentType === "PDF" ? "PDF Source" : "Content Link (optional)"}
              </label>
              {lessonForm.contentType !== "TEXT" && (
                <div className="flex gap-2 mb-3">
                  <button type="button"
                    onClick={() => { setUrlMode("url"); setUploadedFile(null); setLessonForm((f) => ({ ...f, contentUrl: "" })); }}
                    className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors " + (urlMode === "url" ? "bg-primary-600 text-white border-primary-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50")}>
                    <Link2 size={12} /> Paste URL
                  </button>
                  <button type="button"
                    onClick={() => { setUrlMode("upload"); setLessonForm((f) => ({ ...f, contentUrl: "" })); }}
                    className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors " + (urlMode === "upload" ? "bg-primary-600 text-white border-primary-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50")}>
                    <Upload size={12} /> Upload File
                  </button>
                </div>
              )}

              {(urlMode === "url" || lessonForm.contentType === "TEXT") && (
                <input className="input text-sm"
                  placeholder={lessonForm.contentType === "VIDEO" ? "https://www.youtube.com/watch?v=... or direct .mp4 URL" : lessonForm.contentType === "PDF" ? "https://example.com/document.pdf" : "https://... (optional)"}
                  value={lessonForm.contentUrl} onChange={(e) => setLessonForm({ ...lessonForm, contentUrl: e.target.value })} />
              )}

              {urlMode === "upload" && lessonForm.contentType !== "TEXT" && (
                <div>
                  {uploadedFile ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-800 truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-green-600">Uploaded successfully</p>
                      </div>
                      <button onClick={() => { setUploadedFile(null); setLessonForm((f) => ({ ...f, contentUrl: "" })); }} className="text-green-600 hover:text-green-800">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                      <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-sm font-medium text-gray-600">Click to upload {lessonForm.contentType === "PDF" ? "a PDF" : "a video"}</p>
                      <p className="text-xs text-gray-400 mt-1">{lessonForm.contentType === "PDF" ? "PDF files up to 500MB" : "MP4, WebM, MOV up to 500MB"}</p>
                      <input ref={fileInputRef} type="file" className="hidden"
                        accept={lessonForm.contentType === "PDF" ? ".pdf" : "video/*"}
                        onChange={handleFileUpload} />
                    </div>
                  )}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Uploading...</span><span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: uploadProgress + "%" }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {videoPreviewUrl && urlMode === "url" && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Preview:</p>
                <iframe src={videoPreviewUrl} className="w-full rounded-lg border border-gray-200" height="180" allowFullScreen title="preview" />
              </div>
            )}

            <div>
              <label className="label">Description (optional)</label>
              <textarea className="input text-sm resize-none" rows={2} placeholder="What will students learn?" value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="freePreview" checked={lessonForm.isFreePreview} onChange={(e) => setLessonForm({ ...lessonForm, isFreePreview: e.target.checked })} className="rounded" />
              <label htmlFor="freePreview" className="text-sm text-gray-600 cursor-pointer">Mark as Free Preview</label>
            </div>

            <div className="flex gap-2">
              <button onClick={() => addLesson.mutate()}
                disabled={!lessonForm.sectionId || !lessonForm.title || addLesson.isPending}
                className="btn-primary text-sm flex items-center gap-2">
                {addLesson.isPending && <Loader2 size={14} className="animate-spin" />} Add Lesson
              </button>
              <button onClick={() => setMode(null)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </>
        )}
      </div>
    );
  }
}

/* ---- QUIZZES TAB ---- */
function QuizzesTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [quizForm, setQuizForm] = useState({ title: "", topic: "", durationMinutes: 30, passingScore: 60 });
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [expandedAttempts, setExpandedAttempts] = useState(null);
  const [qForm, setQForm] = useState({ questionText: "", type: "MCQ", options: ["", "", "", ""], correctAnswer: "", difficulty: "MEDIUM", marks: 1 });

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["allQuizzes"],
    queryFn: () => quizApi.list().then((r) => r.data),
  });

  const { data: allAttempts } = useQuery({
    queryKey: ["instructorQuizAttempts"],
    queryFn: () => api.get("/quizzes/attempts/instructor").then((r) => r.data),
  });

  const attemptsByQuiz = (allAttempts ?? []).reduce((acc, a) => {
    const qid = a.quiz?.id;
    if (!qid) return acc;
    if (!acc[qid]) acc[qid] = [];
    acc[qid].push(a);
    return acc;
  }, {});

  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editQuizForm, setEditQuizForm] = useState({});

  const createQuiz = useMutation({
    mutationFn: () => quizApi.create(quizForm).then((r) => r.data),
    onSuccess: () => { toast.success("Quiz created!"); queryClient.invalidateQueries(["allQuizzes"]); setShowForm(false); },
    onError: () => toast.error("Failed"),
  });

  const editQuiz = useMutation({
    mutationFn: ({ id, data }) => quizApi.update(id, data),
    onSuccess: () => { toast.success("Quiz updated!"); queryClient.invalidateQueries(["allQuizzes"]); setEditingQuiz(null); },
    onError: () => toast.error("Update failed"),
  });

  const deleteQuiz = useMutation({
    mutationFn: (id) => quizApi.delete(id),
    onSuccess: () => { toast.success("Quiz deleted!"); queryClient.invalidateQueries(["allQuizzes"]); },
    onError: () => toast.error("Delete failed"),
  });

  const addQuestion = useMutation({
    mutationFn: () => quizApi.addQuestion(selectedQuiz, { ...qForm, options: qForm.options.filter(Boolean) }).then((r) => r.data),
    onSuccess: () => { toast.success("Question added!"); setQForm({ questionText: "", type: "MCQ", options: ["","","",""], correctAnswer: "", difficulty: "MEDIUM", marks: 1 }); },
    onError: () => toast.error("Failed"),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> New Quiz</button>
      </div>

      {showForm && (
        <div className="card border-primary-200 border space-y-4">
          <h3 className="font-semibold">Create Quiz</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">Title</label><input className="input" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} /></div>
            <div><label className="label">Topic</label><input className="input" value={quizForm.topic} onChange={(e) => setQuizForm({ ...quizForm, topic: e.target.value })} /></div>
            <div><label className="label">Duration (min)</label><input type="number" className="input" value={quizForm.durationMinutes} onChange={(e) => setQuizForm({ ...quizForm, durationMinutes: +e.target.value })} /></div>
            <div><label className="label">Passing Score (%)</label><input type="number" className="input" value={quizForm.passingScore} onChange={(e) => setQuizForm({ ...quizForm, passingScore: +e.target.value })} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => createQuiz.mutate()} disabled={!quizForm.title || createQuiz.isPending} className="btn-primary text-sm flex items-center gap-2">
              {createQuiz.isPending && <Loader2 size={14} className="animate-spin" />} Create
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <div className="space-y-3">
          {quizzes?.map((q) => (
            <div key={q.id} className="card">
              {editingQuiz === q.id ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Edit Quiz</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><label className="label">Title</label>
                      <input className="input text-sm" value={editQuizForm.title ?? q.title}
                        onChange={(e) => setEditQuizForm({ ...editQuizForm, title: e.target.value })} />
                    </div>
                    <div><label className="label">Topic</label>
                      <input className="input text-sm" value={editQuizForm.topic ?? q.topic}
                        onChange={(e) => setEditQuizForm({ ...editQuizForm, topic: e.target.value })} />
                    </div>
                    <div><label className="label">Duration (min)</label>
                      <input type="number" className="input text-sm" value={editQuizForm.durationMinutes ?? q.durationMinutes}
                        onChange={(e) => setEditQuizForm({ ...editQuizForm, durationMinutes: +e.target.value })} />
                    </div>
                    <div><label className="label">Passing Score (%)</label>
                      <input type="number" className="input text-sm" value={editQuizForm.passingScore ?? q.passingScore}
                        onChange={(e) => setEditQuizForm({ ...editQuizForm, passingScore: +e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editQuiz.mutate({ id: q.id, data: editQuizForm })}
                      disabled={editQuiz.isPending}
                      className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                      {editQuiz.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                    </button>
                    <button onClick={() => setEditingQuiz(null)} className="btn-secondary text-xs px-3 py-1.5">Cancel</button>
                  </div>
                </div>
              ) : (
              <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{q.title}</h3>
                  <p className="text-xs text-gray-500">{q.topic} · {q.durationMinutes}min · Pass: {q.passingScore}%</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => { setEditingQuiz(q.id); setEditQuizForm({ title: q.title, topic: q.topic, durationMinutes: q.durationMinutes, passingScore: q.passingScore }); }}
                    className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1">
                    <Pencil size={11} /> Edit
                  </button>
                  <button onClick={() => setSelectedQuiz(selectedQuiz === q.id ? null : q.id)}
                    className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1">
                    <Plus size={11} /> Question
                  </button>
                  <button onClick={() => { if (window.confirm(`Delete quiz "${q.title}"?`)) deleteQuiz.mutate(q.id); }}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1 transition-colors">
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              <QuizAttemptsMini
                attempts={attemptsByQuiz[q.id] ?? []}
                quizId={q.id}
                expanded={expandedAttempts === q.id}
                onToggle={() => setExpandedAttempts(expandedAttempts === q.id ? null : q.id)}
              />
              {selectedQuiz === q.id && editingQuiz !== q.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <div><label className="label">Question</label><textarea className="input resize-none" rows={2} value={qForm.questionText} onChange={(e) => setQForm({ ...qForm, questionText: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">Type</label>
                      <select className="input" value={qForm.type} onChange={(e) => setQForm({ ...qForm, type: e.target.value })}>
                        {["MCQ","TRUE_FALSE","SHORT_ANSWER"].map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div><label className="label">Difficulty</label>
                      <select className="input" value={qForm.difficulty} onChange={(e) => setQForm({ ...qForm, difficulty: e.target.value })}>
                        {["EASY","MEDIUM","HARD"].map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                  {qForm.type === "MCQ" && (
                    <div><label className="label">Options</label>
                      <div className="grid grid-cols-2 gap-2">
                        {qForm.options.map((o, i) => (
                          <input key={i} className="input text-sm" placeholder={`Option ${String.fromCharCode(65+i)}`}
                            value={o} onChange={(e) => { const opts = [...qForm.options]; opts[i] = e.target.value; setQForm({ ...qForm, options: opts }); }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div><label className="label">Correct Answer</label><input className="input" value={qForm.correctAnswer} onChange={(e) => setQForm({ ...qForm, correctAnswer: e.target.value })} placeholder="Exact text of correct option" /></div>
                  <div className="flex gap-2">
                    <button onClick={() => addQuestion.mutate()} disabled={!qForm.questionText || !qForm.correctAnswer || addQuestion.isPending} className="btn-primary text-sm flex items-center gap-2">
                      {addQuestion.isPending && <Loader2 size={14} className="animate-spin" />} Add Question
                    </button>
                  </div>
                </div>
              )}
              </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- BATCHES TAB ---- */
function BatchesTab() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [studentEmail, setStudentEmail] = useState("");
  const [assignCourseId, setAssignCourseId] = useState("");
  const [assignQuizId, setAssignQuizId] = useState("");

  const { data: batches, isLoading } = useQuery({
    queryKey: ["myBatches"],
    queryFn: () => api.get("/batches/my").then((r) => r.data),
  });
  const { data: courses } = useQuery({ queryKey: ["myCourses"], queryFn: () => coursesApi.myCreated().then((r) => r.data) });
  const { data: quizzes } = useQuery({ queryKey: ["allQuizzes"], queryFn: () => quizApi.list().then((r) => r.data) });

  const createBatch = useMutation({
    mutationFn: () => api.post("/batches", form).then((r) => r.data),
    onSuccess: () => { toast.success("Batch created!"); queryClient.invalidateQueries(["myBatches"]); setShowForm(false); },
  });

  const addStudent = useMutation({
    mutationFn: ({ batchId, email }) => api.get(`/users/search?email=${email}`).then((r) =>
      api.post(`/batches/${batchId}/students`, { studentId: r.data.id })),
    onSuccess: () => { toast.success("Student added!"); setStudentEmail(""); queryClient.invalidateQueries(["myBatches"]); },
    onError: () => toast.error("Student not found"),
  });

  const assignCourse = useMutation({
    mutationFn: ({ batchId, courseId }) => api.post(`/batches/${batchId}/assign-course`, { courseId: Number(courseId) }),
    onSuccess: () => toast.success("Course assigned to batch!"),
  });

  const assignQuiz = useMutation({
    mutationFn: ({ batchId, quizId }) => api.post(`/batches/${batchId}/assign-quiz`, { quizId: Number(quizId), maxAttempts: 3 }),
    onSuccess: () => toast.success("Quiz assigned to batch!"),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> New Batch</button>
      </div>

      {showForm && (
        <div className="card border-primary-200 border space-y-4">
          <h3 className="font-semibold">Create Batch</h3>
          <div><label className="label">Batch Name</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Batch A - Morning" /></div>
          <div><label className="label">Description</label><textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="flex gap-2">
            <button onClick={() => createBatch.mutate()} disabled={!form.name} className="btn-primary text-sm">Create</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? <Spinner /> : (
        <div className="space-y-4">
          {batches?.map((b) => (
            <div key={b.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{b.name}</h3>
                  <p className="text-xs text-gray-500">{b.students?.length ?? 0} students</p>
                </div>
                <button onClick={() => setSelectedBatch(selectedBatch === b.id ? null : b.id)}
                  className="btn-secondary text-xs px-3 py-1.5">
                  {selectedBatch === b.id ? "Close" : "Manage"}
                </button>
              </div>

              {selectedBatch === b.id && (
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  {/* Add student */}
                  <div>
                    <label className="label">Add Student by Email</label>
                    <div className="flex gap-2">
                      <input className="input flex-1" placeholder="student@example.com" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} />
                      <button onClick={() => addStudent.mutate({ batchId: b.id, email: studentEmail })} disabled={!studentEmail} className="btn-primary text-sm px-3">Add</button>
                    </div>
                  </div>
                  {/* Students list */}
                  {b.students?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {b.students.map((s) => (
                        <span key={s.id} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">{s.fullName}</span>
                      ))}
                    </div>
                  )}
                  {/* Assign course */}
                  <div>
                    <label className="label">Assign Course to Entire Batch</label>
                    <div className="flex gap-2">
                      <select className="input flex-1" value={assignCourseId} onChange={(e) => setAssignCourseId(e.target.value)}>
                        <option value="">Select course...</option>
                        {courses?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                      <button onClick={() => assignCourse.mutate({ batchId: b.id, courseId: assignCourseId })} disabled={!assignCourseId} className="btn-primary text-sm px-3">Assign</button>
                    </div>
                  </div>
                  {/* Assign quiz */}
                  <div>
                    <label className="label">Assign Quiz to Entire Batch</label>
                    <div className="flex gap-2">
                      <select className="input flex-1" value={assignQuizId} onChange={(e) => setAssignQuizId(e.target.value)}>
                        <option value="">Select quiz...</option>
                        {quizzes?.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
                      </select>
                      <button onClick={() => assignQuiz.mutate({ batchId: b.id, quizId: assignQuizId })} disabled={!assignQuizId} className="btn-primary text-sm px-3">Assign</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {batches?.length === 0 && <p className="text-gray-500 text-center py-8">No batches yet.</p>}
        </div>
      )}
    </div>
  );
}

/* ---- STUDENTS TAB ---- */
function StudentsTab() {
  const { data: students, isLoading } = useQuery({
    queryKey: ["allStudents"],
    queryFn: () => api.get("/users?role=ROLE_STUDENT").then((r) => r.data),
  });

  return isLoading ? <Spinner /> : (
    <div className="card p-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left px-6 py-3 text-gray-500 font-medium">Name</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {students?.map((s) => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="px-6 py-3 font-medium text-gray-900">{s.fullName}</td>
              <td className="px-4 py-3 text-gray-500">{s.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {students?.length === 0 && <p className="text-center py-8 text-gray-500">No students yet.</p>}
    </div>
  );
}

/* ---- MINI COMPONENTS ---- */
function QuizAttemptsMini({ attempts, quizId, expanded, onToggle }) {
  const passed = attempts.filter((a) => a.passed).length;
  return (
    <>
      <button onClick={onToggle}
        className="w-full flex items-center justify-between bg-yellow-50 hover:bg-yellow-100 rounded-lg px-3 py-2 mt-3 transition-colors">
        <span className="text-xs font-semibold text-yellow-700 flex items-center gap-1.5">
          <Trophy size={12} /> {attempts.length} attempt{attempts.length !== 1 ? "s" : ""}
          {attempts.length > 0 && <span className="text-green-600 font-normal ml-1">· {passed} passed</span>}
        </span>
        <span className="text-xs text-yellow-500">{expanded ? "▲ Hide" : "▼ Show"}</span>
      </button>
      {expanded && (
        <div className="mt-2 border border-gray-100 rounded-lg overflow-hidden">
          {attempts.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-3">No attempts yet</p>
          ) : (
            <div className="divide-y divide-gray-50 max-h-48 overflow-y-auto">
              {[...attempts].sort((a, b) => b.percentage - a.percentage).map((a) => (
                <div key={a.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50">
                  <div className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {a.student?.fullName?.charAt(0) ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{a.student?.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{a.student?.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 text-xs">
                    <span className="font-semibold text-gray-700">{a.score}/{a.totalMarks}</span>
                    <span className="text-gray-400">({a.percentage}%)</span>
                    {a.passed ? <span className="text-green-600">✅</span> : <span className="text-red-500">❌</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

/* ---- ENROLLMENTS TAB ---- */
function EnrollmentsTab() {
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["instructorEnrollments"],
    queryFn: () => api.get("/courses/enrollments/instructor").then((r) => r.data),
  });

  const byCourse = enrollments?.reduce((acc, e) => {
    const title = e.course?.title ?? "Unknown";
    if (!acc[title]) acc[title] = [];
    acc[title].push(e);
    return acc;
  }, {}) ?? {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Course Enrollments</h2>
          <p className="text-sm text-gray-500 mt-0.5">Students who enrolled in your courses</p>
        </div>
        <span className="bg-primary-100 text-primary-700 text-sm font-semibold px-3 py-1 rounded-full">
          {enrollments?.length ?? 0} total
        </span>
      </div>

      {isLoading ? <Spinner /> : Object.keys(byCourse).length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <GraduationCap size={40} className="mx-auto mb-2 text-gray-200" />
          <p>No enrollments yet. Share your courses!</p>
        </div>
      ) : (
        Object.entries(byCourse).map(([courseTitle, list]) => (
          <div key={courseTitle} className="card p-0 overflow-hidden">
            <div className="bg-primary-50 px-5 py-3 flex items-center justify-between border-b border-primary-100">
              <h3 className="font-semibold text-primary-900 text-sm">{courseTitle}</h3>
              <span className="text-xs text-primary-600 font-medium">{list.length} student{list.length !== 1 ? "s" : ""}</span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-2.5 text-gray-500 font-medium">Student</th>
                  <th className="text-left px-4 py-2.5 text-gray-500 font-medium">Progress</th>
                  <th className="text-left px-4 py-2.5 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-4 py-2.5 text-gray-500 font-medium">Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center">
                          {e.student?.fullName?.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{e.student?.fullName}</p>
                          <p className="text-xs text-gray-400">{e.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${e.progressPercent ?? 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{e.progressPercent ?? 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {e.completed
                        ? <span className="badge-easy text-xs flex items-center gap-1 w-fit"><CheckCircle size={11} /> Completed</span>
                        : <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">In Progress</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

/* ---- QUIZ ATTEMPTS TAB ---- */
function QuizAttemptsTab() {
  const { data: attempts, isLoading } = useQuery({
    queryKey: ["instructorQuizAttempts"],
    queryFn: () => api.get("/quizzes/attempts/instructor").then((r) => r.data),
  });

  const byQuiz = attempts?.reduce((acc, a) => {
    const title = a.quiz?.title ?? "Unknown";
    if (!acc[title]) acc[title] = [];
    acc[title].push(a);
    return acc;
  }, {}) ?? {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Quiz Attempts</h2>
          <p className="text-sm text-gray-500 mt-0.5">Students who attempted your quizzes</p>
        </div>
        <span className="bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
          {attempts?.length ?? 0} total
        </span>
      </div>

      {isLoading ? <Spinner /> : Object.keys(byQuiz).length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <Trophy size={40} className="mx-auto mb-2 text-gray-200" />
          <p>No quiz attempts yet.</p>
        </div>
      ) : (
        Object.entries(byQuiz).map(([quizTitle, list]) => {
          const passed = list.filter((a) => a.passed).length;
          const avg = list.length ? Math.round(list.reduce((s, a) => s + (a.percentage ?? 0), 0) / list.length) : 0;
          return (
            <div key={quizTitle} className="card p-0 overflow-hidden">
              <div className="bg-yellow-50 px-5 py-3 flex items-center justify-between border-b border-yellow-100">
                <h3 className="font-semibold text-yellow-900 text-sm">{quizTitle}</h3>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-yellow-700">{list.length} attempt{list.length !== 1 ? "s" : ""}</span>
                  <span className="text-green-700">✅ {passed} passed</span>
                  <span className="text-yellow-700">Avg: {avg}%</span>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-2.5 text-gray-500 font-medium">Student</th>
                    <th className="text-left px-4 py-2.5 text-gray-500 font-medium">Score</th>
                    <th className="text-left px-4 py-2.5 text-gray-500 font-medium">Result</th>
                    <th className="text-left px-4 py-2.5 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {list.sort((a, b) => b.percentage - a.percentage).map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-yellow-100 text-yellow-700 font-bold text-xs flex items-center justify-center">
                            {a.student?.fullName?.charAt(0) ?? "?"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{a.student?.fullName}</p>
                            <p className="text-xs text-gray-400">{a.student?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900">{a.score}/{a.totalMarks}</span>
                        <span className="text-xs text-gray-400 ml-1">({a.percentage}%)</span>
                      </td>
                      <td className="px-4 py-3">
                        {a.passed
                          ? <span className="badge-easy text-xs">✅ Passed</span>
                          : <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">❌ Failed</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {a.completedAt ? new Date(a.completedAt).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
}
