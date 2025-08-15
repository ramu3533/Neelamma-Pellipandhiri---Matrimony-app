// import React from 'react';
// import { X, ShieldCheck, Zap } from 'lucide-react';
// import { loadStripe } from '@stripe/stripe-js';
// import axios from 'axios';

// // Replace with your actual Stripe publishable key
// const stripePromise = loadStripe('pk_test_...your_publishable_key');

// interface ModalProps {
//   onClose: () => void;
// }

// const SubscriptionModal = ({ onClose }: ModalProps) => {

//   const handleSubscribe = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const config = { headers: { Authorization: `Bearer ${token}` } };
      
//       // 1. Create a checkout session on your backend
//       const res = await axios.post('http://localhost:5000/api/stripe/create-checkout-session', {}, config);
//       const { id } = res.data;

//       // 2. Redirect to Stripe Checkout
//       const stripe = await stripePromise;
//       if (stripe) {
//         await stripe.redirectToCheckout({ sessionId: id });
//       }
//     } catch (error) {
//       console.error("Failed to initiate subscription:", error);
//       // You can add a state to show an error message here
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
//       <div className="bg-white rounded-2xl shadow-xl w-full max-w-md text-center p-8 transform transition-all animate-slide-up" onClick={e => e.stopPropagation()}>
//         <div className="relative">
//           <button onClick={onClose} className="absolute -top-4 -right-4 bg-gray-200 p-1.5 rounded-full hover:bg-gray-300 transition"><X size={20} /></button>
          
//           <div className="mx-auto bg-gradient-to-br from-rose-500 to-pink-500 h-16 w-16 flex items-center justify-center rounded-full">
//             <ShieldCheck className="text-white h-8 w-8" />
//           </div>

//           <h2 className="text-2xl font-bold text-gray-800 mt-4">Unlock Unlimited Access</h2>
//           <p className="text-gray-600 mt-2">You've reached your free profile view limit. Subscribe to our Premium Membership to continue your search without limits!</p>

//           <div className="bg-rose-50 rounded-lg p-4 mt-6 text-left space-y-2">
//             <div className="flex items-center"><Zap size={18} className="text-rose-500 mr-2"/><strong>Unlimited Profile Views</strong></div>
//             <div className="flex items-center"><Zap size={18} className="text-rose-500 mr-2"/><strong>Enhanced Chat Features</strong> (Coming Soon)</div>
//             <div className="flex items-center"><Zap size={18} className="text-rose-500 mr-2"/><strong>Priority Customer Support</strong></div>
//           </div>

//           <div className="mt-6">
//             <button onClick={handleSubscribe} className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
//               Subscribe Now for ₹200
//             </button>
//             <button onClick={onClose} className="mt-2 text-sm text-gray-500 hover:underline">Maybe later</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SubscriptionModal;

import React, { useState } from 'react';
import { X, ShieldCheck, Zap } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';

// --- CRITICAL FIX: Replace this placeholder with your actual Stripe publishable key ---
const STRIPE_PUBLISHABLE_KEY = 'pk_test_...your_real_publishable_key_goes_here';

if (!STRIPE_PUBLISHABLE_KEY.startsWith('pk_test')) {
  console.error("Stripe publishable key is missing or invalid. Please replace the placeholder in SubscriptionModal.tsx");
}

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface ModalProps {
  onClose: () => void;
}

const SubscriptionModal = ({ onClose }: ModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.post('http://localhost:5000/api/stripe/create-checkout-session', {}, config);
      const { id: sessionId } = res.data;

      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error("Stripe redirect error:", error.message);
          setError("Could not redirect to payment page. Please try again.");
        }
      } else {
        setError("Stripe is not available. Please try again later.");
      }
    } catch (err) {
      console.error("Failed to initiate subscription:", err);
      setError("Failed to create payment session. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md text-center p-8 transform transition-all animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="relative">
          <button onClick={onClose} className="absolute -top-4 -right-4 bg-gray-200 p-1.5 rounded-full hover:bg-gray-300 transition"><X size={20} /></button>
          
          <div className="mx-auto bg-gradient-to-br from-rose-500 to-pink-500 h-16 w-16 flex items-center justify-center rounded-full">
            <ShieldCheck className="text-white h-8 w-8" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mt-4">Unlock Unlimited Access</h2>
          <p className="text-gray-600 mt-2">You've reached your free profile view limit. Subscribe to our Premium Membership to continue your search without limits!</p>

          <div className="bg-rose-50 rounded-lg p-4 mt-6 text-left space-y-2">
            <div className="flex items-center"><Zap size={18} className="text-rose-500 mr-2"/><strong>Unlimited Profile Views</strong></div>
            <div className="flex items-center"><Zap size={18} className="text-rose-500 mr-2"/><strong>Send Unlimited Interests</strong></div>
            <div className="flex items-center"><Zap size={18} className="text-rose-500 mr-2"/><strong>Priority Customer Support</strong></div>
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

          <div className="mt-6">
            <button 
              onClick={handleSubscribe} 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Redirecting...' : 'Subscribe Now for ₹200'}
            </button>
            <button onClick={onClose} className="mt-2 text-sm text-gray-500 hover:underline">Maybe later</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;