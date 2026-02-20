import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!stripe || !elements) return;

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setLoading(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + "/success" },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message);
      setLoading(false);
    } else if (paymentIntent?.status === "succeeded") {
      try {
        await newRequest.put("/orders/confirm", { payment_intent: paymentIntent.id });
        navigate("/success");
      } catch (err) {
        setError("Payment confirmed but order update failed. Please contact support.");
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
      <button type="submit" disabled={!stripe || loading} className="btn-primary w-full py-3 text-base disabled:opacity-50">
        {loading ? "Processing Payment..." : "Pay Now"}
      </button>
    </form>
  );
}

export default function Payment() {
  const { id } = useParams();
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { data: gig } = useQuery({
    queryKey: ["gig", id],
    queryFn: () => newRequest.get(`/gigs/single/${id}`).then((res) => res.data),
  });

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const res = await newRequest.post(`/orders/create-payment-intent/${id}`);
        setClientSecret(res.data.clientSecret);
        setOrderId(res.data.orderId);
      } catch (err) {
        setError("Failed to initialize payment. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    createPaymentIntent();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-28">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Initializing payment...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center pt-28 px-4">
      <div className="text-center text-red-500">
        <p className="text-lg font-medium mb-2">Payment Error</p>
        <p className="text-sm">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-2xl font-bold text-secondary mb-8 text-center">Complete Payment</h1>

        {gig && (
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <img src={gig.cover} alt={gig.title} className="w-16 h-16 rounded-lg object-cover" />
            <div>
              <h3 className="font-semibold text-secondary text-sm line-clamp-2">{gig.title}</h3>
              <p className="text-primary font-bold text-lg">${gig.price}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-bold text-secondary mb-4">Payment Details</h2>
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
              <CheckoutForm orderId={orderId} />
            </Elements>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-xs">
          <span>🔒</span>
          <span>Secured by Stripe. Your payment info is safe.</span>
        </div>
      </div>
    </div>
  );
}
