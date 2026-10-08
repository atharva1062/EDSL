import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Trash2, CheckCircle2 } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState('SELL');
  const [status, setStatus] = useState('AVAILABLE');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [imageUrl, setImageUrl] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [rentDuration, setRentDuration] = useState('per week');
  const [swapPreferences, setSwapPreferences] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const [listingRes, catsRes] = await Promise.all([
          API.get(`/listings/${id}`),
          API.get('/categories'),
        ]);

        if (catsRes.data.success) {
          setCategories(catsRes.data.categories);
        }

        if (listingRes.data.success) {
          const l = listingRes.data.listing;
          // Check ownership
          if (l.sellerId !== user?.id && user?.role !== 'ADMIN') {
            showToast('You are not authorized to edit this listing.', 'error');
            navigate('/dashboard');
            return;
          }

          setTitle(l.title);
          setDescription(l.description);
          setCategoryId(l.categoryId);
          setType(l.type);
          setStatus(l.status);
          setPrice(l.price);
          setOriginalPrice(l.originalPrice || '');
          setCondition(l.condition);
          setImageUrl(l.imageUrl || '');
          setPickupLocation(l.pickupLocation || '');
          setRentDuration(l.rentDuration || 'per week');
          setSwapPreferences(l.swapPreferences || '');
        }
      } catch (err) {
        showToast('Failed to load listing for editing.', 'error');
        navigate('/my-listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        title,
        description,
        categoryId: parseInt(categoryId),
        type,
        status,
        price: type === 'SWAP' ? 0 : parseFloat(price) || 0,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        condition,
        imageUrl,
        pickupLocation,
        rentDuration: type === 'RENT' ? rentDuration : null,
        swapPreferences: type === 'SWAP' ? swapPreferences : null,
      };

      const res = await API.put(`/listings/${id}`, payload);
      if (res.data.success) {
        showToast('Listing updated successfully!', 'success');
        navigate(`/listings/${id}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update listing.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await API.delete(`/listings/${id}`);
      if (res.data.success) {
        showToast('Listing deleted.', 'success');
        navigate('/my-listings');
      }
    } catch (err) {
      showToast('Failed to delete listing.', 'error');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading listing details...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel & Back
      </button>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Edit Listing</h1>
            <p className="text-xs text-slate-500 mt-0.5">Update item availability, pricing, or description</p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Delete Item
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Status Selector */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Item Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['AVAILABLE', 'RESERVED', 'SOLD', 'RENTED'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    status === st
                      ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="BRAND_NEW">Brand New</option>
                <option value="LIKE_NEW">Like New</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
              </select>
            </div>
          </div>

          {type !== 'SWAP' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Pickup Location
                </label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-7 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
