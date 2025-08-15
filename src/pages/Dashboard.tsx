import React, { useState, useEffect } from 'react';
import { useLocation , useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Upload, UserCircle, Tag, Plus, X, Inbox, Send, Check, MessageSquare, Heart, Trash2, Star } from 'lucide-react';
import ChatBox from '../components/ChatBox';
import ProfileCardModal from '../components/ProfileCardModal';
import ImageCropperModal from '../components/ImageCropperModal';

// --- Interfaces ---
interface ProfileImage { image_id: number; image_url: string; }
interface MyProfile {
  profile_id: number; user_id: number; name: string; age: number;
  location: string; education: string; profession: string;
  image: string | null;
  images: ProfileImage[];
  interests: string[]; about_me: string;
}
interface InterestRequest {
  interest_id: number; status: 'pending' | 'accepted' | 'rejected'; user_id: number;
  first_name: string; last_name: string; image: string | null;
}
interface Liker { user_id: number; first_name: string; last_name: string; image: string | null; }
interface ActiveChat { targetUser: { id: number; name: string; }; conversationId: number; }

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  

  const [myProfile, setMyProfile] = useState<MyProfile | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [newInterest, setNewInterest] = useState('');
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'chats' | 'likes'>('received');
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [receivedInterests, setReceivedInterests] = useState<InterestRequest[]>([]);
  const [sentInterests, setSentInterests] = useState<InterestRequest[]>([]);
  const [acceptedChats, setAcceptedChats] = useState<InterestRequest[]>([]);
  const [receivedLikes, setReceivedLikes] = useState<Liker[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<MyProfile | null>(null);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => { if (location.state?.defaultTab) setActiveTab(location.state.defaultTab); }, [location.state]);


  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('payment_success')) {
      // If payment was successful, refresh the user's premium status
      refreshUser().then(() => {
        // After refreshing, remove the query parameter from the URL for a clean state
        navigate('/dashboard', { replace: true });
        alert("Subscription successful! You are now a premium member.");
      });
    }
  }, []); 
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const [myProfileRes, receivedRes, sentRes, acceptedRes, likesRes] = await Promise.all([
          axios.get('${import.meta.env.VITE_API_BASE_URL}/api/profiles/me', config),
          axios.get('${import.meta.env.VITE_API_BASE_URL}/api/interests/received', config),
          axios.get('${import.meta.env.VITE_API_BASE_URL}/api/interests/sent', config),
          axios.get('${import.meta.env.VITE_API_BASE_URL}/api/interests/accepted', config),
          axios.get('${import.meta.env.VITE_API_BASE_URL}/api/likes/received', config),
        ]);
        setMyProfile(myProfileRes.data);
        setReceivedInterests(receivedRes.data);
        setSentInterests(sentRes.data);
        setAcceptedChats(acceptedRes.data);
        setReceivedLikes(likesRes.data);
      } catch (error) { console.error("Failed to fetch dashboard data:", error); }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (socket) {
      const handleStatusUpdate = (updatedInterest: InterestRequest) => {
        const updateUserLists = (prev: InterestRequest[]) => prev.map(i => i.interest_id === updatedInterest.interest_id ? { ...i, status: updatedInterest.status } : i);
        setReceivedInterests(updateUserLists);
        setSentInterests(updateUserLists);
        if (updatedInterest.status === 'accepted') {
          setAcceptedChats(prev => [...prev.filter(c => c.user_id !== updatedInterest.user_id), updatedInterest]);
        }
      };
      socket.on('interest_status_updated', handleStatusUpdate);
      return () => { socket.off('interest_status_updated', handleStatusUpdate); };
    }
  }, [socket]);

  // --- Handler Functions ---
  const onProfilePicFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageToCrop(reader.result as string));
      reader.readAsDataURL(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleCroppedImageUpload = async (croppedImageBlob: Blob) => {
    if (!croppedImageBlob) return;
    const formData = new FormData();
    formData.append('profileImage', croppedImageBlob, 'profile.jpg');
    setStatusMessage({ type: 'info', text: 'Uploading profile picture...' });
    setImageToCrop(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('${import.meta.env.VITE_API_BASE_URL}/api/profiles/picture', formData, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } });
      setMyProfile(prev => prev ? { ...prev, image: res.data.image } : null);
      setStatusMessage({ type: 'success', text: res.data.message });
    } catch (err: any) { setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed.' }); }
  };
  
  const handleGalleryUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryFiles || galleryFiles.length === 0) return setStatusMessage({ type: 'error', text: 'Please select files for the gallery.' });
    const formData = new FormData();
    for (let i = 0; i < galleryFiles.length; i++) formData.append('profileImages', galleryFiles[i]);
    setStatusMessage({ type: 'info', text: 'Uploading to gallery...' });
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('${import.meta.env.VITE_API_BASE_URL}/api/profiles/images', formData, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } });
      setMyProfile(prev => prev ? { ...prev, images: res.data.images } : null);
      setStatusMessage({ type: 'success', text: res.data.message });
      const fileInput = document.getElementById('gallery-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setGalleryFiles(null);
    } catch (err: any) { setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed.' }); }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/profiles/images/${imageId}`, { headers: { Authorization: `Bearer ${token}` } });
        setMyProfile(prev => prev ? { ...prev, images: prev.images.filter(img => img.image_id !== imageId) } : null);
        setStatusMessage({ type: 'success', text: 'Image deleted.' });
    } catch (error) { setStatusMessage({ type: 'error', text: 'Failed to delete image.' }); }
  };
  
  const handleSetMainPicture = async (imageUrl: string) => {
    setStatusMessage({ type: 'info', text: 'Setting profile picture...' });
    try {
        const token = localStorage.getItem('token');
        const res = await axios.put('${import.meta.env.VITE_API_BASE_URL}/api/profiles/picture', { imageUrl }, { headers: { Authorization: `Bearer ${token}` } });
        setMyProfile(prev => prev ? { ...prev, image: res.data.image } : null);
        setStatusMessage({ type: 'success', text: res.data.message });
    } catch (error) { setStatusMessage({ type: 'error', text: 'Failed to set profile picture.' }); }
  };

  const handleViewProfile = async (userId: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get<MyProfile>(`${import.meta.env.VITE_API_BASE_URL}/api/profiles/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedProfile(res.data);
    } catch (error) { console.error("Failed to fetch profile details", error); }
  };
  
  const handleCloseModal = () => { setSelectedProfile(null); };
  const handleOpenChat = async (targetUser: { id: number; name: string; }) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/conversations/${targetUser.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setActiveChat({ targetUser, conversationId: res.data.conversation_id });
    } catch (error) { alert("Error: Could not open chat."); }
  };
  
  const handleAddInterest = () => { if (newInterest && myProfile && !myProfile.interests.includes(newInterest)) { setMyProfile({ ...myProfile, interests: [...myProfile.interests, newInterest] }); setNewInterest(''); } };
  const handleRemoveInterest = (interestToRemove: string) => { if (myProfile) setMyProfile({ ...myProfile, interests: myProfile.interests.filter(i => i !== interestToRemove) }); };
  
  const handleSaveInterests = async () => {
    if (!myProfile) return;
    setStatusMessage({ type: 'info', text: 'Saving...' });
    try {
      const token = localStorage.getItem('token');
      await axios.put('${import.meta.env.VITE_API_BASE_URL}/api/profiles/interests', { interests: myProfile.interests }, { headers: { Authorization: `Bearer ${token}` } });
      setStatusMessage({ type: 'success', text: "Interests saved successfully." });
    } catch (err: any) { setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save.' }); }
  };
  
  const handleRespondInterest = async (interest: InterestRequest, status: 'accepted' | 'rejected') => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/interests/respond/${interest.interest_id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) { console.error("Failed to respond to interest", error); }
  };

  return (
    <>
      <ProfileCardModal profile={selectedProfile} onClose={handleCloseModal} />
      {imageToCrop && <ImageCropperModal imageSrc={imageToCrop} onCropComplete={handleCroppedImageUpload} onClose={() => setImageToCrop(null)} />}
      <div className="py-12 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
              <div className="flex items-center space-x-4 border-b pb-6">
                {myProfile?.image ? <img src={`${import.meta.env.VITE_API_BASE_URL}/${myProfile.image}`} alt="My Profile" className="h-20 w-20 rounded-full object-cover"/> : <UserCircle className="h-20 w-20 text-gray-300" />}
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{user?.first_name} {user?.last_name}</h2>
                  <label htmlFor="profile-pic-upload" className="mt-2 text-sm font-semibold text-rose-600 hover:text-rose-700 cursor-pointer">Update Profile Picture</label>
                  <input id="profile-pic-upload" type="file" onChange={onProfilePicFileChange} accept="image/*" className="hidden"/>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Upload size={18}/> Manage Photo Gallery</h3>
                <div className="grid grid-cols-3 gap-2 p-2 bg-gray-50 rounded-md min-h-[7rem]">
                  {myProfile?.images.map(img => (
                    <div key={img.image_id} className="relative group aspect-square">
                      <img src={`${import.meta.env.VITE_API_BASE_URL}/${img.image_url}`} alt="Profile Gallery" className="h-full w-full object-cover rounded-md"/>
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button title="Set as profile picture" onClick={() => handleSetMainPicture(img.image_url)} className="text-white p-1.5 rounded-full hover:bg-white/20"><Star size={16}/></button>
                        <button title="Delete image" onClick={() => handleDeleteImage(img.image_id)} className="text-white p-1.5 rounded-full hover:bg-white/20"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleGalleryUpload} className="space-y-3">
                  <label htmlFor="gallery-upload" className="text-sm font-medium text-gray-700">Add photos to gallery (up to 5):</label>
                  <input id="gallery-upload" type="file" multiple onChange={(e) => setGalleryFiles(e.target.files)} accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer"/>
                  <button type="submit" className="w-full bg-rose-500 text-white py-2 rounded-lg hover:bg-rose-600 transition disabled:bg-gray-400" disabled={!galleryFiles || galleryFiles.length === 0}>Upload to Gallery</button>
                </form>
              </div>
              <div className="space-y-3 border-t pt-6">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Tag size={18}/> Manage Interests</h3>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 rounded-md">
                  {myProfile?.interests.map(interest => (<span key={interest} className="flex items-center bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full">{interest} <button onClick={() => handleRemoveInterest(interest)} className="ml-2 text-gray-500 hover:text-gray-800"><X size={14}/></button></span>))}
                </div>
                <div className="flex gap-2"><input type="text" value={newInterest} onChange={e => setNewInterest(e.target.value)} placeholder="Add a hobby" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"/><button onClick={handleAddInterest} className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"><Plus size={20}/></button></div>
                <button onClick={handleSaveInterests} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">Save Interests</button>
              </div>
              {statusMessage.text && <p className={`text-sm text-center font-medium ${statusMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{statusMessage.text}</p>}
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {activeChat ? <ChatBox conversationId={activeChat.conversationId} targetUser={activeChat.targetUser} onBack={() => setActiveChat(null)} /> : (
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Communication Hub</h2>
                  <div className="flex border-b mb-4 flex-wrap">
                    <button onClick={() => setActiveTab('likes')} className={`py-2 px-4 flex items-center gap-2 ${activeTab === 'likes' ? 'border-b-2 border-rose-500 text-rose-600 font-semibold' : 'text-gray-500'}`}><Heart size={18}/> Likes ({receivedLikes.length})</button>
                    <button onClick={() => setActiveTab('chats')} className={`py-2 px-4 flex items-center gap-2 ${activeTab === 'chats' ? 'border-b-2 border-rose-500 text-rose-600 font-semibold' : 'text-gray-500'}`}><MessageSquare size={18}/> My Chats ({acceptedChats.length})</button>
                    <button onClick={() => setActiveTab('received')} className={`py-2 px-4 flex items-center gap-2 ${activeTab === 'received' ? 'border-b-2 border-rose-500 text-rose-600 font-semibold' : 'text-gray-500'}`}><Inbox size={18}/> Received ({receivedInterests.length})</button>
                    <button onClick={() => setActiveTab('sent')} className={`py-2 px-4 flex items-center gap-2 ${activeTab === 'sent' ? 'border-b-2 border-rose-500 text-rose-600 font-semibold' : 'text-gray-500'}`}><Send size={18}/> Sent ({sentInterests.length})</button>
                  </div>
                  <div className="space-y-3 h-[60vh] overflow-y-auto p-1">
                    {activeTab === 'likes' && receivedLikes.map(like => (
                      <div key={like.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                           {like.image ? <img src={`${import.meta.env.VITE_API_BASE_URL}/${like.image}`} alt={like.first_name} className="h-10 w-10 rounded-full object-cover"/> : <UserCircle className="h-10 w-10 text-gray-300"/>}
                           <p><span className="font-semibold">{like.first_name} {like.last_name}</span> liked your profile.</p>
                        </div>
                        <button onClick={() => handleViewProfile(like.user_id)} className="text-sm font-semibold text-blue-600 hover:underline">View Profile</button>
                      </div>
                    ))}
                    {activeTab === 'chats' && acceptedChats.map(chat => (
                      <button key={chat.interest_id} onClick={() => handleOpenChat({ id: chat.user_id, name: `${chat.first_name} ${chat.last_name}`})} className="w-full flex items-center gap-4 p-3 bg-gray-50 rounded-lg text-left hover:bg-rose-50 transition-colors">
                        {chat.image ? <img src={`${import.meta.env.VITE_API_BASE_URL}/${chat.image}`} alt={chat.first_name} className="h-12 w-12 rounded-full object-cover"/> : <UserCircle className="h-12 w-12 text-gray-300"/>}
                        <div>
                          <p className="font-semibold text-gray-800">{chat.first_name} {chat.last_name}</p>
                          <p className="text-sm text-green-600">You can now chat.</p>
                        </div>
                      </button>
                    ))}
                    {activeTab === 'received' && receivedInterests.map(interest => (
                      <div key={interest.interest_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <p><span className="font-semibold">{interest.first_name} {interest.last_name}</span> is interested.</p>
                        {interest.status === 'pending' && <div className="flex gap-2"><button onClick={() => handleRespondInterest(interest, 'accepted')} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"><Check size={16}/></button><button onClick={() => handleRespondInterest(interest, 'rejected')} className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"><X size={16}/></button></div>}
                        {interest.status === 'accepted' && <span className="text-sm font-semibold text-green-500">Accepted</span>}
                        {interest.status === 'rejected' && <span className="text-sm font-semibold text-red-500">Rejected</span>}
                      </div>
                    ))}
                    {activeTab === 'sent' && sentInterests.map(interest => (
                      <div key={interest.interest_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <p>You sent to <span className="font-semibold">{interest.first_name} {interest.last_name}</span></p>
                        {interest.status === 'pending' && <span className="text-sm font-semibold text-yellow-500">Pending</span>}
                        {interest.status === 'accepted' && <span className="text-sm font-semibold text-green-500">Accepted</span>}
                        {interest.status === 'rejected' && <span className="text-sm font-semibold text-red-500">Rejected</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
