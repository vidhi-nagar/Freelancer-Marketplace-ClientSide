import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import newRequest from "../utils/newRequest";
import useAuthStore from "../store/authStore";

export default function Messages() {
  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: conversations, isLoading, error } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => newRequest.get("/conversations").then((res) => res.data),
  });

  const markRead = useMutation({
    mutationFn: (id) => newRequest.put(`/conversations/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["conversations"]),
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center pt-28">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-secondary mb-8">Messages</h1>

        {conversations?.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-secondary mb-2">No conversations yet</h3>
            <p className="text-gray-500">Start chatting with sellers from a gig page</p>
          </div>
        )}

        {conversations?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {conversations.map((conv) => {
              const isUnread = currentUser?.isSeller ? !conv.readBySeller : !conv.readByBuyer;
              return (
                <Link
                  key={conv.id}
                  to={`/messages/${conv.id}`}
                  onClick={() => isUnread && markRead.mutate(conv.id)}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${isUnread ? "bg-primary/5" : ""}`}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary flex-shrink-0">
                    💬
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium text-secondary truncate ${isUnread ? "font-bold" : ""}`}>
                        {currentUser?.isSeller ? `Buyer: ${conv.buyerId.substring(0, 8)}...` : `Seller: ${conv.sellerId.substring(0, 8)}...`}
                      </p>
                      <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {conv.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  {isUnread && (
                    <span className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0"></span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
