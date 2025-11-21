import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Activity, Database, Server, Clock } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <Card delay={delay} className="flex items-center gap-4">
    <div className={`p-3 rounded-lg bg-${color}-500/20 text-${color}-400`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  </Card>
);

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold"
        >
          Dashboard
        </motion.h1>
        <p className="text-gray-400">Overview of your scraping activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Database} label="Total Collections" value="12" color="indigo" delay={0.1} />
        <StatCard icon={Activity} label="Articles Scraped" value="1,240" color="purple" delay={0.2} />
        <StatCard icon={Server} label="API Status" value="Online" color="green" delay={0.3} />
        <StatCard icon={Clock} label="Last Scrape" value="2h ago" color="blue" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card delay={0.5} className="min-h-[300px]">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-gray-300">Scraped Sinta Rank {i} successfully</span>
                <span className="ml-auto text-xs text-gray-500">10:0{i} AM</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card delay={0.6} className="min-h-[300px]">
          <h3 className="text-xl font-semibold mb-4">System Status</h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center">
               <span className="text-gray-400">Sinta Connection</span>
               <span className="text-green-400 text-sm bg-green-400/10 px-2 py-1 rounded">Operational</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-gray-400">Garuda Connection</span>
               <span className="text-green-400 text-sm bg-green-400/10 px-2 py-1 rounded">Operational</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-gray-400">Database Storage</span>
               <span className="text-indigo-400 text-sm bg-indigo-400/10 px-2 py-1 rounded">45% Used</span>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
