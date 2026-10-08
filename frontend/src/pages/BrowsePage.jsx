import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  Search,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  ShoppingCart
} from 'lucide-react';
import API from '../services/api';
import ProductCard from '../components/ProductCard';

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [type, setType] = useState(searchParams.get('type') || 'ALL');
  const [condition, setCondition] = useState(searchParams.get('condition') || 'ALL');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch listings when search parameters change
  useEffect(() => {
    const fetchFilteredListings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (type && type !== 'ALL') params.append('type', type);
        if (condition && condition !== 'ALL') params.append('condition', condition);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (sortBy) params.append('sortBy', sortBy);

        const res = await API.get(`/listings?${params.toString()}`);
        if (res.data.success) {
          setListings(res.data.listings);
          setTotalCount(res.data.total);
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredListings();
  }, [search, category, type, condition, minPrice, maxPrice, sortBy]);

  // Sync state with URL
  const updateFilters = (newParams) => {
    const updated = {
      ...(search && { search }),
      ...(category && { category }),
      ...(type !== 'ALL' && { type }),
      ...(condition !== 'ALL' && { condition }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      ...(sortBy !== 'newest' && { sortBy }),
      ...newParams,
    };
    setSearchParams(updated);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setType('ALL');
    setCondition('ALL');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search items, keywords, model..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              updateFilters({ search: e.target.value });
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 rounded-xl border border-transparent focus:border-brand-500 focus:bg-white focus:outline-none text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Quick Type Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Items', icon: Layers },
            { id: 'SELL', label: 'For Sale', icon: ShoppingCart },
            { id: 'RENT', label: 'For Rent', icon: Clock },
            { id: 'SWAP', label: 'For Swap', icon: Sparkles },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = type === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setType(t.id);
                  updateFilters({ type: t.id });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? t.id === 'SWAP'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : t.id === 'RENT'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              updateFilters({ sortBy: e.target.value });
            }}
            className="text-xs font-bold bg-slate-100 border-0 rounded-xl px-3 py-2 text-slate-700 focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Most Popular (Views)</option>
          </select>
        </div>

      </div>

      {/* Main Layout Grid (Sidebar + Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Filter Sidebar */}
        <aside className="space-y-6 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-600" />
              Filter Results
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-brand-600 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Category
            </label>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setCategory('');
                  updateFilters({ category: '' });
                }}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  category === ''
                    ? 'bg-brand-50 text-brand-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Categories ({totalCount})
              </button>
              {categories.map((c) => {
                const isSelected = category === c.slug || category === String(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCategory(c.slug);
                      updateFilters({ category: c.slug });
                    }}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {c.availableCount !== undefined && (
                      <span className="text-[10px] text-slate-400">{c.availableCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Condition Filter */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Condition
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {['ALL', 'BRAND_NEW', 'LIKE_NEW', 'GOOD', 'FAIR'].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCondition(c);
                    updateFilters({ condition: c });
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all text-center ${
                    condition === c
                      ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Price Range (₹)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  updateFilters({ minPrice: e.target.value });
                }}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  updateFilters({ maxPrice: e.target.value });
                }}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <main className="lg:col-span-3 space-y-4">
          
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>Showing <strong>{listings.length}</strong> of <strong>{totalCount}</strong> listings</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse h-80"></div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No items found matching your filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try loosening your search terms, changing category, or checking back soon as students post new gear daily.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((item) => (
                <ProductCard key={item.id} listing={item} />
              ))}
            </div>
          )}

        </main>

      </div>

    </div>
  );
}
