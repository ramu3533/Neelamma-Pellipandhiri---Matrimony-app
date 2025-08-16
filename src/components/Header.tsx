import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Menu, X, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Logo from "./neelamma-pellipandhiri-logo.svg";


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  // Effect to fetch the count of pending interest requests for the notification badge
  useEffect(() => {
    const fetchPendingInterests = async () => {
      if (user) {
        try {
          const token = localStorage.getItem("token");
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const res = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/interests/received`,
            config
          );
          const pending = res.data.filter(
            (interest: any) => interest.status === "pending"
          );
          setPendingCount(pending.length);
        } catch (error) {
          console.error("Failed to fetch pending interests count", error);
        }
      } else {
        setPendingCount(0); // Reset count on logout
      }
    };
    fetchPendingInterests();
  }, [user, location]); // Re-fetch on user change or navigation to update the count

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/profiles", label: "Profiles" },
    { path: "/success-stories", label: "Success Stories" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-2 rounded-full group-hover:scale-110 transition-transform duration-300">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Neelamma Pellipandhiri
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-colors duration-200 hover:text-rose-600 ${
                  isActive(item.path) ? "text-rose-600" : "text-gray-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Section for Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              // --- UPDATED LOGGED-IN VIEW ---
              <>
                <div
                  className={
                    user.is_premium
                      ? "p-0.5 rounded-lg bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500"
                      : ""
                  }
                >
                  <div
                    className={
                      user.is_premium ? "bg-white rounded-md px-3 py-1" : ""
                    }
                  >
                    <span
                      className={`font-medium ${
                        user.is_premium
                          ? "premium-text-gradient"
                          : "text-gray-700"
                      }`}
                    >
                      Hi, {user.first_name}!
                    </span>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-rose-600 font-medium transition-colors duration-200"
                >
                  My Profile
                </Link>
                <button
                  onClick={logout}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-full hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  Logout
                </button>
                <Link
                  to="/dashboard"
                  state={{ defaultTab: "received" }} // Go to received tab when bell is clicked
                  className="relative p-2 text-gray-600 hover:text-rose-600"
                >
                  <Bell size={24} />
                  {pendingCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-rose-500 text-white text-xs text-center">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              // Logged-out view
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-rose-600 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-2 rounded-full hover:from-rose-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  Register Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`font-medium py-2 px-4 rounded-lg transition-colors duration-200 ${
                    isActive(item.path)
                      ? "text-rose-600 bg-rose-50"
                      : "text-gray-700 hover:text-rose-600 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium py-2 px-4 rounded-lg text-center"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium py-2 px-4 rounded-lg text-center"
                    >
                      Register Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
