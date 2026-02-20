import axios from "axios";

const newRequest = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://freelancer-marketplace-server-side.vercel.app/api",
  withCredentials: true,
});

// Add token to every request
newRequest.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem("auth-storage");
  if (authStorage) {
    const { state } = JSON.parse(authStorage);
    if (state?.currentUser?.token) {
      config.headers.Authorization = `Bearer ${state.currentUser.token}`;
    }
  }
  return config;
});

export default newRequest;
