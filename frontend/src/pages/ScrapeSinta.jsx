import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Play, Loader } from 'lucide-react';
import axios from 'axios';

const CATEGORIES = [
  { id: 1, name: 'Religion' },
  { id: 2, name: 'Economy' },
  { id: 3, name: 'Humanities' },
  { id: 4, name: 'Health' },
  { id: 5, name: 'Science' },
  { id: 6, name: 'Education' },
  { id: 7, name: 'Agriculture' },
  { id: 8, name: 'Art' },
  { id: 9, name: 'Social' },
  { id: 10, name: 'Engineering' },
];

const ScrapeSinta = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sinta_ranks: [1, 2],
    filter_area_codes: [],
    max_pages: 10,
    collection_name: 'sinta_scrape_001',
    overwrite: false
  });
  const [response, setResponse] = useState(null);

  const handleRankChange = (rank) => {
    setFormData(prev => {
      const ranks = prev.sinta_ranks.includes(rank)
        ? prev.sinta_ranks.filter(r => r !== rank)
        : [...prev.sinta_ranks, rank];
      return { ...prev, sinta_ranks: ranks.sort() };
    });
  };

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => {
      const categories = prev.filter_area_codes.includes(categoryId)
        ? prev.filter_area_codes.filter(c => c !== categoryId)
        : [...prev.filter_area_codes, categoryId];
      return { ...prev, filter_area_codes: categories.sort() };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    try {
      const res = await axios.post('http://localhost:8000/scrape/sinta', formData);
      setResponse({ type: 'success', message: res.data.message });
    } catch (error) {
      setResponse({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Scrape Sinta Journals</h1>
        <p className="text-gray-400">Configure and start a new scraping job for Sinta journals.</p>
      </motion.div>

      <Card className="border-t-4 border-t-primary">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-300">Sinta Ranks to Scrape</label>
            <div className="flex gap-3 flex-wrap">
              {[1, 2, 3, 4, 5].map((rank) => (
                <button
                  key={rank}
                  type="button"
                  onClick={() => handleRankChange(rank)}
                  className={`w-12 h-12 rounded-lg font-bold transition-all ${
                    formData.sinta_ranks.includes(rank)
                      ? 'bg-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-105'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  S{rank}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Select one or more Sinta accreditation levels</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-gray-300">
              Journal Categories (Optional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.filter_area_codes.includes(category.id)
                      ? 'bg-secondary text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Leave empty to scrape all categories, or select specific ones to filter
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Max Pages per Rank</label>
              <input
                type="number"
                value={formData.max_pages}
                onChange={(e) => setFormData({ ...formData, max_pages: parseInt(e.target.value) })}
                className="input-field"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">Number of pages to scrape for each rank</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Collection Name</label>
              <input
                type="text"
                value={formData.collection_name}
                onChange={(e) => setFormData({ ...formData, collection_name: e.target.value })}
                className="input-field"
                placeholder="e.g., sinta_data_2024"
              />
              <p className="text-xs text-gray-500 mt-1">Name for the MongoDB collection</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="overwrite"
              checked={formData.overwrite}
              onChange={(e) => setFormData({ ...formData, overwrite: e.target.checked })}
              className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary"
            />
            <label htmlFor="overwrite" className="text-sm text-gray-300">
              Overwrite existing collection if it exists
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || formData.sinta_ranks.length === 0}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader className="animate-spin" /> : <Play size={20} />}
              {loading ? 'Starting Scraper...' : 'Start Scraping Job'}
            </button>
            {formData.sinta_ranks.length === 0 && (
              <p className="text-xs text-red-400 mt-2 text-center">Please select at least one Sinta rank</p>
            )}
          </div>

        </form>
      </Card>

      {response && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            response.type === 'success' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {response.message}
        </motion.div>
      )}
    </div>
  );
};

export default ScrapeSinta;
