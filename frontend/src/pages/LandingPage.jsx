import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  Search, 
  Layers, 
  CalendarCheck2, 
  ShieldCheck, 
  SendIcon, 
  BookOpen 
} from 'lucide-react';
import ResourceCard from '../components/ResourceCard';

const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await api.get('/resources');
        // Get first 4 resources for "Popular Resources" section
        setResources(response.data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching landing page resources:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/resources?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleBookClick = (resource) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/resources/${resource.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Header Navigation */}
      <nav className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-16 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-navy-800 p-2 rounded-lg text-white font-bold flex items-center justify-center">
            <BookOpen size={22} />
          </div>
          <span className="text-xl font-bold tracking-wider text-navy-800">RBMS</span>
          <span className="hidden sm:inline-block text-slate-400 border-l border-slate-200 pl-3 text-sm">Resource Booking Management System</span>
        </div>

        <div className="flex items-center space-x-8">
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link to="/" className="text-navy-800 font-semibold">Home</Link>
            <Link to="/resources" className="hover:text-navy-800 transition-colors">Resources</Link>
            <a href="#about" className="hover:text-navy-800 transition-colors">About Us</a>
            <a href="#contact" className="hover:text-navy-800 transition-colors">Contact</a>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <Link
                to={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}
                className="px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 border border-slate-300 hover:border-navy-800 text-slate-700 hover:text-navy-800 text-sm font-semibold rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="bg-gradient-to-br from-white via-slate-50 to-navy-50/20 py-16 md:py-24 px-6 md:px-16 border-b border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 relative z-10">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-navy-900 leading-tight font-sans tracking-tight">
                Book Resources <br/>
                <span className="text-blue-600">Effortlessly</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-xl">
                Book seminar halls, party halls, computer labs, and marriage halls easily and efficiently.
              </p>
            </div>

            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row max-w-lg bg-white rounded-xl shadow-lg border border-slate-200 p-2 gap-2">
              <div className="flex-1 flex items-center px-3">
                <Search size={20} className="text-slate-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search for resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-slate-700 placeholder-slate-400 focus:outline-none text-sm"
                />
              </div>
              <button 
                type="submit"
                className="px-6 py-3 bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-md flex items-center justify-center space-x-2"
              >
                <span>Search</span>
              </button>
            </form>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-slate-200/80 max-w-2xl">
              <div className="flex flex-col space-y-1">
                <Layers size={20} className="text-blue-500" />
                <span className="text-xs font-bold text-slate-800">Wide Range</span>
                <span className="text-[10px] text-slate-400">of Resources</span>
              </div>
              <div className="flex flex-col space-y-1">
                <CalendarCheck2 size={20} className="text-amber-500" />
                <span className="text-xs font-bold text-slate-800">Easy Booking</span>
                <span className="text-[10px] text-slate-400">Process</span>
              </div>
              <div className="flex flex-col space-y-1">
                <ShieldCheck size={20} className="text-green-500" />
                <span className="text-xs font-bold text-slate-800">Secure</span>
                <span className="text-[10px] text-slate-400">and Reliable</span>
              </div>
              <div className="flex flex-col space-y-1">
                <SendIcon size={20} className="text-red-500" />
                <span className="text-xs font-bold text-slate-800">Instant</span>
                <span className="text-[10px] text-slate-400">Notifications</span>
              </div>
            </div>
          </div>

          {/* Hero Right Banner Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-slate-200">
              <img 
                src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800" 
                alt="Seminar Hall Banner" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">Featured Space</p>
                <p className="text-lg font-bold">Premium Seminar Hall</p>
              </div>
            </div>
            
            {/* Visual background details */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 -z-10"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-navy-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 -z-10"></div>
          </div>
        </div>
      </section>

      {/* 3. Popular Resources */}
      <section className="py-16 px-6 md:px-16 max-w-7xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 font-sans tracking-tight">Popular Resources</h2>
            <p className="text-sm text-slate-400 mt-1">Explore our highly rated halls and training rooms</p>
          </div>
          <Link
            to="/resources"
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-sm font-semibold rounded-lg transition-colors"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 animate-pulse">
                <div className="h-44 bg-slate-200 rounded-lg w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-8 bg-slate-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500">No resources available at this time.</p>
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
      </section>

      {/* 4. Footer */}
      <footer id="contact" className="bg-navy-900 border-t border-navy-800 py-12 px-6 md:px-16 text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <BookOpen size={20} />
              <span className="text-lg font-bold font-sans">RBMS</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              We provide streamlined booking management software services for academic organizations, halls, seminar spaces, and labs.
            </p>
          </div>

          <div id="about" className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Useful Links</h4>
            <div className="flex flex-col space-y-2 text-xs">
              <Link to="/resources" className="hover:text-white transition-colors">Find a Space</Link>
              <Link to="/login" className="hover:text-white transition-colors">Access Portal</Link>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Support Details</h4>
            <p className="text-xs">
              For any help or reservation issues, contact us at: <br/>
              <strong className="text-slate-200">support@resourcebooking.com</strong>
            </p>
            <p className="text-xs text-slate-500">
              System Admin seeded at: admin@resourcebooking.com
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-navy-800 mt-10 pt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; 2026 Resource Booking Management System. All rights reserved.</p>
          <p>Navadeep &bull; 192424110.simats@saveetha.com</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
