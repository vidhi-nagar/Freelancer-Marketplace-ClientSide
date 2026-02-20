import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";
import useAuthStore from "../store/authStore";

const StarRating = ({ totalStars, starNumber }) => {
  const rating = starNumber > 0 ? totalStars / starNumber : 0;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= Math.round(rating) ? "text-yellow-400" : "text-gray-200"}>★</span>
      ))}
      <span className="ml-1 font-semibold">{rating.toFixed(1)}</span>
      <span className="text-gray-400">({starNumber} reviews)</span>
    </div>
  );
};

export default function GigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const [activeImg, setActiveImg] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ star: 5, desc: "" });

  const { data: gig, isLoading: gigLoading } = useQuery({
    queryKey: ["gig", id],
    queryFn: () => newRequest.get(`/gigs/single/${id}`).then((res) => res.data),
  });

  const { data: seller } = useQuery({
    queryKey: ["seller", gig?.userId],
    queryFn: () => newRequest.get(`/users/${gig.userId}`).then((res) => res.data),
    enabled: !!gig?.userId,
  });

  const { data: reviews, refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => newRequest.get(`/reviews/${id}`).then((res) => res.data),
  });

  const handleOrder = async () => {
    if (!currentUser) return navigate("/login");
    navigate(`/pay/${id}`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      await newRequest.post("/reviews", { gigId: id, ...reviewForm });
      refetchReviews();
      setReviewForm({ star: 5, desc: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleContact = async () => {
    if (!currentUser) return navigate("/login");
    try {
      const convId = currentUser.isSeller ? currentUser._id + seller._id : seller._id + currentUser._id;
      try {
        await newRequest.get(`/conversations/single/${convId}`);
      } catch {
        await newRequest.post("/conversations", { to: seller._id });
      }
      navigate(`/messages/${convId}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (gigLoading) return (
    <div className="min-h-screen pt-32 max-w-7xl mx-auto px-4">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );

  if (!gig) return <div className="min-h-screen flex items-center justify-center">Gig not found</div>;

  const images = [gig.cover, ...(gig.images || [])];

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary">Home</Link> /
          <Link to="/gigs" className="hover:text-primary mx-1">Gigs</Link> /
          <span className="mx-1 text-secondary">{gig.category}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-secondary mb-4">{gig.title}</h1>

              {seller && (
                <div className="flex items-center gap-3">
                  <img
                    src={seller.profilePic || `https://ui-avatars.com/api/?name=${seller.username}&background=1dbf73&color=fff`}
                    alt={seller.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <Link to={`/profile/${seller._id}`} className="font-semibold text-secondary hover:text-primary">{seller.username}</Link>
                    <div className="flex items-center gap-1 mt-0.5">
                      <StarRating totalStars={gig.totalStars} starNumber={gig.starNumber} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden aspect-video bg-gray-200">
                <img src={images[activeImg]} alt={gig.title} className="w-full h-full object-cover" />
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImg === i ? "border-primary" : "border-gray-200"}`}>
                      <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* About */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-secondary mb-4">About This Gig</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{gig.desc}</p>
            </div>

            {/* Features */}
            {gig.features?.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-secondary mb-4">What's Included</h2>
                <ul className="space-y-2">
                  {gig.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <span className="text-primary font-bold">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* About the Seller */}
            {seller && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-secondary mb-4">About the Seller</h2>
                <div className="flex items-start gap-4">
                  <img
                    src={seller.profilePic || `https://ui-avatars.com/api/?name=${seller.username}&background=1dbf73&color=fff&size=80`}
                    alt={seller.username}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-secondary text-lg">{seller.username}</h3>
                    {seller.fullName && <p className="text-gray-500">{seller.fullName}</p>}
                    {seller.country && <p className="text-gray-400 text-sm">📍 {seller.country}</p>}
                    <p className="text-gray-600 mt-2">{seller.desc || "No bio provided."}</p>
                    <button onClick={handleContact} className="btn-outline text-sm mt-3">
                      Contact Seller
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-secondary mb-2">
                Reviews <span className="text-gray-400 font-normal">({reviews?.length || 0})</span>
              </h2>
              {gig.starNumber > 0 && (
                <div className="mb-4">
                  <StarRating totalStars={gig.totalStars} starNumber={gig.starNumber} />
                </div>
              )}

              {/* Review List */}
              <div className="space-y-4 mb-6">
                {reviews?.map((review) => (
                  <div key={review._id} className="flex gap-3 border-b border-gray-50 pb-4">
                    <img
                      src={review.userId?.profilePic || `https://ui-avatars.com/api/?name=${review.userId?.username}&background=1dbf73&color=fff&size=40`}
                      alt="reviewer"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-secondary">{review.userId?.username}</p>
                      <div className="flex gap-0.5 my-1">
                        {[1,2,3,4,5].map((s) => (
                          <span key={s} className={s <= review.star ? "text-yellow-400 text-sm" : "text-gray-200 text-sm"}>★</span>
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm">{review.desc}</p>
                    </div>
                  </div>
                ))}
                {(!reviews || reviews.length === 0) && (
                  <p className="text-gray-400 text-center py-4">No reviews yet. Be the first!</p>
                )}
              </div>

              {/* Leave Review */}
              {currentUser && !currentUser.isSeller && (
                <form onSubmit={handleReviewSubmit} className="border-t pt-4">
                  <h3 className="font-semibold text-secondary mb-3">Leave a Review</h3>
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5].map((s) => (
                      <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, star: s })}
                        className={`text-2xl transition-colors ${s <= reviewForm.star ? "text-yellow-400" : "text-gray-200"}`}>★</button>
                    ))}
                  </div>
                  <textarea
                    value={reviewForm.desc}
                    onChange={(e) => setReviewForm({ ...reviewForm, desc: e.target.value })}
                    placeholder="Share your experience..."
                    rows={3}
                    required
                    className="input-field resize-none mb-3"
                  />
                  <button type="submit" disabled={reviewLoading} className="btn-primary text-sm disabled:opacity-50">
                    {reviewLoading ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column - Order Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-secondary">{gig.shortTitle}</h3>
                <span className="text-2xl font-bold text-secondary">${gig.price}</span>
              </div>

              <p className="text-gray-600 text-sm mb-6">{gig.shortDesc}</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>🕐</span>
                  <span>{gig.deliveryTime} days delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>🔄</span>
                  <span>{gig.revisionNumber} revision{gig.revisionNumber !== 1 ? "s" : ""}</span>
                </div>
                {gig.features?.slice(0, 3).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-primary">✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleOrder}
                className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
              >
                Continue <span>→</span>
              </button>

              <button onClick={handleContact} className="w-full text-center mt-3 text-primary hover:underline text-sm font-medium">
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
