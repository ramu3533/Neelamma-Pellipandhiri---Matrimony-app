import React, { useState, useEffect } from "react";
import {
  X,
  UserCircle,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// --- UNIFIED AND CORRECTED INTERFACES ---
interface ProfileImage {
  image_id: number;
  image_url: string;
}

interface Profile {
  profile_id: number;
  user_id: number;
  name: string;
  age: number;
  location: string;
  education: string;
  profession: string;
  image: string | null; // The main profile picture
  images: ProfileImage[]; // The gallery of all images
  interests: string[];
  about_me: string;
}

interface ModalProps {
  profile: Profile | null;
  onClose: () => void;
}

const ProfileCardModal = ({ profile, onClose }: ModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [profile]);

  if (!profile) {
    return null;
  }

  const hasGalleryImages = profile.images && profile.images.length > 0;

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasGalleryImages) {
      setCurrentImageIndex((prev) => (prev + 1) % profile.images.length);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasGalleryImages) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + profile.images.length) % profile.images.length
      );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {/* --- CORRECTED 3-STEP IMAGE DISPLAY LOGIC --- */}
          {hasGalleryImages ? (
            // 1. If gallery exists, show the carousel
            <img
              src={`http://localhost:5000/${profile.images[currentImageIndex].image_url}`}
              alt={profile.name}
              className="w-full object-contain rounded-t-2xl"
            />
          ) : profile.image ? (
            // 2. Else, if main profile picture exists, show it as a static image
            <img
              src={`http://localhost:5000/${profile.image}`}
              alt={profile.name}
              className="w-full object-contain rounded-t-2xl"
            />
          ) : (
            // 3. Else, show the placeholder icon
            <div className="w-full h-80 bg-gray-200 flex items-center justify-center rounded-t-2xl">
              <UserCircle className="h-40 w-40 text-gray-400" />
            </div>
          )}

          {hasGalleryImages && profile.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 p-1 rounded-full hover:bg-white transition"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 p-1 rounded-full hover:bg-white transition"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/70 backdrop-blur-sm p-2 rounded-full hover:bg-white transition"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{profile.name}</h3>
            <div className="flex items-center text-gray-600 mt-1">
              <Calendar className="h-4 w-4 mr-1.5" />
              <span className="text-sm">{profile.age} years old</span>
            </div>
          </div>
          {profile.about_me && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                About Me
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {profile.about_me}
              </p>
            </div>
          )}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center text-gray-700">
              <MapPin className="h-4 w-4 mr-2 text-rose-500" />
              <span className="text-sm">{profile.location}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <GraduationCap className="h-4 w-4 mr-2 text-rose-500" />
              <span className="text-sm">{profile.education}</span>
            </div>
            <div className="flex items-center text-gray-700">
              <Briefcase className="h-4 w-4 mr-2 text-rose-500" />
              <span className="text-sm">{profile.profession}</span>
            </div>
          </div>
          {profile.interests?.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCardModal;
