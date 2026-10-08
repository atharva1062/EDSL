import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Star,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Save,
  ShoppingBag
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ProductCard from '../components/ProductCard';

export default function ProfilePage() {
  const { user: currentUser, updateProfile, isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [campus, setCampus] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const [meRes, reviewsRes] = await Promise.all([
          API.get('/auth/me'),
          API.get(`/reviews/user/${currentUser.id}`),
        ]);

        if (meRes.data.success) {
          const u = meRes.data.user;
          setName(u.name || '');
          setPhone(u.phone || '');
          setCollegeId(u.collegeId || '');
          setCampus(u.campus || 'Main Campus');
          setBio(u.bio || '');
          setAvatar(u.avatar || '');
        }

        if (reviewsRes.data.success) {
          setReviews(reviewsRes.data.reviews || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, currentUser]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await updateProfile({
        name,
        phone,
        collegeId,
        campus,
        bio,
        avatar,
      });

      if (res.success) {
        showToast('Profile updated successfully!', 'success');
      } else {
        showToast(res.message || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      showToast('Error updating profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading student profile...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-6">
        <img
          src={
            avatar ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
          }
          alt={name}
          className="w-24 h-24 rounded-3xl object-cover ring-4 ring-brand-500/20 shadow-md"
        />

        <div className="flex-1 text-center md:text-left space-y-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">{name}</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 w-fit mx-auto md:mx-0">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Student ID
            </span>
          </div>

          <p className="text-xs text-slate-500">
            {currentUser?.email} • {collegeId ? `Roll No: ${collegeId}` : ''}
          </p>

          <p className="text-xs text-slate-600 mt-2 max-w-xl">
            {bio || 'No bio added yet. Tell other students what semester or courses you are enrolled in!'}
          </p>
        </div>

        {/* Reputation Badge */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center shrink-0">
          <div className="flex items-center justify-center gap-1 text-amber-500 text-xl font-black">
            <Star className="w-5 h-5 fill-amber-400" />
            <span>5.0</span>
          </div>
          <span className="text-[11px] font-bold text-amber-800 block mt-0.5">
            {reviews.length} Peer Reviews
          </span>
        </div>
      </div>

      {/* Main Grid: Form & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Edit Profile Details */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
            Edit Student Details
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  College ID / Roll Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS-2024-042"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  WhatsApp / Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Campus / Hostel Location
              </label>
              <input
                type="text"
                placeholder="e.g. Hostel Block B / Science Complex"
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Bio / About You
              </label>
              <textarea
                rows={3}
                placeholder="Share your major, graduation year, or what items you frequently buy/sell..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Avatar Image URL
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>

          </form>
        </div>

        {/* Right: Received Reviews List */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
            Campus Reputation Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <Star className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No reviews received yet.</p>
              <p className="text-[11px]">Reviews are added automatically when you complete buy, sell, or swap deals.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {reviews.map((r) => (
                <div key={r.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={r.reviewer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80'}
                        alt={r.reviewer?.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-slate-900">{r.reviewer?.name}</span>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  {r.comment && (
                    <p className="text-xs text-slate-600 italic">"{r.comment}"</p>
                  )}

                  <span className="text-[10px] text-slate-400 block">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
