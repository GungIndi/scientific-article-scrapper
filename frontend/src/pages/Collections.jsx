import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import PasswordModal from '../components/ui/PasswordModal';
import CollectionDetailsModal from '../components/ui/CollectionDetailsModal';
import { Database, Download, RefreshCw, FileJson, BookOpen, FileText, Trash2 } from 'lucide-react';
import axios from 'axios';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, collection: null });
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, collection: null });

  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:8000/collections');
      setCollections(res.data.collections || []);
    } catch (error) {
      console.error("Failed to fetch collections", error);
      setError("Failed to load collections. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleExport = async (collectionName) => {
    try {
      const response = await axios.post('http://localhost:8000/export', 
        { collection_name: collectionName },
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${collectionName}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export collection");
    }
  };

  // Split collections into Sinta Journals and Sinta Articles
  // Articles collections start with "articles_"
  const sintaJournals = collections.filter(col => !col.toLowerCase().startsWith('articles_'));
  const sintaArticles = collections.filter(col => col.toLowerCase().startsWith('articles_'));

  const handleDeleteConfirm = async (password) => {
    const col = deleteModal.collection;
    
    try {
      await axios.delete(`http://localhost:8000/collections/${col}`, {
        data: {
          collection_name: col,
          password: password
        }
      });
      // Close modal and refresh
      setDeleteModal({ isOpen: false, collection: null });
      fetchCollections();
      alert('Collection deleted successfully!');
    } catch (error) {
      console.error("Delete failed", error);
      if (error.response?.status === 403) {
        alert('Incorrect password. Deletion denied.');
      } else {
        alert(`Failed to delete collection: ${error.response?.data?.detail || error.message}`);
      }
      setDeleteModal({ isOpen: false, collection: null });
    }
  };

  const CollectionCard = ({ col, index, icon: Icon, iconColor }) => {
    // Format collection name: replace underscores with spaces and apply title case
    const toTitleCase = (str) => {
      return str.replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };
    
    const displayName = toTitleCase(col);
    
    const handleDelete = () => {
      setDeleteModal({ isOpen: true, collection: col });
    };
    
    return (
      <Card key={col} delay={index * 0.1} className="group hover:border-primary/50 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${iconColor} group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300`}>
            <Icon size={24} />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleExport(col)}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Export as JSON"
            >
              <Download size={20} />
            </button>
            <button 
              onClick={handleDelete}
              className="p-2 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
              title="Delete collection"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2 truncate" title={displayName}>{displayName}</h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FileJson size={14} />
          <span>JSON Document Store</span>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
          <span className="text-xs text-gray-500">Ready for export</span>
          <button
            onClick={() => setDetailsModal({ isOpen: true, collection: col })}
            className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
          >
            View Details &rarr;
          </button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Data Collections</h1>
          <p className="text-gray-400">Manage and export your scraped datasets.</p>
        </motion.div>
        <button 
          onClick={fetchCollections}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors disabled:opacity-50"
          title="Refresh List"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      {/* Sinta Journals Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="text-indigo-400" size={24} />
          <h2 className="text-2xl font-bold">Sinta Journals</h2>
          <span className="text-sm text-gray-500">({sintaJournals.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sintaJournals.map((col, index) => (
            <CollectionCard 
              key={col} 
              col={col} 
              index={index} 
              icon={Database}
              iconColor="bg-indigo-500/20 text-indigo-400"
            />
          ))}
          {sintaJournals.length === 0 && !loading && !error && (
            <div className="col-span-full py-10 text-center text-gray-500">
              <Database size={48} className="mx-auto mb-4 opacity-20" />
              <p>No Sinta journal collections found. Start scraping to generate data.</p>
            </div>
          )}
        </div>
      </div>

      {/* Sinta Articles Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <FileText className="text-purple-400" size={24} />
          <h2 className="text-2xl font-bold">Sinta Articles</h2>
          <span className="text-sm text-gray-500">({sintaArticles.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sintaArticles.map((col, index) => (
            <CollectionCard 
              key={col} 
              col={col} 
              index={index} 
              icon={FileText}
              iconColor="bg-purple-500/20 text-purple-400"
            />
          ))}
          {sintaArticles.length === 0 && !loading && !error && (
            <div className="col-span-full py-10 text-center text-gray-500">
              <FileText size={48} className="mx-auto mb-4 opacity-20" />
              <p>No article collections found. Use Garuda Search to find articles.</p>
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      <PasswordModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, collection: null })}
        onConfirm={handleDeleteConfirm}
        collectionName={deleteModal.collection ? deleteModal.collection.replace(/_/g, ' ') : ''}
      />

      {/* Collection Details Modal */}
      <CollectionDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, collection: null })}
        collectionName={detailsModal.collection}
      />
    </div>
  );
};

export default Collections;
