import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, ChevronDown, ChevronRight } from 'lucide-react';
import axios from 'axios';

const CollectionDetailsModal = ({ isOpen, onClose, collectionName }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());

  useEffect(() => {
    if (isOpen && collectionName) {
      fetchCollectionData();
    }
  }, [isOpen, collectionName]);

  const fetchCollectionData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/export', 
        { collection_name: collectionName },
        { responseType: 'json' }
      );
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch collection data", err);
      setError("Failed to load collection data");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (index) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const displayName = collectionName ? collectionName.replace(/_/g, ' ') : '';
  
  // Check if this is a Sinta journal collection (not articles)
  const isSintaJournal = collectionName && !collectionName.toLowerCase().startsWith('articles_');

  // Render Sinta journal item with formatted fields
  const renderSintaJournalItem = (item, index) => {
    return (
      <div key={index} className="rounded-lg bg-white/5 border border-white/10 overflow-hidden">
        <button
          onClick={() => toggleExpand(index)}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
        >
          <div className="flex items-center gap-3 flex-1">
            {expandedItems.has(index) ? (
              <ChevronDown size={20} className="text-gray-400" />
            ) : (
              <ChevronRight size={20} className="text-gray-400" />
            )}
            <div className="flex-1">
              <div className="font-medium text-white">{item.name || `Journal ${index + 1}`}</div>
            </div>
          </div>
          {item.sinta && (
            <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary font-medium">
              Sinta {item.sinta}
            </span>
          )}
        </button>
        
        {expandedItems.has(index) && (
          <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-3">
            {item.sinta && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Sinta Level</div>
                <div className="text-sm text-gray-300">Sinta {item.sinta}</div>
              </div>
            )}
            
            {item.sinta_link && item.sinta_link !== "no sinta link" && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Sinta Link</div>
                <a 
                  href={item.sinta_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                >
                  {item.sinta_link}
                </a>
              </div>
            )}
            
            {item.garuda_link && item.garuda_link !== "no garuda link" && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Garuda Link</div>
                <a 
                  href={item.garuda_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                >
                  {item.garuda_link}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render Sinta article item (Garuda search results) with formatted fields
  const renderSintaArticleItem = (item, index) => {
    return (
      <div key={index} className="rounded-lg bg-white/5 border border-white/10 overflow-hidden">
        <button
          onClick={() => toggleExpand(index)}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
        >
          <div className="flex items-center gap-3 flex-1">
            {expandedItems.has(index) ? (
              <ChevronDown size={20} className="text-gray-400" />
            ) : (
              <ChevronRight size={20} className="text-gray-400" />
            )}
            <div className="flex-1">
              <div className="font-medium text-white">{item.journal_name || `Journal ${index + 1}`}</div>
            </div>
          </div>
          {item.results_count !== undefined && (
            <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400 font-medium">
              {item.results_count} articles
            </span>
          )}
          {item.sinta_level !== undefined && (
            <span className="text-xs px-2 py-1 ml-2 rounded bg-purple-500/20 text-purple-400 font-medium">
              Sinta {item.sinta_level}
            </span>
          )}
        </button>
        
        {expandedItems.has(index) && (
          <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-3">                        
            {item.garuda_link && item.garuda_link !== "no garuda link" && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Journal Garuda Link</div>
                <a 
                  href={item.garuda_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                >
                  {item.garuda_link}
                </a>
              </div>
            )}
            
            {item.results && item.results.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Article List</div>
                <div className="space-y-2 bg-black/20 p-3 rounded-lg max-h-64 overflow-y-auto">
                  {item.results.map((article, idx) => (
                    <div key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-gray-500 font-mono text-xs mt-0.5">{idx + 1}.</span>
                      <div className="flex-1">
                        <div>{article.title || 'No Title'}</div>
                        {article.download_link && (
                          <a
                            href={article.download_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-secondary hover:underline"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] flex flex-col relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-10"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Database size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{displayName}</h2>
                  <p className="text-sm text-gray-400">
                    {data ? `${data.length} ${isSintaJournal ? 'journal' : 'document'}${data.length !== 1 ? 's' : ''}` : 'Loading...'}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {loading && (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                    {error}
                  </div>
                )}

                {data && !loading && (
                  <div className="space-y-3">
                    {isSintaJournal ? (
                      data.map((item, index) => renderSintaJournalItem(item, index))
                    ) : (
                      data.map((item, index) => renderSintaArticleItem(item, index))
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CollectionDetailsModal;
