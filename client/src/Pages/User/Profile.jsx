import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Toastify from "toastify-js";
import { ProfileHeader } from "../../components/ProfileHeader";
import { QuickActions } from "../../components/QuickActions";
import { ProductSlider } from "../../components/ProductSlider";
import { AccountActions } from "../../components/AccountActions";
import "toastify-js/src/toastify.css";

const API_URL = import.meta.env.VITE_API_URL;

const Index = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const showLoginPromptToast = useCallback(() => {
    const toastNode = document.createElement("div");
    toastNode.className = "flex flex-col gap-2 text-sm";

    const message = document.createElement("span");
    message.textContent = "You're not logged in. Can't view profile. Login now?";

    const actions = document.createElement("div");
    actions.className = "flex justify-center gap-2";

    const yesButton = document.createElement("button");
    yesButton.textContent = "Yes";
    yesButton.className = "rounded bg-white px-3 py-1 font-semibold text-green-700";

    const noButton = document.createElement("button");
    noButton.textContent = "No";
    noButton.className = "rounded border border-white px-3 py-1 font-semibold text-white";

    actions.appendChild(yesButton);
    actions.appendChild(noButton);
    toastNode.appendChild(message);
    toastNode.appendChild(actions);

    const toast = Toastify({
      node: toastNode,
      duration: -1,
      gravity: "top",
      position: "center",
      backgroundColor: "#16a34a",
      close: false,
    });

    yesButton.onclick = () => {
      toast.hideToast();
      navigate("/login");
    };

    noButton.onclick = () => {
      toast.hideToast();
      navigate("/");
    };

    toast.showToast();
  }, [navigate]);
  const confirmedRef = useRef(false); // ✅ track if confirmation already shown

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/user`, {
          withCredentials: true,
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setProfile(null);

        if (!confirmedRef.current) {
          confirmedRef.current = true; // ✅ mark as confirmed
          showLoginPromptToast();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, showLoginPromptToast]);

  if (loading) return <div className="text-center py-10">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center space-y-8">
          <ProfileHeader name={profile?.name} email={profile?.email} />
          <QuickActions profile={profile} />
          <ProductSlider />
          <AccountActions />
        </div>
      </div>
    </div>
  );
};

export default Index;
