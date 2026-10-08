import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, ShoppingBag, ArrowLeft } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function SavedPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const res = await API.get('/listings/saved');
      if (res.data.success) {
        setSavedListings(res.data.listings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchSaved();
  }, [isAuthenticated]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-rose-500 fill-rose-500" /> Saved Wishlist
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Keep track of items you are interested in buying, renting, or swapping
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading your saved items...</div>
      ) : savedListings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Your wishlist is empty</h3>
          <p className="text-xs text-slate-500">
            Bookmark listings while exploring the marketplace to save them here.
          </p>
          <Link
            to="/browse"
            className="inline-block px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Explore Market
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {savedListings.map((item) => (
            <ProductCard
              key={item.id}
              listing={item}
              onSaveToggle={() => fetchSaved()}
            />
          ))}
        </div>
      )}

    </div>
  );
}
