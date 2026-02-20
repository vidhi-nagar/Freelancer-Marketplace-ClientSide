import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import newRequest from "../utils/newRequest";
import useAuthStore from "../store/authStore";

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      const res = await newRequest.post("/auth/login", data);
      setCurrentUser(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-28">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-primary">
            Freelance<span className="text-secondary">Hub</span>
          </Link>
          <h1 className="text-2xl font-bold text-secondary mt-4">Welcome back!</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Username</label>
            <input
              {...register("username", { required: "Username is required" })}
              type="text"
              placeholder="Enter your username"
              className="input-field"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Password</label>
            <input
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
              type="password"
              placeholder="Enter your password"
              className="input-field"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Join FreelanceHub
          </Link>
        </p>
      </div>
    </div>
  );
}
