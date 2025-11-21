import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Search, Loader, Database } from 'lucide-react';
import axios from 'axios';

const SearchGaruda = () => {
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState([]);
  const [formData, setFormData] = useState({
    query: '',
    source_collection: ''
  });
  const [response, setResponse] = useState(null);

  useEffect(() => {
    // Fetch available collections for the dropdown
    const fetchCollections = async () => {
      try {
        const res = await axios.get('http://localhost:8000/collections');
        // Filter out article collections - only show Sinta source collections
        const sintaCollections = (res.data.collections || []).filter(
          col => !col.toLowerCase().startsWith('articles_')
        );
        setCollections(sintaCollections);
        if (sintaCollections.length > 0) {
          setFormData(prev => ({ ...prev, source_collection: sintaCollections[0] }));
        }
      } catch (error) {
        console.error("Failed to fetch collections", error);
      }
    };
    fetchCollections();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    try {
      const res = await axios.post('http://localhost:8000/scrape/garuda', formData);
      setResponse({ type: 'success', message: res.data.message });
    } catch (error) {
      setResponse({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Search Garuda Articles</h1>
        <p className="text-gray-400">Search for articles in Garuda using data from your Sinta collections.</p>
      </motion.div>

      <Card className="border-t-4 border-t-secondary">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Search Query</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
              <input
                type="text"
                value={formData.query}
                onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                className="input-field !pl-12"
                placeholder="e.g., Artificial Intelligence"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Source Collection (Sinta Data)</label>
            <div className="relative">
              <Database className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={20} />
              <select
                value={formData.source_collection}
                onChange={(e) => setFormData({ ...formData, source_collection: e.target.value })}
                className="input-field !pl-12 appearance-none bg-black/20 cursor-pointer"
                required
              >
                <option value="" disabled>Select a collection</option>
                {collections.map(col => (
                  <option key={col} value={col} className="bg-gray-900">{col}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-2">Select the collection containing the Sinta journals you want to search within.</p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-lg bg-gradient-to-r from-secondary to-pink-600"
            >
              {loading ? <Loader className="animate-spin" /> : <Search size={20} />}
              {loading ? 'Searching...' : 'Start Search'}
            </button>
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

export default SearchGaruda;
