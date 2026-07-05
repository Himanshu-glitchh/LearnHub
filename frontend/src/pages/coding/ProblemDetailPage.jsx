import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ExternalLink, CheckCircle, Bookmark, Code2, ChevronDown, ChevronUp } from "lucide-react";
import { codingApi } from "../../api/coding";
import Spinner from "../../components/shared/Spinner";
import toast from "react-hot-toast";

const EXTERNAL_LINKS = {
  "Two Sum": "https://leetcode.com/problems/two-sum/",
  "Best Time to Buy and Sell Stock": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
  "Valid Parentheses": "https://leetcode.com/problems/valid-parentheses/",
  "Reverse Linked List": "https://leetcode.com/problems/reverse-linked-list/",
  "Merge Two Sorted Lists": "https://leetcode.com/problems/merge-two-sorted-lists/",
  "Binary Search": "https://leetcode.com/problems/binary-search/",
  "Climbing Stairs": "https://leetcode.com/problems/climbing-stairs/",
  "Longest Common Prefix": "https://leetcode.com/problems/longest-common-prefix/",
  "Maximum Depth of Binary Tree": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
  "Symmetric Tree": "https://leetcode.com/problems/symmetric-tree/",
  "Add Two Numbers": "https://leetcode.com/problems/add-two-numbers/",
  "Longest Substring Without Repeating Characters": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
  "3Sum": "https://leetcode.com/problems/3sum/",
  "Container With Most Water": "https://leetcode.com/problems/container-with-most-water/",
  "Coin Change": "https://leetcode.com/problems/coin-change/",
  "Number of Islands": "https://leetcode.com/problems/number-of-islands/",
  "Word Search": "https://leetcode.com/problems/word-search/",
  "LRU Cache": "https://leetcode.com/problems/lru-cache/",
  "Merge Intervals": "https://leetcode.com/problems/merge-intervals/",
  "Decode Ways": "https://leetcode.com/problems/decode-ways/",
  "Median of Two Sorted Arrays": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
  "Trapping Rain Water": "https://leetcode.com/problems/trapping-rain-water/",
  "Word Ladder": "https://leetcode.com/problems/word-ladder/",
  "Serialize and Deserialize Binary Tree": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
  "Edit Distance": "https://leetcode.com/problems/edit-distance/",
};

const diffColors = { EASY: "badge-easy", MEDIUM: "badge-medium", HARD: "badge-hard" };

export default function ProblemDetailPage() {
  const { id } = useParams();
  const [code, setCode] = useState("// Write your solution here\n");
  const [lang, setLang] = useState("Java");
  const [showSolution, setShowSolution] = useState(false);

  const { data: problem, isLoading } = useQuery({
    queryKey: ["problem", id],
    queryFn: () => codingApi.getProblem(id).then((r) => r.data),
  });

  const { data: myAttempts } = useQuery({
    queryKey: ["myProblemAttempts"],
    queryFn: () => codingApi.myAttempts().then((r) => r.data),
  });

  const myStatus = myAttempts?.find((a) => a.problem?.id === Number(id) || a.problemId === Number(id))?.status;

  const markMutation = useMutation({
    mutationFn: (status) => codingApi.submitAttempt(id, { status, solutionCode: code, language: lang }),
    onSuccess: (_, status) => toast.success(status === "SOLVED" ? "Marked as solved! 🎉" : "Bookmarked!"),
    onError: () => toast.error("Failed"),
  });

  if (isLoading) return <Spinner />;
  if (!problem) return <div className="text-center py-20 text-gray-500">Problem not found.</div>;

  const leetcodeUrl = EXTERNAL_LINKS[problem.title];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{problem.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={diffColors[problem.difficulty]}>{problem.difficulty}</span>
              <span className="text-sm text-gray-500">{problem.topic}</span>
              <span className="text-sm text-gray-400">Acceptance: {problem.acceptanceRate}%</span>
              {problem.companyTags?.map((tag) => (
                <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {myStatus === "SOLVED" && (
              <span className="flex items-center gap-1 text-green-600 text-sm font-semibold"><CheckCircle size={16} /> Solved</span>
            )}
            {myStatus === "BOOKMARKED" && (
              <span className="flex items-center gap-1 text-purple-600 text-sm font-semibold"><Bookmark size={16} /> Bookmarked</span>
            )}
            {leetcodeUrl && (
              <a href={leetcodeUrl} target="_blank" rel="noreferrer"
                className="btn-primary text-sm flex items-center gap-2">
                <ExternalLink size={14} /> Solve on LeetCode
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem description */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-3">Problem Description</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{problem.description}</p>
          </div>

          {(problem.exampleInput || problem.exampleOutput) && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-3">Example</h2>
              {problem.exampleInput && (
                <div className="mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Input:</span>
                  <pre className="bg-gray-50 rounded-lg p-3 text-sm mt-1 overflow-x-auto">{problem.exampleInput}</pre>
                </div>
              )}
              {problem.exampleOutput && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Output:</span>
                  <pre className="bg-gray-50 rounded-lg p-3 text-sm mt-1 overflow-x-auto">{problem.exampleOutput}</pre>
                </div>
              )}
            </div>
          )}

          {problem.constraints && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-2">Constraints</h2>
              <p className="text-sm text-gray-600 font-mono">{problem.constraints}</p>
            </div>
          )}
        </div>

        {/* Code editor (basic textarea) */}
        <div className="space-y-4">
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
              <div className="flex items-center gap-2">
                <Code2 size={14} className="text-gray-400" />
                <span className="text-sm text-gray-300 font-medium">Code Editor</span>
              </div>
              <select className="bg-gray-700 text-gray-200 text-xs rounded px-2 py-1 border-0 outline-none"
                value={lang} onChange={(e) => setLang(e.target.value)}>
                {["Java", "Python", "JavaScript", "C++", "Go"].map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <textarea
              className="w-full bg-gray-900 text-green-400 font-mono text-sm p-4 resize-none outline-none"
              rows={16}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={() => markMutation.mutate("SOLVED")}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
              <CheckCircle size={16} /> Mark as Solved
            </button>
            <button onClick={() => markMutation.mutate("BOOKMARKED")}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
              <Bookmark size={16} /> Bookmark
            </button>
          </div>

          {leetcodeUrl && (
            <a href={leetcodeUrl} target="_blank" rel="noreferrer"
              className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
              <ExternalLink size={16} /> Open & Run on LeetCode
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
