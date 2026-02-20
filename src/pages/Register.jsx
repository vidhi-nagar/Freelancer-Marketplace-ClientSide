import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import newRequest from "../utils/newRequest";

export default function Register() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState("");
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const isSeller = watch("isSeller");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "freelancehub");
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST", body: formData,
      });
      const data = await res.json();
      setProfilePic(data.secure_url);
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      await newRequest.post("/auth/register", { ...data, profilePic });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-primary">
            Freelance<span className="text-secondary">Hub</span>
          </Link>
          <h1 className="text-2xl font-bold text-secondary mt-4">Create your account</h1>
          <p className="text-gray-500 mt-1">Join millions of freelancers and clients</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Username *</label>
              <input {...register("username", { required: "Username is required", minLength: { value: 3, message: "Min 3 characters" } })}
                type="text" placeholder="Choose a username" className="input-field" />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Email *</label>
              <input {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })}
                type="email" placeholder="Enter your email" className="input-field" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Password *</label>
              <input {...register("password", { required: "Password required", minLength: { value: 6, message: "Min 6 characters" } })}
                type="password" placeholder="Create a password" className="input-field" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Full Name</label>
              <input {...register("fullName")} type="text" placeholder="Your full name" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Country</label>
              <input {...register("country")} type="text" placeholder="e.g. India" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Phone</label>
              <input {...register("phone")} type="text" placeholder="Your phone number" className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Bio / Description</label>
            <textarea {...register("desc")} rows={3} placeholder="Tell us about yourself..." className="input-field resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Profile Picture</label>
            <div className="flex items-center gap-4">
              {profilePic ? (
                <img src={profilePic} alt="preview" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xl">
                  👤
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer" />
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input {...register("isSeller")} type="checkbox" className="mt-0.5 w-4 h-4 accent-primary" />
              <div>
                <span className="font-semibold text-secondary">Register as a Seller (Freelancer)</span>
                <p className="text-xs text-gray-500 mt-0.5">Enable this to create and sell your services as gigs</p>
              </div>
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed text-base">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
