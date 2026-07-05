import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, BookOpen, Trophy, Calendar, Code2, Info } from "lucide-react";
import { notificationsApi } from "../../api/notifications";
import Spinner from "../../components/shared/Spinner";
import toast from "react-hot-toast";

const typeIcons = {
  ENROLLMENT: { icon: BookOpen, color: "text-blue-500 bg-blue-50" },
  QUIZ: { icon: Trophy, color: "text-yellow-500 bg-yellow-50" },
  ASSIGNMENT: { icon: Calendar, color: "text-purple-500 bg-purple-50" },
  BOOKING: { icon: Calendar, color: "text-green-500 bg-green-50" },
  REVIEW: { icon: Trophy, color: "text-pink-500 bg-pink-50" },
  SYSTEM: { icon: Info, color: "text-gray-500 bg-gray-50" },
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list().then((r) => r.data),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      toast.success("All notifications marked as read");
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries(["notifications"]),
  });

  const unread = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unread > 0 && <p className="text-sm text-gray-500 mt-0.5">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <Spinner />
      ) : notifications?.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">
          <Bell size={40} className="mx-auto mb-2 text-gray-300" />
          <p>You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications?.map((notif) => {
            const config = typeIcons[notif.type] ?? typeIcons.SYSTEM;
            const Icon = config.icon;
            return (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markOneMutation.mutate(notif.id)}
                className={`card flex items-start gap-4 cursor-pointer transition-all ${
                  !notif.isRead ? "border-primary-200 bg-primary-50/40" : ""
                } hover:shadow-md`}
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${config.color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notif.isRead ? "font-medium text-gray-900" : "text-gray-600"}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
