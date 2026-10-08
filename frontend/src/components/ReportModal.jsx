import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, Send } from 'lucide-react';
import API from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function ReportModal({ listing, isOpen, onClose }) {
  const { showToast } = useNotification();
  const [reason, setReason] = useState('INAPPROPRIATE');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await API.post('/reports', {
        listingId: listing.id,
        reason,
        description,
      });

      if (res.data.success) {
        showToast('Report submitted for campus moderation.', 'success');
        onClose();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit report.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-rose-950 text-rose-100 flex items-center justify-between border-b border-rose-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-sm text-white">Report Listing</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-rose-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Help us maintain a safe, trusted college marketplace. Our moderation team reviews all flagged items.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="INAPPROPRIATE">Prohibited / Inappropriate Item</option>
              <option value="FRAUD">Suspected Fraud or Scam</option>
              <option value="SPAM">Spam or Duplicate Listing</option>
              <option value="INACCURATE">Misleading Description / Condition</option>
              <option value="OTHER">Other Safety Violation</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Details & Context
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain why this listing should be reviewed by college moderators..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
