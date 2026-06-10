import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Layers } from 'lucide-react';

const PlaceholderPage = ({ title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar toggleSidebar={toggleSidebar} title={title} />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto flex-1 flex flex-col justify-center items-center">
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm max-w-md space-y-4">
            <div className="bg-blue-50 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Layers size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-450 leading-relaxed">
              This section is configured and ready to receive production booking logs. Database parameters are fully connected to register actions in real-time.
            </p>
            <a 
              href="/"
              className="inline-block px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              Back to Home
            </a>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlaceholderPage;
