import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function MyListingsPage() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchListings = async () => {
    try {
      const res = await API.get('/listings/my-listings');
      if (res.data.success) {
        setListings(res.data.listings);
      }
    } catch (err) {
      showToast('Failed to load your listings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchListings();
  }, [isAuthenticated]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await API.put(`/listings/${id}`, { status: newStatus });
      if (res.data.success) {
        showToast(`Item status changed to ${newStatus}.`, 'success');
        setListings((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      const res = await API.delete(`/listings/${id}`);
      if (res.data.success) {
        showToast('Listing deleted.', 'success');
        setListings((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      showToast('Failed to delete listing.', 'error');
    }
  };

  const filteredListings =
    filterStatus === 'ALL'
      ? listings
      : listings.filter((item) => item.status === filterStatus);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Campus Listings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your items, update pricing, or mark items as sold/rented
          </p>
        </div>
        <Link
          to="/create-listing"
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Add New Item
        </Link>
      </div>

      {/* Filter status tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'AVAILABLE', 'RESERVED', 'SOLD', 'RENTED', 'SWAPPED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterStatus === st
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {st} ({st === 'ALL' ? listings.length : listings.filter((l) => l.status === st).length})
          </button>
        ))}
      </div>

      {/* Listings Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading your items...</div>
      ) : filteredListings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No listings found in this category</h3>
          <p className="text-xs text-slate-500">Post items to start selling or swapping on campus.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                      {item.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.status === 'AVAILABLE'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{item.category?.name}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {item.views} views
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{item.title}</h3>
                  <p className="text-sm font-black text-brand-600">
                    {item.type === 'SWAP' ? 'Exchange Item' : `₹${item.price}`}
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2.5">
                {/* Status Toggle buttons */}
                <div className="flex items-center justify-between gap-1 text-[11px] font-semibold">
                  <span className="text-slate-500">Status:</span>
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="SOLD">SOLD</option>
                    <option value="RENTED">RENTED</option>
                    <option value="SWAPPED">SWAPPED</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1 gap-2">
                  <Link
                    to={`/listings/${item.id}`}
                    className="flex-1 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View
                  </Link>
                  <Link
                    to={`/edit-listing/${item.id}`}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
