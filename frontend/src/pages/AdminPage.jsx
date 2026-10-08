import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  ShoppingBag,
  ArrowLeftRight,
  CheckCircle2,
  Trash2,
  Plus,
  Clock,
  ExternalLink
} from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Tag');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      showToast('Admin privileges required.', 'error');
      navigate('/');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const [reportsRes, statsRes, catsRes] = await Promise.all([
          API.get('/reports/admin'),
          API.get('/stats/overview'),
          API.get('/categories'),
        ]);

        if (reportsRes.data.success) {
          setReports(reportsRes.data.reports);
        }
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
        if (catsRes.data.success) {
          setCategories(catsRes.data.categories);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [isAdmin]);

  const handleUpdateReport = async (reportId, status, removeListing = false) => {
    try {
      const res = await API.put(`/reports/admin/${reportId}`, {
        status,
        removeListing,
      });

      if (res.data.success) {
        showToast(
          removeListing
            ? 'Listing removed and report resolved.'
            : `Report status updated to ${status}.`,
          'success'
        );
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? res.data.report : r))
        );
      }
    } catch (err) {
      showToast('Failed to update report.', 'error');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await API.post('/categories', {
        name: newCatName.trim(),
        icon: newCatIcon,
      });

      if (res.data.success) {
        showToast('New category added to marketplace!', 'success');
        setCategories((prev) => [...prev, res.data.category]);
        setNewCatName('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error adding category.', 'error');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading admin safety hub...</div>;
  }

  const pendingReports = reports.filter((r) => r.status === 'PENDING');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-400" />
            <h1 className="text-2xl font-black">Campus Safety & Admin Hub</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Platform governance, fraud monitoring, and category management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold border border-slate-700">
            {pendingReports.length} Unresolved Reports
          </span>
        </div>
      </div>

      {/* Platform Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Students</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalStudents || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Listings</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalListings || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Completed Deals</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats?.completedDeals || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Flagged Reports</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{reports.length}</p>
        </div>
      </div>

      {/* Flagged Item Reports Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Flagged Listings & Safety Reports
            </h2>
            <p className="text-xs text-slate-500">Review reports submitted by students</p>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No safety reports filed. The campus marketplace is running smoothly!
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className={`p-4 rounded-2xl border transition-all ${
                  rep.status === 'PENDING'
                    ? 'bg-rose-50/50 border-rose-200'
                    : 'bg-slate-50 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-600 text-white uppercase">
                        {rep.reason}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {rep.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">
                      Reported Item: {rep.listing?.title || 'Listing Removed'}
                    </h4>

                    <p className="text-xs text-slate-600 italic">
                      "{rep.description || 'No additional note provided'}"
                    </p>

                    <p className="text-[11px] text-slate-400">
                      Reported by: <strong>{rep.reporter?.name}</strong> ({rep.reporter?.email}) • {new Date(rep.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {rep.listing && (
                      <Link
                        to={`/listings/${rep.listingId}`}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Item
                      </Link>
                    )}

                    {rep.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleUpdateReport(rep.id, 'RESOLVED', false)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                        >
                          Dismiss / Resolve
                        </button>

                        <button
                          onClick={() => handleUpdateReport(rep.id, 'RESOLVED', true)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove Listing
                        </button>
                      </>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Creation Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
          Add New Marketplace Category
        </h2>

        <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Category Name (e.g. Lab Kits, Musical Instruments)"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-semibold"
          />

          <select
            value={newCatIcon}
            onChange={(e) => setNewCatIcon(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800"
          >
            <option value="BookOpen">BookOpen</option>
            <option value="Laptop">Laptop</option>
            <option value="Bike">Bike</option>
            <option value="Home">Home</option>
            <option value="FileText">FileText</option>
            <option value="Dumbbell">Dumbbell</option>
            <option value="Shirt">Shirt</option>
            <option value="Armchair">Armchair</option>
            <option value="Tag">Tag</option>
          </select>

          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </form>
      </div>

    </div>
  );
}
