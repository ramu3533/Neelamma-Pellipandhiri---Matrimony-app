import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Calendar,
  Heart,
  UserCircle,
  MessageSquare,
  Zap,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import ProfileCardModal from "../components/ProfileCardModal";
import SubscriptionModal from "../components/SubscriptionModal";

// --- UNIFIED AND CORRECTED INTERFACES ---
interface FullProfile {
  profile_id: number;
  user_id: number;
  name: string;
  age: number;
  location: string;
  education: string;
  profession: string;
  image: string | null;
  images: { image_id: number; image_url: string }[];
  interests: string[];
  about_me: string;
}

interface ProfileCard {
  profile_id: number;
  user_id: number;
  name: string;
  age: number;
  location: string;
  education: string;
  profession: string;
  image: string | null;
  interests: string[];
}

interface Interest {
  interest_id: number;
  status: "pending" | "accepted" | "rejected";
  user_id: number;
}

const Profiles = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { socket } = useSocket();

  // --- State Management ---
  const [allProfiles, setAllProfiles] = useState<ProfileCard[]>([]); // Holds ALL profiles of OTHER users for filtering
  const [viewableProfiles, setViewableProfiles] = useState<ProfileCard[]>([]); // Holds profiles a user is allowed to see (limited for non-premium)
  const [sentInterests, setSentInterests] = useState<Interest[]>([]);
  const [sentLikes, setSentLikes] = useState<number[]>([]);
  const [viewingProfile, setViewingProfile] = useState<FullProfile | null>(
    null
  );
  const [showSubModal, setShowSubModal] = useState(false);

  // UI Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedEducation, setSelectedEducation] = useState("");

  // Effect to fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const [profilesRes, allProfilesRes, sentInterestsRes, sentLikesRes] =
          await Promise.all([
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/profiles`, config),
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/profiles/all`, config),
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/interests/sent`, config),
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/likes/sent`, config),
          ]);

        // DEFINITIVE FIX: Ensure the current user is filtered out from all lists immediately after fetch.
        const allOtherUsers = allProfilesRes.data.filter(
          (p: ProfileCard) => p.user_id !== user.user_id
        );
        setAllProfiles(allOtherUsers);

        const viewableOtherUsers = profilesRes.data.filter(
          (p: ProfileCard) => p.user_id !== user.user_id
        );
        setViewableProfiles(viewableOtherUsers);

        setSentInterests(sentInterestsRes.data);
        setSentLikes(sentLikesRes.data);
      } catch (error: any) {
        if (error.response?.status === 401) logout();
        else console.error("Failed to fetch page data:", error);
      }
    };
    fetchData();
  }, [user, logout]);

  // --- DEFINITIVE FIX: Use `useMemo` to create a derived state for filtered profiles ---
  // This ensures filtering logic re-runs only when needed and is always based on the latest state.
  // ADD THIS NEW BLOCK
  // This is the REPLACEMENT code
  const filteredProfiles = useMemo(() => {
    return viewableProfiles.filter((profile) => {
      // Search Term Filter (Name)
      if (
        searchTerm &&
        !profile.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Age Filter (Exact match)
      if (selectedAge && profile.age.toString() !== selectedAge) {
        return false;
      }

      // Location Filter (Partial match, case-insensitive)
      if (
        selectedLocation &&
        (!profile.location ||
          !profile.location
            .toLowerCase()
            .includes(selectedLocation.toLowerCase()))
      ) {
        return false;
      }

      // Education Filter (Partial match, case-insensitive)
      if (
        selectedEducation &&
        (!profile.education ||
          !profile.education
            .toLowerCase()
            .includes(selectedEducation.toLowerCase()))
      ) {
        return false;
      }

      // If the profile passed all checks, include it
      return true;
    });
  }, [
    searchTerm,
    selectedAge,
    selectedLocation,
    selectedEducation,
    viewableProfiles,
  ]);

  // --- Handler Functions ---
  const handleViewProfile = async (userId: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get<FullProfile>(
        `${import.meta.env.VITE_API_BASE_URL}/api/profiles/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setViewingProfile(res.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setShowSubModal(true);
      } else {
        alert("Could not load profile. Please try again later.");
      }
    }
  };

  const handleLikeProfile = async (likedUserId: number) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/likes/${likedUserId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSentLikes((prev) => [...prev, likedUserId]);
      if (socket && user) {
        socket.emit("send_like_notification", {
          receiverId: likedUserId,
          senderName: user.first_name,
        });
      }
    } catch (error) {
      console.error("Failed to like profile", error);
      alert("You may have already liked this profile.");
    }
  };

  const handleSendInterest = async (receiverId: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post<Interest>(
        `${import.meta.env.VITE_API_BASE_URL}/api/interests/send`,
        { receiverId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSentInterests((prev) => [...prev, res.data]);
      if (socket && user) {
        socket.emit("send_interest_notification", {
          receiverId,
          senderName: user.first_name,
        });
      }
      alert("Interest sent successfully. Wait for response!");
    } catch (error: any) {
      if (error.response?.status === 403) {
        setShowSubModal(true);
      } else {
        alert("Failed to send interest. You may have already sent one.");
      }
    }
  };

  const getInterestButton = (profile: ProfileCard) => {
    const interest = sentInterests.find((i) => i.user_id === profile.user_id);
    if (interest) {
      switch (interest.status) {
        case "pending":
          return (
            <button
              disabled
              className="flex-1 text-sm py-2 px-4 rounded-lg bg-white/20 text-white backdrop-blur-sm border border-white/30"
            >
              Interest Sent
            </button>
          );
        case "accepted":
          return (
            <button
              disabled
              className="flex-1 text-sm py-2 px-4 rounded-lg bg-green-500/50 text-white backdrop-blur-sm border border-green-400/50"
            >
              Accepted
            </button>
          );
        case "rejected":
          return (
            <button
              disabled
              className="flex-1 text-sm py-2 px-4 rounded-lg bg-red-500/50 text-white backdrop-blur-sm border border-red-400/50"
            >
              Rejected
            </button>
          );
        default:
          break;
      }
    }

    if (user && user.is_premium) {
      return (
        <button
          onClick={() => handleSendInterest(profile.user_id)}
          className="flex-1 border-2 border-white text-white py-2 px-4 rounded-lg font-medium backdrop-blur-sm hover:bg-white hover:text-rose-600 transition-all duration-300"
        >
          Send Interest
        </button>
      );
    } else {
      return (
        <button
          onClick={() => setShowSubModal(true)}
          className="flex-1 flex items-center justify-center gap-1.5 border-2 border-yellow-400 text-yellow-300 py-2 px-4 rounded-lg font-medium backdrop-blur-sm hover:bg-yellow-400 hover:text-black transition-all duration-300"
        >
          <Lock size={16} /> Send Interest
        </button>
      );
    }
  };

  // Logic to determine if the "Unlock More" card should be shown
  const showUnlockCard =
    user && !user.is_premium && allProfiles.length > viewableProfiles.length;

  return (
    <>
      <ProfileCardModal
        profile={viewingProfile}
        onClose={() => setViewingProfile(null)}
      />
      {showSubModal && (
        <SubscriptionModal onClose={() => setShowSubModal(false)} />
      )}
      <div className="py-8 bg-gradient-to-br from-rose-50 to-pink-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-3xl md:text-5xl font-extrabold text-pink-600 relative inline-block shine maddison">
              Browse Profiles
            </h1>

            <p className="text-xl text-gray-600">
              Find your perfect match from our verified profiles
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <input
                type="number"
                placeholder="Filter by Age"
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
              <input
                type="text"
                placeholder="Filter by Location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
              <input
                type="text"
                placeholder="Filter by Education"
                value={selectedEducation}
                onChange={(e) => setSelectedEducation(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {filteredProfiles.length} of {allProfiles.length}{" "}
              potential profiles
            </p>
            <button
              onClick={() =>
                navigate("/dashboard", { state: { defaultTab: "chats" } })
              }
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105"
            >
              <MessageSquare size={18} />
              View My Chats
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProfiles.map((profile) => {
              const hasLiked = sentLikes.includes(profile.user_id);
              return (
                <div
                  key={profile.profile_id}
                  className="relative aspect-[3/4] rounded-2xl shadow-lg overflow-hidden group transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105"
                >
                  {profile.image ? (
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}/${profile.image}`}
                      alt={profile.name}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <UserCircle className="h-32 w-32 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={() => handleLikeProfile(profile.user_id)}
                      disabled={hasLiked}
                      className={`bg-black/20 backdrop-blur-sm p-2 rounded-full transition-colors duration-300 ${
                        hasLiked
                          ? "text-rose-500 cursor-not-allowed"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      <Heart
                        className={`h-6 w-6 transition-transform group-hover:scale-110 ${
                          hasLiked ? "fill-current" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white flex flex-col justify-end h-full">
                    <div className="mt-auto">
                      <h3 className="text-2xl font-bold">{profile.name}</h3>
                      <div className="flex items-center text-sm opacity-90">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        <span>{profile.age} years old</span>
                      </div>
                      <div className="flex items-center text-sm opacity-90">
                        <MapPin className="h-4 w-4 mr-1.5" />
                        <span>{profile.location}</span>
                      </div>
                      <div className="flex space-x-3 pt-4 mt-2">
                        <button
                          onClick={() => handleViewProfile(profile.user_id)}
                          className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:from-rose-600 hover:to-pink-600 backdrop-blur-sm transition-all duration-300"
                        >
                          View Profile
                        </button>
                        {getInterestButton(profile)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {showUnlockCard && (
              <div
                onClick={() => setShowSubModal(true)}
                className="relative aspect-[3/4] rounded-2xl shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-rose-100 to-pink-100 cursor-pointer"
              >
                <div className="absolute inset-0 bg-white/50"></div>
                <div className="relative z-10">
                  <div className="mx-auto bg-gradient-to-br from-rose-500 to-pink-500 h-16 w-16 flex items-center justify-center rounded-full mb-4">
                    <Zap className="text-white h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Unlock More Profiles
                  </h3>
                  <p className="text-gray-600 mt-2">
                    You're seeing {viewableProfiles.length} of{" "}
                    {allProfiles.length} profiles. Subscribe to see the rest!
                  </p>
                  <button className="mt-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all">
                    Go Premium
                  </button>
                </div>
              </div>
            )}
          </div>
          {filteredProfiles.length === 0 && !showUnlockCard && (
            <div className="text-center py-12 col-span-full">
              <div className="space-y-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  No profiles found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profiles;
