import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Gigs from "./pages/Gigs";
import GigDetail from "./pages/GigDetail";
import CreateGig from "./pages/CreateGig";
import EditGig from "./pages/EditGig";
import Orders from "./pages/Orders";
import Messages from "./pages/Messages";
import Message from "./pages/Message";
import Payment from "./pages/Payment";
import Success from "./pages/Success";
import Profile from "./pages/Profile";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import useAuthStore from "./store/authStore";

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuthStore();
  return currentUser ? children : <Navigate to="/login" />;
};

const SellerRoute = ({ children }) => {
  const { currentUser } = useAuthStore();
  return currentUser?.isSeller ? children : <Navigate to="/" />;
};

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuthStore();
  return currentUser?.isAdmin ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/gigs" element={<Gigs />} />
        <Route path="/gig/:id" element={<GigDetail />} />
        <Route path="/profile/:id" element={<Profile />} />

        {/* Private routes */}
        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/messages/:id" element={<PrivateRoute><Message /></PrivateRoute>} />
        <Route path="/pay/:id" element={<PrivateRoute><Payment /></PrivateRoute>} />
        <Route path="/success" element={<PrivateRoute><Success /></PrivateRoute>} />
        <Route path="/dashboard/buyer" element={<PrivateRoute><BuyerDashboard /></PrivateRoute>} />

        {/* Seller routes */}
        <Route path="/add-gig" element={<SellerRoute><CreateGig /></SellerRoute>} />
        <Route path="/edit-gig/:id" element={<SellerRoute><EditGig /></SellerRoute>} />
        <Route path="/dashboard/seller" element={<SellerRoute><SellerDashboard /></SellerRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
