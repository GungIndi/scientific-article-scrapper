import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Search, Download, LayoutDashboard } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import ScrapeSinta from './pages/ScrapeSinta';
import SearchGaruda from './pages/SearchGaruda';
import Collections from './pages/Collections';

const SidebarItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className="block mb-2">
      <div className={`flex items-center p-3 rounded-lg transition-all duration-300 ${isActive ? 'bg-primary/20 border border-primary/50 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
        <Icon size={20} className={isActive ? 'text-indigo-400' : ''} />
        <span className="ml-3 font-medium">{label}</span>
        {isActive && <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-8 bg-indigo-500 rounded-r-full" />}
      </div>
    </Link>
  );
};

function App() {
  return (
    <Router>
      <div className="flex min-h-screen text-white">
        {/* Sidebar */}
        <nav className="w-64 glass-panel fixed h-full z-10 flex flex-col p-6">
          <div className="mb-10 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg">J</div>
            <h1 className="text-xl font-bold tracking-tight">Journal<span className="text-indigo-400">Scraper</span></h1>
          </div>

          <div className="flex-1">
            <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
            <SidebarItem to="/scrape-sinta" icon={Download} label="Scrape Sinta Journals" />
            <SidebarItem to="/search-garuda" icon={Search} label="Search Sinta Articles" />
            <SidebarItem to="/collections" icon={Database} label="Collections" />
          </div>

          <div className="text-xs text-gray-500 mt-auto pt-6 border-t border-white/10">
            v1.0.0 • Connected to API
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px]" />
          </div>

          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/scrape-sinta" element={<ScrapeSinta />} />
              <Route path="/search-garuda" element={<SearchGaruda />} />
              <Route path="/collections" element={<Collections />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}

export default App;
