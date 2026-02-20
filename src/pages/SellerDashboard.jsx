import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import newRequest from "../utils/newRequest";
import useAuthStore from "../store/authStore";

export default function SellerDashboard() {
  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: gigs, isLoading: gigsLoading } = useQuery({
    queryKey: ["sellerGigs"],
    queryFn: () => newRequest.get("/gigs/seller/mygigs").then((res) => res.data),
  });

  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: () => newRequest.get("/orders").then((res) => res.data),
  });

  const deleteGig = useMutation({
    mutationFn: (id) => newRequest.delete(`/gigs/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["sellerGigs"]),
  });

  const totalEarnings = orders?.reduce((sum, o) => sum + (o.isCompleted ? o.price : 0), 0) || 0;
  const activeOrders = orders?.filter((o) => o.status === "in_progress").length || 0;
  const completedOrders = orders?.filter((o) => o.status === "completed").length || 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary">Seller Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {currentUser?.username}! 👋</p>
          </div>
          <Link to="/add-gig" className="btn-primary flex items-center gap-2">
            <span>+</span> New Gig
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Gigs", value: gigs?.length || 0, icon: "📋", color: "bg-blue-50 border-blue-100" },
            { label: "Total Earnings", value: `$${totalEarnings}`, icon: "💰", color: "bg-green-50 border-green-100" },
            { label: "Active Orders", value: activeOrders, icon: "⚡", color: "bg-yellow-50 border-yellow-100" },
            { label: "Completed", value: completedOrders, icon: "✅", color: "bg-purple-50 border-purple-100" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl p-5 border ${stat.color}`}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className="text-2xl font-bold text-secondary">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* My Gigs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-xl font-bold text-secondary">My Gigs</h2>
            <span className="text-sm text-gray-400">{gigs?.length || 0} total</span>
          </div>

          {gigsLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : gigs?.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="font-bold text-secondary mb-2">No gigs yet</h3>
              <p className="text-gray-500 mb-4">Create your first gig to start selling</p>
              <Link to="/add-gig" className="btn-primary text-sm">Create Gig</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-secondary">Gig</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-secondary">Price</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-secondary">Sales</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-secondary">Rating</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {gigs.map((gig) => (
                    <tr key={gig._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={gig.cover} alt={gig.title} className="w-14 h-10 object-cover rounded-lg" />
                          <div>
                            <p className="font-medium text-secondary text-sm line-clamp-1 max-w-xs">{gig.title}</p>
                            <p className="text-xs text-gray-400">{gig.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-secondary">${gig.price}</td>
                      <td className="px-6 py-4 text-secondary">{gig.sales}</td>
                      <td className="px-6 py-4">
                        {gig.starNumber > 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm font-medium">{(gig.totalStars / gig.starNumber).toFixed(1)}</span>
                            <span className="text-gray-400 text-xs">({gig.starNumber})</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No reviews</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link to={`/gig/${gig._id}`} className="text-sm text-primary hover:underline font-medium">View</Link>
                          <Link to={`/edit-gig/${gig._id}`} className="text-sm text-blue-500 hover:underline font-medium">Edit</Link>
                          <button
                            onClick={() => {
                              if (window.confirm("Delete this gig?")) deleteGig.mutate(gig._id);
                            }}
                            className="text-sm text-red-500 hover:underline font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        {orders?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="text-xl font-bold text-secondary">Recent Orders</h2>
              <Link to="/orders" className="text-primary text-sm hover:underline font-medium">View All</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {orders.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    {order.img && <img src={order.img} alt={order.title} className="w-10 h-8 rounded object-cover" />}
                    <span className="text-sm font-medium text-secondary line-clamp-1 max-w-xs">{order.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-secondary">${order.price}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
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
          </div>
        )}
      </div>
    </div>
  );
}
