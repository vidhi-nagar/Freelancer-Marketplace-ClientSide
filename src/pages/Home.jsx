import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../utils/newRequest";
import GigCard from "../components/gigs/GigCard";

const categories = [
  { name: "Graphics & Design", icon: "🎨", desc: "Logos, branding, illustration" },
  { name: "Digital Marketing", icon: "📱", desc: "SEO, social media, ads" },
  { name: "Writing & Translation", icon: "✍️", desc: "Articles, copywriting" },
  { name: "Video & Animation", icon: "🎬", desc: "Explainer videos, editing" },
  { name: "Music & Audio", icon: "🎵", desc: "Voice over, production" },
  { name: "Programming & Tech", icon: "💻", desc: "Web dev, mobile apps" },
  { name: "Business", icon: "💼", desc: "Virtual assistant, data entry" },
  { name: "Lifestyle", icon: "🌟", desc: "Wellness, gaming, astrology" },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: featuredGigs } = useQuery({
    queryKey: ["featuredGigs"],
    queryFn: () => newRequest.get("/gigs?sort=sales").then((res) => res.data.slice(0, 8)),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/gigs?search=${search}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-secondary to-gray-800 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Find the perfect{" "}
            <span className="text-primary italic">freelance</span>
            {" "}services for your business
          </h1>
          <p className="text-xl text-gray-300 mb-10">
            Work with talented people at the most affordable price to get the best work done.
          </p>

          <form onSubmit={handleSearch} className="flex max-w-2xl mx-auto bg-white rounded-lg overflow-hidden shadow-2xl">
            <div className="flex items-center px-4 flex-1">
              <svg className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder='Try "logo design" or "website development"'
                className="w-full py-4 focus:outline-none text-secondary placeholder-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 transition-colors">
              Search
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {["Logo Design", "WordPress", "Voice Over", "Video Editing", "SEO"].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/gigs?search=${tag}`)}
                className="text-sm border border-gray-500 text-gray-300 hover:border-primary hover:text-primary px-4 py-1.5 rounded-full transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-secondary text-center mb-3">
            Explore Popular Categories
          </h2>
          <p className="text-gray-500 text-center mb-12">Browse services tailored to your needs</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/gigs?category=${encodeURIComponent(cat.name)}`}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border border-gray-100 group"
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="font-semibold text-secondary group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Gigs */}
      {featuredGigs?.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-secondary">Popular Services</h2>
                <p className="text-gray-500 mt-1">Hand-picked gigs from top sellers</p>
              </div>
              <Link to="/gigs" className="btn-outline text-sm">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredGigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Start selling on FreelanceHub</h2>
          <p className="text-xl mb-8 opacity-90">Join millions of freelancers and start earning today</p>
          <Link to="/register" className="bg-white text-primary font-bold py-4 px-10 rounded-lg hover:bg-gray-100 transition-colors text-lg inline-block">
            Become a Seller
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { label: "Happy Customers", value: "4M+" },
              { label: "Freelancers", value: "830K+" },
              { label: "Gig Categories", value: "700+" },
              { label: "Projects Completed", value: "12M+" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-gray-300 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
