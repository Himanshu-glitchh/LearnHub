import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, Users, BookOpen, Filter } from "lucide-react";
import { coursesApi } from "../../api/courses";
import CourseThumbnail from "../../components/shared/CourseThumbnail";
import Spinner from "../../components/shared/Spinner";

const CATEGORIES = ["All", "Web Dev", "Data Science", "Design", "Business", "DevOps", "Mobile", "AI/ML"];
const LEVELS = ["All", "BEGINNER", "INTERMEDIATE", "ADVANCED"];

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["courses", search, category, level, page],
    queryFn: () =>
      coursesApi.list({
        search: search || undefined,
        category: category !== "All" ? category : undefined,
        level: level !== "All" ? level : undefined,
        page,
        size: 12,
      }).then((r) => r.data),
    keepPreviousData: true,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Explore Courses</h1>
        <p className="text-gray-500 text-lg">Learn from expert instructors — all courses are free</p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto relative">
        <Search size={20} className="absolute left-4 top-3.5 text-gray-400" />
        <input
          className="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          placeholder="Search courses, topics or instructors..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        {CATEGORIES.map((c) => (
          <button key={c}
            onClick={() => { setCategory(c); setPage(0); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              category === c
                ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600"
            }`}>
            {c}
          </button>
        ))}
        <select
          className="px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-primary-300 focus:outline-none"
          value={level}
          onChange={(e) => { setLevel(e.target.value); setPage(0); }}>
          {LEVELS.map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>

      {/* Results count */}
      {data && (
        <p className="text-sm text-gray-400 text-center">
          {data.totalElements} course{data.totalElements !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <Spinner />
      ) : data?.content?.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <BookOpen size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="text-lg font-medium">No courses found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.content?.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {data?.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-4">
              <button disabled={page === 0} onClick={() => setPage(page - 1)}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
              <span className="text-sm text-gray-500">Page {page + 1} of {data?.totalPages}</span>
              <button disabled={page + 1 >= data?.totalPages} onClick={() => setPage(page + 1)}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CourseCard({ course }) {
  const levelBadge = {
    BEGINNER: { cls: "bg-green-100 text-green-700", label: "Beginner" },
    INTERMEDIATE: { cls: "bg-yellow-100 text-yellow-700", label: "Intermediate" },
    ADVANCED: { cls: "bg-red-100 text-red-700", label: "Advanced" },
  };
  const badge = levelBadge[course.level];

  return (
    <Link to={`/courses/${course.id}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden block">

      {/* Thumbnail */}
      <div className="relative overflow-hidden">
        {course.thumbnailUrl
          ? <img src={course.thumbnailUrl} alt={course.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
          : <CourseThumbnail title={course.title} category={course.category} size="md" className="group-hover:scale-105 transition-transform duration-300" />
        }
        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">Free</span>
          {course.courseType === "EXTERNAL" && (
            <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
              {course.externalUrl?.includes("youtube") ? "▶ YouTube" : "🔗 External"}
            </span>
          )}
        </div>
        {badge && (
          <div className="absolute top-3 right-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{course.category}</p>
        <h3 className="font-bold text-gray-900 leading-snug mb-1 group-hover:text-primary-600 transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="text-xs text-gray-500 mb-3">by {course.instructorName}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1 font-medium text-yellow-600">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            {course.averageRating?.toFixed(1)}
            <span className="text-gray-400 font-normal">({course.totalReviews})</span>
          </span>
          <span className="flex items-center gap-1">
            <Users size={11} /> {course.totalEnrollments?.toLocaleString()}
          </span>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-sm font-bold text-green-600">Free</span>
          <span className="text-xs font-semibold text-primary-600 group-hover:gap-2 flex items-center gap-1 transition-all">
            View Course <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
