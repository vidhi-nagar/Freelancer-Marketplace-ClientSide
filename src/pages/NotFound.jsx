import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-28">
      <div className="text-center">
        <div className="text-8xl font-black text-primary mb-4">404</div>
        <h1 className="text-3xl font-bold text-secondary mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8">Oops! The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    </div>
  );
}
