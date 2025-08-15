import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { User, Mail, Phone, MapPin, Calendar, GraduationCap, Briefcase, Heart, Lock } from 'lucide-react';

interface ErrorResponse {
  message: string;
}

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '',
    dateOfBirth: '', gender: '', location: '', education: '',
    profession: '', height: '', maritalStatus: '',
    religion: 'Goud', motherTongue: 'Telugu', aboutMe: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // Step 1: Send registration data to the backend.
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, formData);
      
      // Step 2: On success, navigate to the OTP verification page.
      // Pass the email and the purpose to the next page.
      alert(res.data.message); // "OTP has been sent..."
      navigate('/verify-otp', { 
        state: { email: res.data.email, purpose: 'register' } 
      });

    } catch (err: any) {
      const axiosError = err as AxiosError<ErrorResponse>;
      if (axiosError.response) {
        setError(axiosError.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 bg-gradient-to-br from-rose-50 to-pink-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Create Your Profile</h1>
          <p className="text-xl text-gray-600">Join thousands of happy couples. Start your journey today!</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center"><User className="h-5 w-5 mr-2 text-rose-500" />Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label><input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500" placeholder="Enter your first name" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label><input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500" placeholder="Enter your last name" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500" placeholder="Enter your email" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Password *</label><input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500" placeholder="Choose a strong password" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500" placeholder="+91 98765 43210" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label><select name="gender" value={formData.gender} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"><option value="">Select Gender</option><option value="male">Male</option><option value="female">Female</option></select></div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center"><MapPin className="h-5 w-5 mr-2 text-rose-500" />Location & Background</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Location *</label><input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500" placeholder="City, State" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Height</label><select name="height" value={formData.height} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"><option value="">Select Height</option><option value="4'6'' - 4'11''">4'6'' - 4'11''</option><option value="5'0'' - 5'4''">5'0'' - 5'4''</option><option value="5'5'' - 5'8''">5'5'' - 5'8''</option><option value="5'9'' - 6'0''">5'9'' - 6'0''</option><option value="6'1'' and above">6'1'' and above</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Marital Status *</label><select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"><option value="">Select Status</option><option value="never-married">Never Married</option><option value="divorced">Divorced</option><option value="widowed">Widowed</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Mother Tongue</label><input type="text" name="motherTongue" value={formData.motherTongue} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500" placeholder="e.g., Telugu" /></div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center"><GraduationCap className="h-5 w-5 mr-2 text-rose-500" />Education & Career</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Highest Education *</label><input type="text" name="education" value={formData.education} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500" placeholder="e.g., B.Tech" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Profession *</label><input type="text" name="profession" value={formData.profession} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500" placeholder="e.g., Software Engineer" /></div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">About Me</label>
              <textarea name="aboutMe" value={formData.aboutMe} onChange={handleChange} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500" placeholder="Tell us about yourself, your interests, and what you're looking for..."></textarea>
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <div className="text-center">
              <button type="submit" disabled={isLoading} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold hover:from-rose-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-70">
                {isLoading ? 'Sending OTP...' : 'Register & Verify Email'}
              </button>
            </div>
            <p className="text-center text-sm">Already have an account? <Link to="/login" className="text-rose-600 hover:underline">Login here</Link>.</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
