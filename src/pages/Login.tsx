// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios, { AxiosError } from 'axios';
// import { Mail, Lock, LogIn } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';

// interface ErrorResponse {
//   message: string;
// }

// const Login = () => {
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const navigate = useNavigate();
//   const { login } = useAuth(); // Get the powerful login function from our context

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setIsLoading(true);

//     try {
//       const res = await axios.post('http://localhost:5000/api/auth/login', formData);

//       // --- THIS IS THE KEY ---
//       // We 'await' the login function. This pauses execution here until the
//       // AuthContext has finished fetching the user and updating the global state.
//       await login(res.data.token);

//       // Only after the user state is updated do we navigate to the homepage.
//       navigate('/');

//     } catch (err) {
//       if (axios.isAxiosError(err)) {
//         const serverError = err as AxiosError<ErrorResponse>;
//         if (serverError && serverError.response) {
//           setError(serverError.response.data.message);
//         } else {
//           setError('An unexpected error occurred. Please try again.');
//         }
//       } else {
//         setError('Login failed. Please check your connection and try again.');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="py-20 bg-gradient-to-br from-rose-50 to-pink-50 min-h-screen flex items-center justify-center bg-[url('src/wedding.jpg')] bg-cover bg-center filter z-0">
//       <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           <div className="text-center space-y-4 mb-8">
//             <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
//             <p className="text-gray-600">Please login to continue.</p>
//           </div>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent" placeholder="Enter your email" />
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent" placeholder="Enter your password" />
//               </div>
//             </div>

//             {error && (<div className="text-red-500 text-sm text-center">{error}</div>)}

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed"
//             >
//               <LogIn className="h-5 w-5 mr-2" />
//               {isLoading ? 'Logging in...' : 'Login'}
//             </button>
//             <div className="text-center">
//               <Link to="/register" className="text-rose-600 hover:underline">Don't have an account? Register here.</Link>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { Mail, Lock, LogIn } from "lucide-react";

interface ErrorResponse {
  message: string;
}

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Step 1: Send credentials to the backend.
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );

      // Step 2: On success, navigate to the OTP verification page.
      alert(res.data.message); // "OTP has been sent..."
      navigate("/verify-otp", {
        state: { email: res.data.email, purpose: "login" },
      });
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      if (axiosError.response) {
        setError(axiosError.response.data.message);
      } else {
        setError("Login failed. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="py-20 min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('src/wedding.jpg')",
      }}
    >
      <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center space-y-4 mb-8">
            <h1
              className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-pink-400 to-pink-500 bg-clip-text text-transparent"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              Welcome Back!
            </h1>
            <p className="text-gray-600">Please login to continue.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <LogIn className="h-5 w-5 mr-2" />
              {isLoading ? "Proceeding..." : "Login"}
            </button>
            <div className="text-center">
              <Link to="/register" className="text-rose-600 hover:underline">
                Don't have an account? Register here.
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
