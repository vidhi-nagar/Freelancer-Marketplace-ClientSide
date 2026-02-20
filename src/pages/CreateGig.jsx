import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import newRequest from "../utils/newRequest";

const CATEGORIES = [
  "Graphics & Design", "Digital Marketing", "Writing & Translation",
  "Video & Animation", "Music & Audio", "Programming & Tech", "Business", "Lifestyle",
];

export default function CreateGig() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cover, setCover] = useState("");
  const [images, setImages] = useState([]);
  const [features, setFeatures] = useState([""]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "freelancehub");
    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST", body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadToCloudinary(file);
      setCover(url);
    } catch (err) {
      setError("Cover image upload failed");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    try {
      const urls = await Promise.all(files.map(uploadToCloudinary));
      setImages([...images, ...urls]);
    } catch (err) {
      setError("Image upload failed");
    }
  };

  const addFeature = () => setFeatures([...features, ""]);
  const removeFeature = (i) => setFeatures(features.filter((_, idx) => idx !== i));
  const updateFeature = (i, val) => {
    const updated = [...features];
    updated[i] = val;
    setFeatures(updated);
  };

  const onSubmit = async (data) => {
    if (!cover) return setError("Please upload a cover image");
    setLoading(true);
    setError("");
    try {
      await newRequest.post("/gigs", {
        ...data,
        price: Number(data.price),
        deliveryTime: Number(data.deliveryTime),
        revisionNumber: Number(data.revisionNumber),
        cover,
        images,
        features: features.filter((f) => f.trim()),
      });
      navigate("/dashboard/seller");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create gig");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-secondary mb-2">Create a New Gig</h1>
        <p className="text-gray-500 mb-8">Fill in the details to list your service</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-secondary mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Gig Title *</label>
                <input {...register("title", { required: "Title is required" })}
                  placeholder="e.g. I will design a professional logo for your business"
                  className="input-field" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Category *</label>
                <select {...register("category", { required: "Category is required" })} className="input-field">
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Full Description *</label>
                <textarea {...register("desc", { required: "Description is required", minLength: { value: 50, message: "Min 50 characters" } })}
                  rows={5} placeholder="Describe your service in detail..." className="input-field resize-none" />
                {errors.desc && <p className="text-red-500 text-xs mt-1">{errors.desc.message}</p>}
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-secondary mb-4">Package Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Price (USD) *</label>
                <input {...register("price", { required: "Price required", min: { value: 5, message: "Min $5" } })}
                  type="number" min="5" placeholder="$5" className="input-field" />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Delivery (days) *</label>
                <input {...register("deliveryTime", { required: "Required", min: { value: 1, message: "Min 1 day" } })}
                  type="number" min="1" placeholder="3" className="input-field" />
                {errors.deliveryTime && <p className="text-red-500 text-xs mt-1">{errors.deliveryTime.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Revisions *</label>
                <input {...register("revisionNumber", { required: "Required", min: { value: 0, message: "Min 0" } })}
                  type="number" min="0" placeholder="2" className="input-field" />
                {errors.revisionNumber && <p className="text-red-500 text-xs mt-1">{errors.revisionNumber.message}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-secondary mb-1">Short Title *</label>
              <input {...register("shortTitle", { required: "Short title required" })}
                placeholder="e.g. Professional Logo Design" className="input-field" />
              {errors.shortTitle && <p className="text-red-500 text-xs mt-1">{errors.shortTitle.message}</p>}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-secondary mb-1">Short Description *</label>
              <input {...register("shortDesc", { required: "Short description required" })}
                placeholder="Brief one-line description of your service" className="input-field" />
              {errors.shortDesc && <p className="text-red-500 text-xs mt-1">{errors.shortDesc.message}</p>}
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-secondary mb-4">What's Included</h2>
            <div className="space-y-2">
              {features.map((feature, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={feature}
                    onChange={(e) => updateFeature(i, e.target.value)}
                    placeholder={`Feature ${i + 1} (e.g. Source files included)`}
                    className="input-field"
                  />
                  {features.length > 1 && (
                    <button type="button" onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-600 px-2">✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addFeature} className="text-primary text-sm font-medium hover:underline mt-1">
                + Add Feature
              </button>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-secondary mb-4">Media</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary mb-2">Cover Image * (main thumbnail)</label>
              <div className="flex items-center gap-4">
                {cover ? (
                  <img src={cover} alt="cover" className="w-32 h-24 object-cover rounded-lg border border-gray-200" />
                ) : (
                  <div className="w-32 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                    {uploadingCover ? "Uploading..." : "No image"}
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleCoverUpload}
                  className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Additional Images (optional)</label>
              <input type="file" accept="image/*" multiple onChange={handleImagesUpload}
                className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer" />
              {images.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {images.map((img, i) => (
                    <img key={i} src={img} alt={`img-${i}`} className="w-20 h-16 object-cover rounded-lg border border-gray-200" />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 text-base disabled:opacity-50">
              {loading ? "Creating Gig..." : "Create Gig"}
            </button>
            <button type="button" onClick={() => navigate("/dashboard/seller")} className="btn-outline px-8 py-3">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
