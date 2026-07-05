import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../../api/auth";
import toast from "react-hot-toast";

const ROLES = [
  { value: "STUDENT", label: "Student — I want to learn" },
  { value: "INSTRUCTOR", label: "Instructor — I want to teach" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "STUDENT" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Minimum 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: () => authApi.register(form).then((r) => r.data),
    onSuccess: (data) => {
      toast.success(data.message || "Registered! Please log in.");
      navigate("/login");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Registration failed"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex bg-primary-600 text-white p-3 rounded-xl mb-3">
            <BookOpen size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join thousands of learners on LearnHub</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" placeholder="John Doe"
              value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="label">Email</label>
            <input type="email" className="input" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <input type="password" className="input" placeholder="Min. 8 characters"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="label">I am joining as</label>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <label key={r.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    form.role === r.value ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:bg-gray-50"
                  }`}>
                  <input type="radio" name="role" value={r.value} checked={form.role === r.value}
                    onChange={(e) => setForm({ ...form, role: e.target.value })} className="text-primary-600" />
                  <span className="text-sm font-medium text-gray-700">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={mutation.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
            {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
