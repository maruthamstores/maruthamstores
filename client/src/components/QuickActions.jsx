import { ShoppingBag, Heart, LogOut, HelpCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Reusable QuickActionItem
const QuickActionItem = ({ icon, label,onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-4 text-center rounded-xl shadow-sm bg-white cursor-pointer transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-md relative"
    >
      <div className="flex flex-col items-center gap-2">
        <div className="text-blue-600">{icon}</div>
        <span className="text-sm font-medium text-gray-800">{label}</span>
      </div>
     
    </div>
  );
};

export const QuickActions = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    try {
      await axios.post(`${API_URL}/api/logout`, {}, { withCredentials: true });
      navigate("/login"); 
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Failed to logout. Try again.");
    }
  };

  return (
    <div className="w-full max-w-5xl mb-8">
      <div className="p-6 rounded-2xl shadow-md bg-white">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/myorders">
            <QuickActionItem icon={<ShoppingBag size={22} color="green" />} label="Orders" count="12" />
          </Link>
          <Link to="/wishlist">
            <QuickActionItem icon={<Heart size={22} color="green" />} label="Wishlist" count="8" />
          </Link>
          <QuickActionItem
            icon={<LogOut size={22} color="green" />}
            label="Logout"
            onClick={handleLogout} // call logout on click
          />
          {/* <Link to="/help">
            <QuickActionItem icon={<HelpCircle size={22} color="green" />} label="Help Center" />
          </Link> */}
        </div>
      </div>
    </div>
  );
};
