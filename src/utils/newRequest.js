import axios from "axios";

const newRequest = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
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
