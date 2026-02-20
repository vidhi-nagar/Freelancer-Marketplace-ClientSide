import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import newRequest from "../utils/newRequest";

const CATEGORIES = [
  "Graphics & Design", "Digital Marketing", "Writing & Translation",
  "Video & Animation", "Music & Audio", "Programming & Tech", "Business", "Lifestyle",
];

export default function EditGig() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cover, setCover] = useState("");
  const [features, setFeatures] = useState([""]);

  const { data: gig, isLoading } = useQuery({
    queryKey: ["gig", id],
    queryFn: () => newRequest.get(`/gigs/single/${id}`).then((res) => res.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (gig) {
      reset(gig);
      setCover(gig.cover);
      setFeatures(gig.features?.length ? gig.features : [""]);
    }
  }, [gig]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      await newRequest.put(`/gigs/${id}`, {
        ...data,
        price: Number(data.price),
        deliveryTime: Number(data.deliveryTime),
        revisionNumber: Number(data.revisionNumber),
        cover,
        features: features.filter((f) => f.trim()),
      });
      navigate("/dashboard/seller");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update gig");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center pt-32">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-secondary mb-8">Edit Gig</h1>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-secondary mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Title *</label>
                <input {...register("title", { required: "Title is required" })} className="input-field" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Category *</label>
                <select {...register("category", { required: "Category is required" })} className="input-field">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Description *</label>
                <textarea {...register("desc", { required: "Required" })} rows={5} className="input-field resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-secondary mb-4">Package Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Price ($)</label>
                <input {...register("price", { required: true, min: 5 })} type="number" min="5" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Delivery (days)</label>
                <input {...register("deliveryTime", { required: true, min: 1 })} type="number" min="1" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Revisions</label>
                <input {...register("revisionNumber", { required: true, min: 0 })} type="number" min="0" className="input-field" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-secondary mb-1">Short Title</label>
              <input {...register("shortTitle")} className="input-field" />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-secondary mb-1">Short Description</label>
              <input {...register("shortDesc")} className="input-field" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-secondary mb-4">Features</h2>
            <div className="space-y-2">
              {features.map((feature, i) => (
                <div key={i} className="flex gap-2">
                  <input value={feature} onChange={(e) => {
                    const updated = [...features];
                    updated[i] = e.target.value;
                    setFeatures(updated);
                  }} className="input-field" placeholder={`Feature ${i + 1}`} />
                  {features.length > 1 && (
                    <button type="button" onClick={() => setFeatures(features.filter((_, idx) => idx !== i))} className="text-red-400 px-2">✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setFeatures([...features, ""])} className="text-primary text-sm font-medium hover:underline">
                + Add Feature
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 disabled:opacity-50">
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => navigate("/dashboard/seller")} className="btn-outline px-8 py-3">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
