import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import newRequest from "../../utils/newRequest";

const categories = [
  "Graphics & Design",
  "Digital Marketing",
  "Writing & Translation",
  "Video & Animation",
  "Music & Audio",
  "Programming & Tech",
  "Business",
  "Lifestyle",
];

export default function Navbar() {
  const [active, setActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setActive(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await newRequest.post("/auth/logout");
    } catch (err) {}
    logout();
    navigate("/login");
    setOpen(false);
  };

  const isHome = location.pathname === "/";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      active || !isHome ? "bg-white shadow-md" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-primary">
          Freelance<span className="text-secondary">Hub</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {!currentUser && (
            <>
              <Link to="/gigs" className={`font-medium hover:text-primary transition-colors ${active || !isHome ? "text-secondary" : "text-white"}`}>
                Explore
              </Link>
              <Link to="/login" className={`font-medium hover:text-primary transition-colors ${active || !isHome ? "text-secondary" : "text-white"}`}>
                Sign In
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Join
              </Link>
            </>
          )}

          {currentUser && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img
                  src={currentUser.profilePic || `https://ui-avatars.com/api/?name=${currentUser.username}&background=1dbf73&color=fff`}
                  alt="avatar"
                  className="w-9 h-9 rounded-full object-cover border-2 border-primary"
                />
                <span className={`font-medium ${active || !isHome ? "text-secondary" : "text-white"}`}>
                  {currentUser.username}
                </span>
              </button>

              {open && (
                <div className="absolute right-0 top-12 w-52 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                  {currentUser.isSeller && (
                    <>
                      <Link to="/dashboard/seller" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                        Seller Dashboard
                      </Link>
                      <Link to="/add-gig" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                        Add New Gig
                      </Link>
                    </>
                  )}
                  {!currentUser.isSeller && (
                    <Link to="/dashboard/buyer" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                      My Dashboard
                    </Link>
                  )}
                  {currentUser.isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                      Admin Panel
                    </Link>
                  )}
                  <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                    Orders
                  </Link>
                  <Link to="/messages" className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                    Messages
                  </Link>
                  <Link to={`/profile/${currentUser._id}`} className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-primary transition-colors" onClick={() => setOpen(false)}>
                    Profile
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className={`w-6 h-6 ${active || !isHome ? "text-secondary" : "text-white"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Categories bar */}
      {(active || !isHome) && (
        <div className="hidden md:block border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-2 flex gap-6 overflow-x-auto">
            {categories.map((cat) => (
              <Link key={cat} to={`/gigs?category=${encodeURIComponent(cat)}`}
                className="text-sm text-secondary hover:text-primary whitespace-nowrap transition-colors font-medium pb-1 border-b-2 border-transparent hover:border-primary">
                {cat}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link to="/gigs" className="text-secondary hover:text-primary font-medium" onClick={() => setMenuOpen(false)}>Explore Gigs</Link>
            {!currentUser ? (
              <>
                <Link to="/login" className="text-secondary hover:text-primary font-medium" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn-primary text-center text-sm" onClick={() => setMenuOpen(false)}>Join Now</Link>
              </>
            ) : (
              <>
                <Link to="/orders" className="text-secondary hover:text-primary font-medium" onClick={() => setMenuOpen(false)}>Orders</Link>
                <Link to="/messages" className="text-secondary hover:text-primary font-medium" onClick={() => setMenuOpen(false)}>Messages</Link>
                {currentUser.isSeller && (
                  <Link to="/dashboard/seller" className="text-secondary hover:text-primary font-medium" onClick={() => setMenuOpen(false)}>Seller Dashboard</Link>
                )}
                <button onClick={handleLogout} className="text-left text-red-500 font-medium">Logout</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
