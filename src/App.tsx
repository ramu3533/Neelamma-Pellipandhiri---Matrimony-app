// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Header from './components/Header';
// import Footer from './components/Footer';
// import Home from './pages/Home';
// import Profiles from './pages/Profiles';
// import Register from './pages/Register';
// import Login from './pages/Login';
// import About from './pages/About';
// import Contact from './pages/Contact';
// import SuccessStories from './pages/SuccessStories';
// import Dashboard from './pages/Dashboard';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import { SocketProvider } from './context/SocketContext'; // Import SocketProvider
// import OtpVerification from './pages/OtpVerification';

// const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
//   const { user, loading } = useAuth();
//   if (loading) return null;
//   return user ? children : <Navigate to="/login" />;
// };

// function App() {
//   return (
//     <AuthProvider>
//       <SocketProvider> {/* Wrap with SocketProvider */}
//         <Router>
//           <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
//             <Header />
//             <main>
//               <Routes>
//                 <Route path="/" element={<Home />} />
//                 <Route path="/profiles" element={<ProtectedRoute><Profiles /></ProtectedRoute>} />
//                 <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
//                 <Route path="/register" element={<Register />} />
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/about" element={<About />} />
//                 <Route path="/contact" element={<Contact />} />
//                 <Route path="/success-stories" element={<SuccessStories />} />
//                 <Route path="/verify-otp" element={<OtpVerification />} />
//               </Routes>
//             </main>
//             <Footer />
//           </div>
//         </Router>
//       </SocketProvider>
//     </AuthProvider>
//   );
// }

// export default App;

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute'; // Import the gatekeeper component

// --- LAZY LOAD YOUR PAGES ---
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const OtpVerification = React.lazy(() => import('./pages/OtpVerification'));
const Profiles = React.lazy(() => import('./pages/Profiles'));
const SuccessStories = React.lazy(() => import('./pages/SuccessStories'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

// A simple loading component for suspense fallback
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-rose-500"></div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Header />
          <main>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* --- Public Routes --- */}
                {/* These are accessible to everyone. */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<OtpVerification />} />
                <Route path="/success-stories" element={<SuccessStories />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* --- Protected Routes --- */}
                {/* These are only accessible if the user is logged in. */}
                {/* The ProtectedRoute component acts as a wrapper. */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profiles" element={<Profiles />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route>
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
