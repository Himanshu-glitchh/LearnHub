import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Calendar, Loader2 } from "lucide-react";
import { classroomApi } from "../../api/classroom";
import { useAuthStore } from "../../store/authStore";
import Spinner from "../../components/shared/Spinner";
import toast from "react-hot-toast";

export default function ClassroomsPage() {
  const { hasRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "" });

  const { data: classrooms, isLoading } = useQuery({
    queryKey: ["myClassrooms"],
    queryFn: () => classroomApi.list().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => classroomApi.create(createForm),
    onSuccess: () => {
      toast.success("Classroom created!");
      queryClient.invalidateQueries(["myClassrooms"]);
      setShowCreate(false);
      setCreateForm({ name: "", description: "" });
    },
    onError: () => toast.error("Failed to create classroom"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classrooms</h1>
          <p className="text-gray-500 mt-1">Manage or join structured learning cohorts</p>
        </div>
        {hasRole("ROLE_INSTRUCTOR") && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Create Classroom
          </button>
        )}
      </div>


      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Create Classroom</h2>
            <div>
              <label className="label">Classroom Name</label>
              <input className="input" placeholder="e.g. React Bootcamp 2026"
                value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <textarea className="input resize-none" rows={3} placeholder="What will students learn?"
                value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCreate(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={() => createMutation.mutate()} disabled={!createForm.name || createMutation.isPending}
                className="btn-primary text-sm flex items-center gap-2">
                {createMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Classroom list */}
      {isLoading ? (
        <Spinner />
      ) : classrooms?.length === 0 ? (
        <div className="card text-center py-12 text-gray-500">
          <Users size={40} className="mx-auto mb-2 text-gray-300" />
          <p>You haven't joined any classrooms yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classrooms?.map((classroom) => (
            <Link key={classroom.id} to={`/classrooms/${classroom.id}`}
              className="card hover:shadow-lg hover:-translate-y-0.5 transition-all block group">
              <div className="flex items-start justify-between mb-3">
                <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                  <Users size={18} />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{classroom.name}</h3>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{classroom.description}</p>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar size={12} /> by {classroom.instructorName}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
