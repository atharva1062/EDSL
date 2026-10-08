import React, { useState } from 'react';
import { X, ArrowLeftRight, Clock, ShoppingCart, MapPin, Send, AlertCircle } from 'lucide-react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function RequestModal({ listing, isOpen, onClose, onSuccess }) {
  const { showToast } = useNotification();
  const [type, setType] = useState(listing?.type || 'BUY');
  const [rentDays, setRentDays] = useState(7);
  const [swapItemDetails, setSwapItemDetails] = useState('');
  const [meetLocation, setMeetLocation] = useState(listing?.pickupLocation || 'Library Ground Floor');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !listing) return null;

  // Calculate estimated total
  let calculatedAmount = listing.price;
  if (type === 'RENT') {
    calculatedAmount = listing.price * (rentDays <= 7 ? 1 : Math.ceil(rentDays / 7));
  } else if (type === 'SWAP') {
    calculatedAmount = 0;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        listingId: listing.id,
        type,
        amount: calculatedAmount,
        swapItemDetails: type === 'SWAP' ? swapItemDetails : null,
        rentDays: type === 'RENT' ? parseInt(rentDays) : null,
        meetLocation,
        note,
      };

      const res = await API.post('/transactions', payload);
      if (res.data.success) {
        showToast(`Your ${type} request has been sent to ${listing.seller.name}!`, 'success');
        if (onSuccess) onSuccess(res.data.transaction);
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-base">Make a Deal Proposal</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listing preview banner */}
        <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-200"
          />
          <div>
            <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{listing.title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Listed by <span className="font-semibold text-slate-700">{listing.seller?.name}</span>
            </p>
            <p className="text-xs font-bold text-brand-600 mt-1">
              {listing.type === 'SWAP' ? 'Exchange Proposal' : `Price: ₹${listing.price}`}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Proposal Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Deal Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('BUY')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  type === 'BUY'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                Buy Item
              </button>

              <button
                type="button"
                onClick={() => setType('RENT')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  type === 'RENT'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4 text-blue-600" />
                Rent Item
              </button>

              <button
                type="button"
                onClick={() => setType('SWAP')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  type === 'SWAP'
                    ? 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4 text-amber-600" />
                Swap Item
              </button>
            </div>
          </div>

          {/* Conditional Rent Options */}
          {type === 'RENT' && (
            <div className="bg-blue-50/70 border border-blue-100 p-3.5 rounded-2xl space-y-2">
              <label className="block text-xs font-bold text-blue-900">Rent Duration (Days)</label>
              <select
                value={rentDays}
                onChange={(e) => setRentDays(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 Day (Quick Lab Exam)</option>
                <option value={7}>7 Days (1 Week)</option>
                <option value={14}>14 Days (2 Weeks)</option>
                <option value={30}>30 Days (1 Month)</option>
                <option value={90}>Full Semester (90 Days)</option>
              </select>
            </div>
          )}

          {/* Conditional Swap Details */}
          {type === 'SWAP' && (
            <div className="bg-amber-50/70 border border-amber-100 p-3.5 rounded-2xl space-y-2">
              <label className="block text-xs font-bold text-amber-900">
                What item are you offering to swap? *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Operating Systems Textbook (Silberschatz) or Scientific Calculator"
                value={swapItemDetails}
                onChange={(e) => setSwapItemDetails(e.target.value)}
                className="w-full text-xs bg-white border border-amber-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {listing.swapPreferences && (
                <p className="text-[11px] text-amber-700">
                  💡 Seller requested: <strong>{listing.swapPreferences}</strong>
                </p>
              )}
            </div>
          )}

          {/* Meetup Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Proposed Campus Meetup Spot
            </label>
            <div className="relative">
              <input
                type="text"
                value={meetLocation}
                onChange={(e) => setMeetLocation(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
                placeholder="e.g. Main Library Entrance, Student Canteen"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Note to seller */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Message / Note to Seller
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Hi! Are you free to meet after 4 PM today?"
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          {/* Safety Notice */}
          <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <span>Always exchange items at safe, public campus spots during daylight hours. Verify item condition in-person before marking complete.</span>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Sending Request...' : 'Send Request to Student'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
