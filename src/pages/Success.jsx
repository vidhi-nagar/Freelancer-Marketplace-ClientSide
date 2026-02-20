import { Link } from "react-router-dom";

export default function Success() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-28">
      <div className="text-center bg-white rounded-2xl shadow-lg p-12 max-w-md mx-4">
        <div className="text-7xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-secondary mb-3">Payment Successful!</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Your order has been placed successfully. The seller has been notified and will start working on your project soon.
        </p>
        <div className="space-y-3">
          <Link to="/orders" className="btn-primary block py-3 text-center">
            View My Orders
          </Link>
          <Link to="/" className="btn-outline block py-3 text-center">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
