import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Play, FileText, BookOpen, Lock, Star, Users, Clock, CheckCircle,
  ChevronDown, ChevronUp, Loader2, ExternalLink, Award, Globe, BarChart2, UserCheck
} from "lucide-react";
import { coursesApi } from "../../api/courses";
import { useAuthStore } from "../../store/authStore";
import CourseThumbnail from "../../components/shared/CourseThumbnail";
import StarRating from "../../components/shared/StarRating";
import Spinner from "../../components/shared/Spinner";
import toast from "react-hot-toast";

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, hasRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [openSection, setOpenSection] = useState(0);
  const [activeLesson, setActiveLesson] = useState(null);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: () => coursesApi.get(id).then((r) => r.data),
  });

  const { data: reviews } = useQuery({
    queryKey: ["courseReviews", id],
    queryFn: () => coursesApi.getReviews(id).then((r) => r.data),
  });

  const { data: enrollments } = useQuery({
    queryKey: ["myEnrollments"],
    queryFn: () => coursesApi.myEnrollments().then((r) => r.data),
    enabled: isAuthenticated,
  });

  const isInstructor = course?.instructorId === user?.userId || hasRole("ROLE_INSTRUCTOR");

  const { data: instructorEnrollments } = useQuery({
    queryKey: ["instructorEnrollments"],
    queryFn: () => coursesApi.instructorEnrollments().then((r) => r.data),
    enabled: isAuthenticated && isInstructor,
  });

  const isEnrolled = enrollments?.some(
    (e) => e.course?.id === Number(id) || e.courseId === Number(id)
  );

  const enrollMutation = useMutation({
    mutationFn: () => coursesApi.enroll(id).then((r) => r.data),
    onSuccess: () => {
      toast.success("Enrolled! Happy learning 🎉");
      queryClient.invalidateQueries(["myEnrollments"]);
      queryClient.invalidateQueries(["course", id]);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Enrollment failed"),
  });

  const reviewMutation = useMutation({
    mutationFn: () => coursesApi.addReview(id, review).then((r) => r.data),
    onSuccess: () => {
      toast.success("Review submitted!");
      queryClient.invalidateQueries(["courseReviews", id]);
      setShowReviewForm(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || "Review failed"),
  });

  // Video helpers
  const getYoutubeId = (url) => {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    return m ? m[1] : null;
  };
  const getYoutubePlaylistId = (url) => {
    if (!url) return null;
    const m = url.match(/[?&]list=([\w-]+)/);
    return m ? m[1] : null;
  };
  const getEmbedUrl = (lesson) => {
    if (!lesson?.contentUrl) return null;
    const ytId = getYoutubeId(lesson.contentUrl);
    if (ytId) return `https://www.youtube.com/embed/${ytId}`;
    const playlistId = getYoutubePlaylistId(lesson.contentUrl);
    if (playlistId) return `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
    if (lesson.contentUrl.match(/\.(mp4|webm|ogg)$/i)) return lesson.contentUrl;
    return null;
  };
  // For EXTERNAL courses — embed YouTube directly
  const getExternalEmbedUrl = (url) => {
    if (!url) return null;
    const ytId = getYoutubeId(url);
    if (ytId) return `https://www.youtube.com/embed/${ytId}`;
    const playlistId = getYoutubePlaylistId(url);
    if (playlistId) return `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
    return null;
  };

  const levelColors = {
    BEGINNER: "bg-green-100 text-green-700",
    INTERMEDIATE: "bg-yellow-100 text-yellow-700",
    ADVANCED: "bg-red-100 text-red-700",
  };
  const contentIcons = { VIDEO: Play, PDF: FileText, TEXT: BookOpen, QUIZ_LINK: Star };

  const totalLessons = course?.sections?.reduce((a, s) => a + (s.lessons?.length ?? 0), 0) ?? 0;
  const totalMins = Math.round(
    (course?.sections?.reduce((a, s) =>
      a + s.lessons?.reduce((b, l) => b + (l.durationSeconds ?? 0), 0), 0) ?? 0) / 60
  );

  if (isLoading) return <Spinner />;
  if (!course) return <div className="text-center text-gray-500 py-20">Course not found.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-0">

      {/* ── HERO BANNER ─────────────────────────────────────────── */}
      <div className="relative bg-gray-950 text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-10">
        {/* bg glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 right-0 w-64 h-64 bg-accent-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: text */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {course.level && (
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${levelColors[course.level]}`}>
                  {course.level}
                </span>
              )}
              {course.category && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Globe size={12} /> {course.category}
                </span>
              )}
              {course.courseType === "EXTERNAL" && (
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full font-semibold">🔗 External</span>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold leading-tight">{course.title}</h1>
            <p className="text-gray-300 text-base leading-relaxed max-w-2xl line-clamp-3">{course.description}</p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-5 text-sm">
              <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                <Star size={16} className="fill-yellow-400" />
                {course.averageRating?.toFixed(1)}
                <span className="text-gray-400 font-normal">({course.totalReviews} reviews)</span>
              </span>
              <span className="flex items-center gap-1.5 text-gray-300">
                <Users size={15} /> {course.totalEnrollments?.toLocaleString()} students
              </span>
              {totalLessons > 0 && (
                <span className="flex items-center gap-1.5 text-gray-300">
                  <BookOpen size={15} /> {totalLessons} lessons
                </span>
              )}
              {totalMins > 0 && (
                <span className="flex items-center gap-1.5 text-gray-300">
                  <Clock size={15} /> {totalMins} min total
                </span>
              )}
            </div>

            <p className="text-gray-400 text-sm">
              Created by <span className="text-white font-medium">{course.instructorName}</span>
            </p>
          </div>

          {/* Right: enroll card — desktop only (hidden on mobile, shown below) */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <EnrollCard
              course={course}
              isEnrolled={isEnrolled}
              isAuthenticated={isAuthenticated}
              enrollMutation={enrollMutation}
              navigate={navigate}
            />
          </div>
        </div>
      </div>

      {/* Mobile enroll card */}
      <div className="lg:hidden px-0 pt-4">
        <EnrollCard
          course={course}
          isEnrolled={isEnrolled}
          isAuthenticated={isAuthenticated}
          enrollMutation={enrollMutation}
          navigate={navigate}
        />
      </div>

      {/* ── MAIN CONTENT + STICKY SIDEBAR ───────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 pt-8">
        <div className="flex-1 space-y-8 min-w-0">

          {/* Video player (when a lesson is active) */}
          {activeLesson && (
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <div className="bg-gray-900 flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <Play size={14} className="text-primary-400" />
                  <span className="text-white text-sm font-medium truncate">{activeLesson.title}</span>
                </div>
                <button onClick={() => setActiveLesson(null)} className="text-gray-400 hover:text-white text-lg w-6 h-6 flex items-center justify-center">✕</button>
              </div>
              {getEmbedUrl(activeLesson) ? (
                activeLesson.contentUrl?.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video controls autoPlay className="w-full max-h-[480px] bg-black">
                    <source src={activeLesson.contentUrl} />
                  </video>
                ) : (
                  <iframe src={getEmbedUrl(activeLesson)} className="w-full" height="420"
                    allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope" title={activeLesson.title} />
                )
              ) : activeLesson.contentType === "PDF" && activeLesson.contentUrl ? (
                <div className="p-8 text-center bg-gray-50">
                  <FileText size={40} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 mb-4">PDF Document</p>
                  <a href={activeLesson.contentUrl} target="_blank" rel="noreferrer" className="btn-primary inline-flex items-center gap-2">
                    <ExternalLink size={16} /> Open PDF
                  </a>
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 text-gray-500">
                  <p>{activeLesson.description || "No preview available."}</p>
                  {activeLesson.contentUrl && (
                    <a href={activeLesson.contentUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline text-sm mt-2 block">
                      Open Link →
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* What you'll learn */}
          {course.sections?.length > 0 && (
            <div className="border border-gray-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award size={20} className="text-primary-600" /> What you'll learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {course.sections.map((s) => (
                  <div key={s.id} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* External course — embed YouTube inline, or link for others */}
          {course.courseType === "EXTERNAL" && course.externalUrl && (() => {
            const embedUrl = getExternalEmbedUrl(course.externalUrl);
            if (embedUrl) {
              return (
                <div id="course-player" className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                  <div className="bg-gray-900 flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Play size={14} className="text-red-400" />
                      <span className="text-white text-sm font-medium">
                        {course.externalUrl.includes("playlist") ? "📺 Full Playlist" : "📺 Course Video"}
                      </span>
                    </div>
                    <a href={course.externalUrl} target="_blank" rel="noreferrer"
                      className="text-gray-400 hover:text-white text-xs flex items-center gap-1">
                      <ExternalLink size={12} /> YouTube
                    </a>
                  </div>
                  <iframe
                    src={embedUrl}
                    className="w-full"
                    height="440"
                    allowFullScreen
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title={course.title}
                  />
                </div>
              );
            }
            return (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-blue-900">
                    {course.externalUrl.includes("coursera") ? "🎓 Hosted on Coursera" :
                     course.externalUrl.includes("udemy") ? "🎓 Hosted on Udemy" : "🔗 External Course"}
                  </p>
                  <p className="text-sm text-blue-600 mt-0.5">Click to access the full course</p>
                </div>
                <a href={course.externalUrl} target="_blank" rel="noreferrer"
                  className="btn-primary text-sm flex items-center gap-2 flex-shrink-0">
                  <ExternalLink size={14} /> Open Course
                </a>
              </div>
            );
          })()}

          {/* Curriculum */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Course Content</h2>
              <div className="text-sm text-gray-500">
                {course.sections?.length} sections · {totalLessons} lessons
                {totalMins > 0 && ` · ${totalMins} min`}
              </div>
            </div>

            {course.sections?.length === 0 && course.courseType !== "EXTERNAL" && (
              <div className="text-center py-10 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                <BookOpen size={32} className="mx-auto mb-2" />
                <p>No content added yet</p>
              </div>
            )}

            <div className="space-y-2">
              {course.sections?.map((section, idx) => (
                <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Section header */}
                  <button
                    onClick={() => setOpenSection(openSection === idx ? -1 : idx)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </div>
                      <span className="font-semibold text-gray-900">{section.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 flex-shrink-0">
                      <span>{section.lessons?.length ?? 0} lessons</span>
                      {openSection === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {/* Lessons */}
                  {openSection === idx && (
                    <div className="divide-y divide-gray-50">
                      {section.lessons?.length === 0 && (
                        <p className="px-5 py-3 text-sm text-gray-400">No lessons in this section yet.</p>
                      )}
                      {section.lessons?.map((lesson) => {
                        const Icon = contentIcons[lesson.contentType] ?? BookOpen;
                        const canOpen = isEnrolled || lesson.isFreePreview;
                        const isActive = activeLesson?.id === lesson.id;
                        return (
                          <div
                            key={lesson.id}
                            onClick={() => canOpen && setActiveLesson(isActive ? null : lesson)}
                            className={`flex items-center gap-4 px-5 py-3.5 transition-all
                              ${canOpen ? "cursor-pointer" : "cursor-default"}
                              ${isActive ? "bg-primary-50 border-l-4 border-primary-500" : "hover:bg-gray-50"}`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                              <Icon size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${isActive ? "text-primary-700" : "text-gray-800"}`}>
                                {lesson.title}
                              </p>
                              {lesson.description && (
                                <p className="text-xs text-gray-400 truncate mt-0.5">{lesson.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {lesson.isFreePreview && !isEnrolled && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Preview</span>
                              )}
                              {lesson.durationSeconds > 0 && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock size={11} /> {Math.floor(lesson.durationSeconds / 60)}m
                                </span>
                              )}
                              {canOpen
                                ? <Play size={14} className={isActive ? "text-primary-500" : "text-gray-300"} />
                                : <Lock size={14} className="text-gray-300" />
                              }
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Enrolled Students — visible to instructor only */}
          {isInstructor && (() => {
            const courseEnrollments = (instructorEnrollments ?? []).filter(
              (e) => e.course?.id === Number(id) || e.courseId === Number(id)
            );
            if (courseEnrollments.length === 0 && !instructorEnrollments) return null;
            return (
              <div className="border border-primary-200 rounded-2xl overflow-hidden bg-primary-50/30">
                <div className="flex items-center justify-between px-6 py-4 bg-primary-50 border-b border-primary-100">
                  <h2 className="text-lg font-bold text-primary-900 flex items-center gap-2">
                    <Users size={18} /> Enrolled Students
                  </h2>
                  <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {courseEnrollments.length}
                  </span>
                </div>
                {courseEnrollments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">No students enrolled yet.</div>
                ) : (
                  <div className="divide-y divide-primary-100">
                    {courseEnrollments.map((e) => (
                      <div key={e.id} className="flex items-center gap-4 px-6 py-3 hover:bg-primary-50 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-primary-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {e.student?.fullName?.charAt(0) ?? "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{e.student?.fullName}</p>
                          <p className="text-xs text-gray-400">{e.student?.email}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">{e.progressPercent ?? 0}% complete</p>
                            <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-0.5">
                              <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${e.progressPercent ?? 0}%` }} />
                            </div>
                          </div>
                          {e.completed
                            ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><CheckCircle size={11} /> Done</span>
                            : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">Active</span>
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Reviews */}
          <div className="pb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Star size={20} className="text-yellow-400 fill-yellow-400" />
                Student Reviews
                <span className="text-gray-400 font-normal text-base">({reviews?.length ?? 0})</span>
              </h2>
              {isEnrolled && !showReviewForm && (
                <button onClick={() => setShowReviewForm(true)} className="btn-secondary text-sm">Write a Review</button>
              )}
            </div>

            {/* Review form */}
            {showReviewForm && (
              <div className="bg-gray-50 rounded-2xl p-5 mb-6 space-y-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900">Your Review</h3>
                <div>
                  <label className="label">Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((r) => (
                      <button key={r} type="button" onClick={() => setReview({ ...review, rating: r })}>
                        <Star size={28} className={r <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-300"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Comment</label>
                  <textarea className="input resize-none" rows={3} placeholder="Share your experience with this course..."
                    value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => reviewMutation.mutate()} disabled={reviewMutation.isPending}
                    className="btn-primary text-sm flex items-center gap-2">
                    {reviewMutation.isPending && <Loader2 size={14} className="animate-spin" />} Submit
                  </button>
                  <button onClick={() => setShowReviewForm(false)} className="btn-secondary text-sm">Cancel</button>
                </div>
              </div>
            )}

            {/* Average rating bar */}
            {reviews?.length > 0 && (
              <div className="flex items-center gap-6 bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900">{course.averageRating?.toFixed(1)}</div>
                  <StarRating rating={course.averageRating ?? 0} size={16} />
                  <p className="text-xs text-gray-500 mt-1">Course Rating</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5,4,3,2,1].map((star) => {
                    const count = reviews.filter((r) => r.rating === star).length;
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-0.5 w-16 justify-end">
                          {Array.from({length: star}).map((_, i) => <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />)}
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: pct + "%" }} />
                        </div>
                        <span className="text-gray-400 w-6">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Review cards */}
            <div className="space-y-4">
              {reviews?.map((r) => (
                <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                      {r.student?.fullName?.charAt(0) ?? "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{r.student?.fullName}</span>
                        <StarRating rating={r.rating} size={13} />
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                    </div>
                  </div>
                </div>
              ))}
              {reviews?.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <Star size={32} className="mx-auto mb-2" />
                  <p>No reviews yet. Be the first to share your experience!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── STICKY SIDEBAR (desktop) ─────────────────── */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-20 space-y-4">
            <EnrollCard
              course={course}
              isEnrolled={isEnrolled}
              isAuthenticated={isAuthenticated}
              enrollMutation={enrollMutation}
              navigate={navigate}
            />

            {/* Course stats card */}
            <div className="border border-gray-200 rounded-2xl p-5 space-y-3 bg-white">
              <h3 className="font-semibold text-gray-900">Course Includes</h3>
              <div className="space-y-2 text-sm text-gray-600">
                {totalLessons > 0 && (
                  <div className="flex items-center gap-2"><BookOpen size={15} className="text-primary-500" /> {totalLessons} lessons</div>
                )}
                {totalMins > 0 && (
                  <div className="flex items-center gap-2"><Clock size={15} className="text-primary-500" /> {totalMins} min of video</div>
                )}
                <div className="flex items-center gap-2"><Globe size={15} className="text-primary-500" /> Full lifetime access</div>
                <div className="flex items-center gap-2"><Award size={15} className="text-primary-500" /> Certificate of completion</div>
                <div className="flex items-center gap-2"><BarChart2 size={15} className="text-primary-500" />
                  {course.level ?? "All levels"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Enroll Card Component ─────────────────────────────────── */
function EnrollCard({ course, isEnrolled, isAuthenticated, enrollMutation, navigate }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
      {/* Thumbnail preview */}
      <CourseThumbnail title={course.title} category={course.category} size="sm" className="h-36" />

      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-green-600">Free</span>
          <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">🎓 No cost</span>
        </div>

        {course.courseType === "EXTERNAL" && course.externalUrl ? (
          <a
            href={course.externalUrl.includes("youtube") || course.externalUrl.includes("youtu.be")
              ? "#course-player"
              : course.externalUrl}
            target={course.externalUrl.includes("youtube") || course.externalUrl.includes("youtu.be") ? "_self" : "_blank"}
            rel="noreferrer"
            className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm">
            <Play size={16} />
            {course.externalUrl.includes("youtube") || course.externalUrl.includes("youtu.be")
              ? "▶ Play Course"
              : course.externalUrl.includes("coursera") ? "Open on Coursera"
              : course.externalUrl.includes("udemy") ? "Open on Udemy"
              : "Open Course"}
          </a>
        ) : isEnrolled ? (
          <div className="w-full py-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center gap-2 text-green-700 font-semibold text-sm">
            <CheckCircle size={18} /> You're enrolled!
          </div>
        ) : isAuthenticated ? (
          <button onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isPending}
            className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2">
            {enrollMutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Enroll for Free
          </button>
        ) : (
          <button onClick={() => navigate("/login")}
            className="w-full btn-primary py-3 text-sm">
            Login to Enroll
          </button>
        )}

        <div className="space-y-2 text-xs text-gray-500 border-t border-gray-100 pt-3">
          <p className="flex items-center gap-2"><CheckCircle size={12} className="text-green-500" /> Instant access after enrollment</p>
          <p className="flex items-center gap-2"><CheckCircle size={12} className="text-green-500" /> Learn at your own pace</p>
          <p className="flex items-center gap-2"><CheckCircle size={12} className="text-green-500" /> Access on all devices</p>
        </div>
      </div>
    </div>
  );
}
