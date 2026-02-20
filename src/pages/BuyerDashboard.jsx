import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import newRequest from "../utils/newRequest";
import useAuthStore from "../store/authStore";

export default function BuyerDashboard() {
  const { currentUser } = useAuthStore();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => newRequest.get("/orders").then((res) => res.data),
  });

  const { data: conversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => newRequest.get("/conversations").then((res) => res.data),
  });

  const totalSpent = orders?.reduce((sum, o) => sum + o.price, 0) || 0;
  const completedOrders = orders?.filter((o) => o.status === "completed").length || 0;
  const activeOrders = orders?.filter((o) => o.status === "in_progress").length || 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary">My Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome, {currentUser?.username}! 👋</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total Orders", value: orders?.length || 0, icon: "📦", color: "bg-blue-50 border-blue-100" },
            { label: "Total Spent", value: `$${totalSpent}`, icon: "💳", color: "bg-green-50 border-green-100" },
            { label: "Completed", value: completedOrders, icon: "✅", color: "bg-purple-50 border-purple-100" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl p-5 border ${stat.color}`}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className="text-2xl font-bold text-secondary">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="text-xl font-bold text-secondary">Recent Orders</h2>
              <Link to="/orders" className="text-primary text-sm hover:underline font-medium">View All</Link>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : orders?.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-gray-500 mb-4">No orders yet</p>
                <Link to="/gigs" className="btn-primary text-sm">Browse Services</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {orders.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      {order.img && <img src={order.img} alt={order.title} className="w-10 h-8 rounded object-cover" />}
                      <div>
                        <p className="text-sm font-medium text-secondary line-clamp-1 max-w-48">{order.title}</p>
                        <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-secondary text-sm">${order.price}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        order.status === "completed" ? "bg-green-100 text-green-700" :
                        order.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions + Messages */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-secondary mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Browse Gigs", to: "/gigs", icon: "🔍" },
                  { label: "My Orders", to: "/orders", icon: "📦" },
                  { label: "Messages", to: "/messages", icon: "💬" },
                  { label: "My Profile", to: `/profile/${currentUser?._id}`, icon: "👤" },
                ].map((action) => (
                  <Link key={action.label} to={action.to}
                    className="flex items-center gap-2 p-3 rounded-lg border border-gray-100 hover:border-primary hover:text-primary transition-colors text-secondary font-medium text-sm">
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <h2 className="text-lg font-bold text-secondary">Recent Messages</h2>
                <Link to="/messages" className="text-primary text-sm hover:underline">View All</Link>
              </div>
              {conversations?.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">No messages yet</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {conversations?.slice(0, 3).map((conv) => (
                    <Link key={conv.id} to={`/messages/${conv.id}`} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">💬</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500 truncate">{conv.lastMessage || "No messages yet"}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
