import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  MapPin,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ReviewModal from '../components/ReviewModal';

export default function TransactionsPage() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('selling'); // 'selling' or 'buying'
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [selectedTransactionForReview, setSelectedTransactionForReview] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await API.get('/transactions');
      if (res.data.success) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      showToast('Failed to fetch transactions.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchTransactions();
  }, [isAuthenticated]);

  const handleUpdateStatus = async (transactionId, newStatus) => {
    try {
      const res = await API.put(`/transactions/${transactionId}/status`, {
        status: newStatus,
      });

      if (res.data.success) {
        showToast(`Transaction marked as ${newStatus}!`, 'success');
        setTransactions((prev) =>
          prev.map((t) => (t.id === transactionId ? res.data.transaction : t))
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update transaction status.', 'error');
    }
  };

  const sellingTransactions = transactions.filter((t) => t.sellerId === user?.id);
  const buyingTransactions = transactions.filter((t) => t.buyerId === user?.id);

  const displayedTransactions =
    activeTab === 'selling' ? sellingTransactions : buyingTransactions;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-black text-slate-900">Campus Deals & Requests</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Accept or manage buy, rent, and swap proposals from fellow students
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('selling')}
          className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'selling'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Incoming Requests on My Items ({sellingTransactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('buying')}
          className={`pb-3 text-sm font-bold transition-all relative flex items-center gap-2 ${
            activeTab === 'buying'
              ? 'text-brand-600 border-b-2 border-brand-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>My Outgoing Requests ({buyingTransactions.length})</span>
        </button>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading deal proposals...</div>
      ) : displayedTransactions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <ArrowLeftRight className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No requests found in this tab</h3>
          <p className="text-xs text-slate-500">
            {activeTab === 'selling'
              ? 'When students request to buy or swap your items, they will appear here.'
              : 'Explore the marketplace and propose deals with other students!'}
          </p>
          <Link
            to="/browse"
            className="inline-block px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Explore Market
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedTransactions.map((tx) => {
            const isSeller = tx.sellerId === user?.id;
            const otherParty = isSeller ? tx.buyer : tx.seller;

            return (
              <div
                key={tx.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                {/* Left Item & Student info */}
                <div className="flex items-start gap-4">
                  <img
                    src={tx.listing?.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300'}
                    alt={tx.listing?.title}
                    className="w-20 h-20 rounded-2xl object-cover ring-1 ring-slate-200 shrink-0"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                        tx.type === 'SWAP'
                          ? 'bg-amber-100 text-amber-800'
                          : tx.type === 'RENT'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {tx.type} DEAL
                      </span>

                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        tx.status === 'COMPLETED'
                          ? 'bg-emerald-500 text-white'
                          : tx.status === 'ACCEPTED'
                          ? 'bg-blue-500 text-white'
                          : tx.status === 'PENDING'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-400 text-white'
                      }`}>
                        {tx.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 line-clamp-1">
                      {tx.listing?.title}
                    </h3>

                    <p className="text-xs text-slate-500">
                      {isSeller ? 'Requested by' : 'Seller'}:{' '}
                      <strong className="text-slate-800">{otherParty?.name}</strong> ({otherParty?.campus || 'Main Campus'})
                    </p>

                    {/* Swap offer / rent info */}
                    {tx.type === 'SWAP' && tx.swapItemDetails && (
                      <p className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 font-medium">
                        🔄 Offered in Swap: <strong>{tx.swapItemDetails}</strong>
                      </p>
                    )}

                    {tx.type === 'RENT' && tx.rentDays && (
                      <p className="text-xs text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 font-medium">
                        ⏳ Rental duration: <strong>{tx.rentDays} days</strong>
                      </p>
                    )}

                    {tx.meetLocation && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-brand-600" />
                        <span>Meetup Spot: {tx.meetLocation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  
                  {/* Price Tag */}
                  <div className="text-right pr-2">
                    <span className="text-xs text-slate-400 block">Agreed Amount</span>
                    <span className="text-lg font-black text-slate-900">
                      {tx.type === 'SWAP' ? 'Exchange' : `₹${tx.amount}`}
                    </span>
                  </div>

                  {/* Chat Action */}
                  <Link
                    to={`/messages?user=${otherParty?.id}&listing=${tx.listingId}`}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                    title="Chat about meetup"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>

                  {/* Seller PENDING Actions: Accept / Reject */}
                  {isSeller && tx.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(tx.id, 'ACCEPTED')}
                        className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accept Request
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(tx.id, 'REJECTED')}
                        className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {/* Deal In Progress: Mark Completed */}
                  {tx.status === 'ACCEPTED' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(tx.id, 'COMPLETED')}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(tx.id, 'CANCELLED')}
                        className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Completed Deal: Leave Review */}
                  {tx.status === 'COMPLETED' && (
                    <div>
                      {tx.review ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>Rated {tx.review.rating}/5</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedTransactionForReview(tx);
                            setReviewModalOpen(true);
                          }}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" /> Rate Student
                        </button>
                      )}
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedTransactionForReview && (
        <ReviewModal
          transaction={selectedTransactionForReview}
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedTransactionForReview(null);
          }}
          onSuccess={() => {
            fetchTransactions();
          }}
        />
      )}

    </div>
  );
}
