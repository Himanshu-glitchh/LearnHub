import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User, Mail, BookOpen, Shield, Pencil, Save, X,
  Lock, CheckCircle, GraduationCap, Award, Loader2
} from "lucide-react";
import { profileApi } from "../../api/profile";
import { coursesApi } from "../../api/courses";
import { useAuthStore } from "../../store/authStore";
import { quizApi } from "../../api/quiz";
import Spinner from "../../components/shared/Spinner";
import toast from "react-hot-toast";

const ROLE_LABELS = {
  ROLE_STUDENT: { label: "Student", color: "bg-blue-100 text-blue-700", icon: GraduationCap },
  ROLE_INSTRUCTOR: { label: "Instructor", color: "bg-purple-100 text-purple-700", icon: BookOpen },
  ROLE_TUTOR: { label: "Tutor", color: "bg-green-100 text-green-700", icon: Award },
  ROLE_ADMIN: { label: "Admin", color: "bg-red-100 text-red-700", icon: Shield },
};

export default function ProfilePage() {
  const { user: authUser, setAuth, accessToken, refreshToken } = useAuthStore();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["myProfile"],
    queryFn: () => profileApi.getMe().then((r) => r.data),
  });

  const { data: enrollments } = useQuery({
    queryKey: ["myEnrollments"],
    queryFn: () => coursesApi.myEnrollments().then((r) => r.data),
  });

  const { data: quizAttempts } = useQuery({
    queryKey: ["myQuizAttempts"],
    queryFn: () => quizApi.myAttempts().then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: () => profileApi.update(form),
    onSuccess: (res) => {
      toast.success("Profile updated!");
      queryClient.invalidateQueries(["myProfile"]);
      // Update the auth store with new name
      setAuth(
        { ...authUser, fullName: res.data.fullName },
        accessToken, refreshToken
      );
      setEditing(false);
    },
    onError: () => toast.error("Update failed"),
  });

  const passwordMutation = useMutation({
    mutationFn: () => profileApi.changePassword({
      currentPassword: pwForm.currentPassword,
      newPassword: pwForm.newPassword,
    }),
    onSuccess: () => {
      toast.success("Password changed!");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
      setShowPw(false);
    },
    onError: (e) => setPwError(e.response?.data?.message || "Failed to change password"),
  });

  const startEdit = () => {
    setForm({
      fullName: profile?.fullName ?? "",
      bio: profile?.bio ?? "",
      headline: profile?.headline ?? "",
    });
    setEditing(true);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPwError("");
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError("New passwords don't match");
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    passwordMutation.mutate();
  };

  if (isLoading) return <Spinner />;

  const completedCourses = enrollments?.filter((e) => e.completed).length ?? 0;
  const passedQuizzes = quizAttempts?.filter((a) => a.passed).length ?? 0;
  const avatarLetter = profile?.fullName?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ── PROFILE HERO ─────────────────────────── */}
      <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center text-4xl font-bold flex-shrink-0">
            {avatarLetter}
          </div>
          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profile?.fullName}</h1>
            {profile?.headline && <p className="text-primary-100 mt-0.5">{profile.headline}</p>}
            <p className="text-primary-200 text-sm mt-1 flex items-center gap-1.5">
              <Mail size={13} /> {profile?.email}
            </p>
            {/* Roles */}
            <div className="flex flex-wrap gap-2 mt-3">
              {profile?.roles?.map((role) => {
                const r = ROLE_LABELS[role] ?? { label: role, color: "bg-white/20 text-white", icon: User };
                const Icon = r.icon;
                return (
                  <span key={role} className="flex items-center gap-1 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    <Icon size={11} /> {r.label}
                  </span>
                );
              })}
            </div>
          </div>
          <button onClick={startEdit}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Pencil size={14} /> Edit Profile
          </button>
        </div>
      </div>

      {/* ── STATS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Courses Enrolled", value: enrollments?.length ?? 0, icon: BookOpen, color: "text-blue-600 bg-blue-50" },
          { label: "Completed", value: completedCourses, icon: CheckCircle, color: "text-green-600 bg-green-50" },
          { label: "Quizzes Taken", value: quizAttempts?.length ?? 0, icon: Award, color: "text-yellow-600 bg-yellow-50" },
          { label: "Quizzes Passed", value: passedQuizzes, icon: GraduationCap, color: "text-purple-600 bg-purple-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card text-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${color}`}>
              <Icon size={20} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── PROFILE INFO ──────────────────────── */}
        <div className="card space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2"><User size={18} /> Personal Info</h2>
            {!editing && (
              <button onClick={startEdit} className="text-primary-600 text-sm hover:underline flex items-center gap-1">
                <Pencil size={13} /> Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input" value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <label className="label">Headline</label>
                <input className="input" placeholder="e.g. Full Stack Developer | React Enthusiast"
                  value={form.headline}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })} />
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea className="input resize-none" rows={4}
                  placeholder="Tell others a bit about yourself..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                  className="btn-primary text-sm flex items-center gap-2">
                  {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Changes
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary text-sm flex items-center gap-2">
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <InfoRow icon={User} label="Full Name" value={profile?.fullName} />
              <InfoRow icon={Mail} label="Email" value={profile?.email} />
              <InfoRow icon={Shield} label="Roles" value={profile?.roles?.map((r) => ROLE_LABELS[r]?.label ?? r).join(", ")} />
              {profile?.headline && <InfoRow icon={Award} label="Headline" value={profile.headline} />}
              {profile?.bio && (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Bio</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}
              {!profile?.headline && !profile?.bio && (
                <p className="text-sm text-gray-400 italic">No bio added yet. Click Edit to add one.</p>
              )}
            </div>
          )}
        </div>

        {/* ── CHANGE PASSWORD ──────────────────── */}
        <div className="card space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2"><Lock size={18} /> Security</h2>
            {!showPw && (
              <button onClick={() => setShowPw(true)} className="text-primary-600 text-sm hover:underline flex items-center gap-1">
                <Pencil size={13} /> Change Password
              </button>
            )}
          </div>

          {showPw ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input type="password" className="input" value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
              </div>
              <div>
                <label className="label">New Password</label>
                <input type="password" className="input" placeholder="Min. 8 characters"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input type="password" className="input"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
              </div>
              {pwError && <p className="text-red-500 text-sm">{pwError}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={passwordMutation.isPending}
                  className="btn-primary text-sm flex items-center gap-2">
                  {passwordMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                  Update Password
                </button>
                <button type="button" onClick={() => { setShowPw(false); setPwError(""); }}
                  className="btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">Password is set</p>
                  <p className="text-xs text-green-600">Your account is secured with a password</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                For security, we never display your password. Use the "Change Password" option to update it.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── ENROLLED COURSES ──────────────────── */}
      {enrollments?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen size={18} /> My Learning
          </h2>
          <div className="space-y-3">
            {enrollments.map((e) => (
              <div key={e.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen size={18} className="text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {e.courseTitle ?? e.course?.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div className="bg-primary-500 h-1.5 rounded-full"
                        style={{ width: `${e.progressPercent ?? 0}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{e.progressPercent ?? 0}%</span>
                  </div>
                </div>
                {e.completed && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-semibold flex-shrink-0">
                    <CheckCircle size={13} /> Done
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-gray-500" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}
