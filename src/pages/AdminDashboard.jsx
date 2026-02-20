import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => newRequest.get("/users").then((res) => res.data),
  });

  const { data: gigs } = useQuery({
    queryKey: ["allGigs"],
    queryFn: () => newRequest.get("/gigs").then((res) => res.data),
  });

  const deleteUser = useMutation({
    mutationFn: (id) => newRequest.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["allUsers"]),
  });

  const deleteGig = useMutation({
    mutationFn: (id) => newRequest.delete(`/gigs/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["allGigs"]),
  });

  const sellers = users?.filter((u) => u.isSeller).length || 0;
  const buyers = users?.filter((u) => !u.isSeller && !u.isAdmin).length || 0;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary">Admin Panel</h1>
          <p className="text-gray-500 mt-1">Manage users and gigs</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Users", value: users?.length || 0, icon: "👥", color: "bg-blue-50" },
            { label: "Sellers", value: sellers, icon: "🛍️", color: "bg-green-50" },
            { label: "Buyers", value: buyers, icon: "🛒", color: "bg-yellow-50" },
            { label: "Total Gigs", value: gigs?.length || 0, icon: "📋", color: "bg-purple-50" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl p-5 ${stat.color} border border-gray-100`}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <p className="text-2xl font-bold text-secondary">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-xl font-bold text-secondary">All Users ({users?.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-secondary">User</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-secondary">Email</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-secondary">Role</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-secondary">Joined</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users?.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <img src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}&size=32&background=1dbf73&color=fff`}
                          alt={user.username} className="w-8 h-8 rounded-full" />
                        <span className="text-sm font-medium text-secondary">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        user.isAdmin ? "bg-red-100 text-red-700" :
                        user.isSeller ? "bg-green-100 text-green-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {user.isAdmin ? "Admin" : user.isSeller ? "Seller" : "Buyer"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                      {!user.isAdmin && (
                        <button onClick={() => { if (window.confirm("Delete user?")) deleteUser.mutate(user._id); }}
                          className="text-sm text-red-500 hover:underline font-medium">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gigs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-xl font-bold text-secondary">All Gigs ({gigs?.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-secondary">Gig</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-secondary">Category</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-secondary">Price</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-secondary">Sales</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {gigs?.map((gig) => (
                  <tr key={gig._id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <img src={gig.cover} alt={gig.title} className="w-12 h-8 rounded object-cover" />
                        <span className="text-sm font-medium text-secondary line-clamp-1 max-w-xs">{gig.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">{gig.category}</td>
                    <td className="px-6 py-3 text-sm font-bold text-secondary">${gig.price}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{gig.sales}</td>
                    <td className="px-6 py-3">
                      <button onClick={() => { if (window.confirm("Delete gig?")) deleteGig.mutate(gig._id); }}
                        className="text-sm text-red-500 hover:underline font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
