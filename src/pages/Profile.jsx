import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import newRequest from "../utils/newRequest";
import useAuthStore from "../store/authStore";
import GigCard from "../components/gigs/GigCard";

export default function Profile() {
  const { id } = useParams();
  const { currentUser, setCurrentUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();
  const isOwn = currentUser?._id === id;

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => newRequest.get(`/users/${id}`).then((res) => res.data),
  });

  const { data: gigs } = useQuery({
    queryKey: ["userGigs", id],
    queryFn: () => newRequest.get(`/gigs?userId=${id}`).then((res) => res.data),
    enabled: !!user?.isSeller,
  });

  const { register, handleSubmit } = useForm();

  const updateUser = useMutation({
    mutationFn: (data) => newRequest.put(`/users/${id}`, data),
    onSuccess: (res) => {
      setCurrentUser({ ...currentUser, ...res.data });
      queryClient.invalidateQueries(["user", id]);
      setEditing(false);
    },
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center pt-28">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <div className="min-h-screen flex items-center justify-center pt-28 text-gray-500">User not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative">
              <img
                src={user.profilePic || `https://ui-avatars.com/api/?name=${user.username}&background=1dbf73&color=fff&size=100`}
                alt={user.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
              />
              {user.isSeller && (
                <span className="absolute -bottom-1 -right-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">Seller</span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-secondary">{user.username}</h1>
                  {user.fullName && <p className="text-gray-500">{user.fullName}</p>}
                  {user.country && <p className="text-gray-400 text-sm mt-0.5">📍 {user.country}</p>}
                </div>
                {isOwn && (
                  <button onClick={() => setEditing(!editing)} className="btn-outline text-sm">
                    {editing ? "Cancel" : "Edit Profile"}
                  </button>
                )}
              </div>
              <p className="text-gray-600 mt-3 leading-relaxed">{user.desc || "No bio yet."}</p>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                {user.email && <span>📧 {user.email}</span>}
                {user.phone && <span>📞 {user.phone}</span>}
              </div>
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <form onSubmit={handleSubmit((data) => updateUser.mutate(data))} className="mt-6 pt-6 border-t border-gray-100 space-y-4">
              <h3 className="font-bold text-secondary">Edit Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Full Name</label>
                  <input {...register("fullName")} defaultValue={user.fullName} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Country</label>
                  <input {...register("country")} defaultValue={user.country} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Phone</label>
                  <input {...register("phone")} defaultValue={user.phone} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">Profile Picture URL</label>
                  <input {...register("profilePic")} defaultValue={user.profilePic} className="input-field" placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Bio</label>
                <textarea {...register("desc")} defaultValue={user.desc} rows={3} className="input-field resize-none" />
              </div>
              <button type="submit" className="btn-primary text-sm" disabled={updateUser.isPending}>
                {updateUser.isPending ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}
        </div>

        {/* Seller's Gigs */}
        {user.isSeller && gigs?.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-secondary mb-6">{user.username}'s Gigs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
