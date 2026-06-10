import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ResourceCard from '../components/ResourceCard';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';

const ResourceListing = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [availability, setAvailability] = useState(searchParams.get('availability') || 'all');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (availability !== 'all') params.availability = availability;

      const response = await api.get('/resources', { params });
      setResources(response.data);
    } catch (error) {
      console.error('Error retrieving resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [searchParams]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const newParams = {};
    if (search) newParams.search = search;
    if (availability !== 'all') newParams.availability = availability;
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setAvailability('all');
    setSearchParams({});
  };

  const handleBookClick = (resource) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/resources/${resource.id}`);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar toggleSidebar={toggleSidebar} title="Browse Resources" />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto flex-1 flex flex-col">
          {/* Search and Filters Header */}
          <form 
            onSubmit={handleFilterSubmit} 
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between"
          >
            {/* Search Input */}
            <div className="relative w-full lg:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search resources by name or type..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition-all"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <SlidersHorizontal size={16} className="text-slate-400" />
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full sm:w-40 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="all">All Availability</option>
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm focus:outline-none"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full sm:w-auto p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-lg transition-colors"
                  title="Reset Filters"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
          </form>

          {/* Resources Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 animate-pulse">
                  <div className="h-44 bg-slate-100 rounded-lg w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-8 bg-slate-100 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 py-16 text-center shadow-sm">
              <SlidersHorizontal size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No resources found</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                We couldn't find any resources matching your search terms or filters. Try adjusting your query.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-250 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isAdmin={false}
                  onBook={handleBookClick}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ResourceListing;
