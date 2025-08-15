import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { ShieldCheck, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ErrorResponse {
  message: string;
}

const OtpVerification = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth(); // Renamed to avoid conflict

  // Get email and purpose ('register' or 'login') from navigation state
  const { email, purpose } = location.state || {};

  if (!email || !purpose) {
    // Redirect if the page is accessed directly without state
    navigate('/login');
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const url = purpose === 'register' ? '/api/auth/verify-registration' : '/api/auth/verify-login';
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}${url}`, { email, otp });
      
      if (purpose === 'register') {
        alert(res.data.message);
        navigate('/login');
      } else { // purpose === 'login'
        // On successful login OTP verification, the backend returns a token.
        // Use the AuthContext to set the user state.
        await authLogin(res.data.token);
        navigate('/');
      }

    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      if (axiosError.response) {
        setError(axiosError.response.data.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-20 bg-gradient-to-br from-rose-50 to-pink-50 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center space-y-4 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full mb-4">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Verify Your Identity</h1>
            <p className="text-gray-600">
              An OTP has been sent to your email address: <strong>{email}</strong>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter 6-Digit OTP</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  name="otp" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  required 
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent tracking-[1em] text-center" 
                  placeholder="● ● ● ● ● ●"
                />
              </div>
            </div>

            {error && (<div className="text-red-500 text-sm text-center">{error}</div>)}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify & Proceed'}
            </button>
            <div className="text-center">
              <Link to={purpose === 'register' ? '/register' : '/login'} className="text-rose-600 hover:underline">
                Go Back
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
