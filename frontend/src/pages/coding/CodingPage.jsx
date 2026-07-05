import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Code2, Search, Filter, CheckCircle, Bookmark } from "lucide-react";
import { codingApi } from "../../api/coding";
import Spinner from "../../components/shared/Spinner";

const TOPICS = ["All", "Arrays", "Strings", "LinkedList", "Trees", "Graphs", "DP", "Sorting", "Binary Search", "Recursion"];
const DIFFICULTIES = ["All", "EASY", "MEDIUM", "HARD"];

export default function CodingPage() {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState("All");

  const { data: problems, isLoading } = useQuery({
    queryKey: ["problems", topic, difficulty, search],
    queryFn: () =>
      codingApi.listProblems({
        topic: topic !== "All" ? topic : undefined,
        difficulty: difficulty !== "All" ? difficulty : undefined,
        search: search || undefined,
      }).then((r) => r.data?.content ?? r.data),
  });

  const { data: myAttempts } = useQuery({
    queryKey: ["myProblemAttempts"],
    queryFn: () => codingApi.myAttempts().then((r) => r.data),
  });

  const solvedIds = new Set(myAttempts?.filter((a) => a.status === "SOLVED").map((a) => a.problemId));
  const bookmarkedIds = new Set(myAttempts?.filter((a) => a.status === "BOOKMARKED").map((a) => a.problemId));

  const diffColors = { EASY: "badge-easy", MEDIUM: "badge-medium", HARD: "badge-hard" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Coding Interview Prep</h1>
        <p className="text-gray-500 mt-1">Practice DSA problems, track your progress, discuss solutions</p>
      </div>

      {/* Stats */}
      {myAttempts?.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">{solvedIds.size}</div>
            <div className="text-sm text-gray-500">Solved</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-600">{myAttempts.length}</div>
            <div className="text-sm text-gray-500">Attempted</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-purple-600">{bookmarkedIds.size}</div>
            <div className="text-sm text-gray-500">Bookmarked</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input className="input pl-9" placeholder="Search problems..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input md:w-44" value={topic} onChange={(e) => setTopic(e.target.value)}>
          {TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select className="input md:w-36" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* Problem table */}
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">#</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Title</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Topic</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Difficulty</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Acceptance</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {problems?.map((problem, idx) => (
                <tr key={problem.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-4">
                    <Link to={`/problems/${problem.id}`}
                      className="font-medium text-gray-900 hover:text-primary-600 transition-colors">
                      {problem.title}
                    </Link>
                    {problem.companyTags?.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {problem.companyTags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-gray-500">{problem.topic}</td>
                  <td className="px-4 py-4">
                    <span className={diffColors[problem.difficulty]}>{problem.difficulty}</span>
                  </td>
                  <td className="px-4 py-4 text-gray-500">{problem.acceptanceRate}%</td>
                  <td className="px-4 py-4">
                    {solvedIds.has(problem.id) ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : bookmarkedIds.has(problem.id) ? (
                      <Bookmark size={16} className="text-purple-500" />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {problems?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Code2 size={32} className="mx-auto mb-2 text-gray-300" />
              No problems found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
