import React, { useState } from 'react';
import { UserRequirements } from '../types';
import { STYLE_OPTIONS } from '../constants';
import { Home, Layers, Bed, Bath, FileText, Ruler } from 'lucide-react';

interface InputFormProps {
  onSubmit: (data: UserRequirements) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<UserRequirements>({
    plotSize: '',
    floors: '1',
    bedrooms: '3',
    bathrooms: '2',
    style: STYLE_OPTIONS[0],
    requirements: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-slate-900 p-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Home className="w-6 h-6 text-blue-400" />
          Project Specifications
        </h2>
        <p className="text-slate-400 mt-2 text-sm">Tell ArchGenius about your dream home.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plot Size */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Ruler className="w-4 h-4 text-slate-400" />
              Plot Size (sqft or dimensions)
            </label>
            <input
              type="text"
              name="plotSize"
              required
              placeholder="e.g. 2400 sqft or 40x60"
              value={formData.plotSize}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Floors */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Layers className="w-4 h-4 text-slate-400" />
              Number of Floors
            </label>
            <select
              name="floors"
              value={formData.floors}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
            >
              {[1, 2, 3, 4].map(n => (
                <option key={n} value={n}>{n} Floor{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Bedrooms */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Bed className="w-4 h-4 text-slate-400" />
              Bedrooms
            </label>
            <input
              type="number"
              name="bedrooms"
              min="1"
              max="10"
              value={formData.bedrooms}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Bathrooms */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Bath className="w-4 h-4 text-slate-400" />
              Bathrooms
            </label>
            <input
              type="number"
              name="bathrooms"
              min="1"
              max="10"
              value={formData.bathrooms}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Style */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Home className="w-4 h-4 text-slate-400" />
            Architectural Style
          </label>
          <select
            name="style"
            value={formData.style}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
          >
            {STYLE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Requirements */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <FileText className="w-4 h-4 text-slate-400" />
            Specific Requirements & Notes
          </label>
          <textarea
            name="requirements"
            rows={4}
            placeholder="e.g. Needs a large kitchen island, south-facing garden, home office on ground floor, prayer room..."
            value={formData.requirements}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-xl text-white font-semibold text-lg shadow-lg transition-all transform active:scale-[0.98] 
            ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30'}`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Architecting...
            </span>
          ) : (
            "Generate Designs"
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;
