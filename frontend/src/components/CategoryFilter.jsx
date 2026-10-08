import React from 'react';
import {
  BookOpen,
  Laptop,
  Bike,
  Home,
  FileText,
  Dumbbell,
  Shirt,
  Armchair,
  Tag,
  Sparkles,
  Layers
} from 'lucide-react';

const iconMap = {
  BookOpen,
  Laptop,
  Bike,
  Home,
  FileText,
  Dumbbell,
  Shirt,
  Armchair,
  Tag,
};

export default function CategoryFilter({ categories = [], selectedCategory, onSelectCategory }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
      <button
        onClick={() => onSelectCategory('')}
        className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
          selectedCategory === ''
            ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-102'
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
        }`}
      >
        <Layers className="w-4 h-4" />
        All Items
      </button>

      {categories.map((cat) => {
        const IconComponent = iconMap[cat.icon] || Tag;
        const isSelected = selectedCategory === cat.slug || selectedCategory === String(cat.id);

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.slug)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              isSelected
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20 scale-102'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <IconComponent className="w-4 h-4 shrink-0" />
            <span>{cat.name}</span>
            {cat.availableCount !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {cat.availableCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
