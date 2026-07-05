import { Link } from "react-router-dom";
import { BookOpen, Code2, Users, Trophy, ArrowRight, MessageCircle } from "lucide-react";

const features = [
  { icon: BookOpen, title: "Free Courses", desc: "Expert-crafted courses across Web Dev, Data Science, Design and more.", color: "bg-blue-50 text-blue-600" },
  { icon: Users, title: "Live Classrooms", desc: "Enroll in structured cohorts with assignments and grading.", color: "bg-purple-50 text-purple-600" },
  { icon: Trophy, title: "Quizzes & Tests", desc: "Timed quizzes with 5 questions · 5 min timer. Retry if you fail.", color: "bg-yellow-50 text-yellow-600" },
  { icon: Code2, title: "Coding Prep", desc: "25+ DSA problems linked to LeetCode. Track solved & bookmarked.", color: "bg-green-50 text-green-600" },
];

const stats = [
  { label: "Courses", value: "500+" },
  { label: "Students", value: "12K+" },
  { label: "Instructors", value: "200+" },
  { label: "Problems", value: "1000+" },
];

export default function HomePage() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="text-center py-16">
        <span className="inline-block bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          🚀 All-in-One EdTech Platform
        </span>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          Learn Anything,<br />
          <span className="text-primary-600">Teach Everyone</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          Courses, live classrooms, quizzes, peer tutoring, and coding interview prep — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="btn-primary px-6 py-3 text-base flex items-center gap-2">
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link to="/courses" className="btn-secondary px-6 py-3 text-base">
            Browse Courses
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-10 mt-12">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Everything you need to grow</h2>
          <p className="text-gray-500 mt-2">One platform, every learning tool.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card hover:shadow-md transition-shadow">
              <div className={`${f.color} w-10 h-10 rounded-lg flex items-center justify-center mb-4`}>
                <f.icon size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary-600 rounded-2xl p-10 text-center text-white">
        <h2 className="text-3xl font-bold mb-3">Ready to start learning?</h2>
        <p className="text-primary-100 mb-6">Join thousands of students already on LearnHub.</p>
        <Link to="/register" className="bg-white text-primary-600 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors inline-flex items-center gap-2">
          Join for Free <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
