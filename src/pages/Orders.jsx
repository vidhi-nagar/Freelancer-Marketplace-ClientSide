import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import newRequest from "../utils/newRequest";
import useAuthStore from "../store/authStore";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  delivered: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABELS = {
  pending: "Pending",
  in_progress: "In Progress",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function Orders() {
  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: () => newRequest.get("/orders").then((res) => res.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => newRequest.put(`/orders/status/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries(["orders"]),
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center pt-28">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-secondary mb-2">
          {currentUser?.isSeller ? "Received Orders" : "My Orders"}
        </h1>
        <p className="text-gray-500 mb-8">
          {currentUser?.isSeller ? "Orders from your clients" : "Track your purchased services"}
        </p>

        {error && (
          <div className="text-center py-10 text-red-500">Failed to load orders.</div>
        )}

        {orders?.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-secondary mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">{currentUser?.isSeller ? "You haven't received any orders yet" : "You haven't purchased any services yet"}</p>
            {!currentUser?.isSeller && (
              <Link to="/gigs" className="btn-primary">Browse Gigs</Link>
            )}
          </div>
        )}

        {orders?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-secondary">Gig</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-secondary">Price</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-secondary">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {order.img && (
                            <img src={order.img} alt={order.title} className="w-12 h-10 object-cover rounded-lg" />
                          )}
                          <div>
                            <p className="font-medium text-secondary text-sm line-clamp-1">{order.title}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-secondary">${order.price}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {currentUser?.isSeller && order.status === "in_progress" && (
                            <button
                              onClick={() => updateStatus.mutate({ id: order._id, status: "delivered" })}
                              className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-medium hover:bg-purple-200 transition-colors"
                            >
                              Mark Delivered
                            </button>
                          )}
                          {!currentUser?.isSeller && order.status === "delivered" && (
                            <button
                              onClick={() => updateStatus.mutate({ id: order._id, status: "completed" })}
                              className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium hover:bg-green-200 transition-colors"
                            >
                              Complete Order
                            </button>
                          )}
                          <Link to="/messages" className="text-xs text-primary hover:underline font-medium">
                            Message
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
