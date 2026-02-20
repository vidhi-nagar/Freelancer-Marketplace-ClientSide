import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

const StarRating = ({ rating, count }) => (
  <div className="flex items-center gap-1">
    <span className="text-yellow-400">★</span>
    <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
    <span className="text-gray-400 text-sm">({count})</span>
  </div>
);

export default function GigCard({ gig }) {
  const { data: seller } = useQuery({
    queryKey: ["seller", gig.userId],
    queryFn: () => newRequest.get(`/users/${gig.userId}`).then((res) => res.data),
    staleTime: 10 * 60 * 1000,
  });

  const rating = gig.starNumber > 0 ? gig.totalStars / gig.starNumber : 0;

  return (
    <Link to={`/gig/${gig._id}`} className="block group">
      <div className="card group-hover:shadow-xl transition-all duration-200">
        <div className="relative overflow-hidden">
          <img
            src={gig.cover}
            alt={gig.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = "https://via.placeholder.com/400x200?text=No+Image"; }}
          />
          <div className="absolute top-2 left-2">
            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full font-medium">
              {gig.category}
            </span>
          </div>
        </div>

        <div className="p-4">
          {seller && (
            <div className="flex items-center gap-2 mb-3">
              <img
                src={seller.profilePic || `https://ui-avatars.com/api/?name=${seller.username}&background=1dbf73&color=fff&size=32`}
                alt={seller.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-secondary hover:text-primary">{seller.username}</span>
            </div>
          )}

          <h3 className="text-sm font-medium text-secondary line-clamp-2 mb-3 group-hover:text-primary transition-colors">
            {gig.title}
          </h3>

          {gig.starNumber > 0 && (
            <StarRating rating={rating} count={gig.starNumber} />
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <span className="text-gray-400 text-xs">Starting at</span>
            <span className="text-secondary font-bold text-lg">
              ${gig.price}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
