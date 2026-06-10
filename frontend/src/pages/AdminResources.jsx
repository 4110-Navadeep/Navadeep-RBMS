import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ResourceCard from '../components/ResourceCard';
import { Plus, X, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';

const AdminResources = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  
  // Form Field States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [availability, setAvailability] = useState(true);

  // Success and Error Banners
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchResources = async () => {
    try {
      const response = await api.get('/resources');
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleOpenAddModal = () => {
    setEditingResource(null);
    setName('');
    setDescription('');
    setCapacity('');
    setImageUrl('');
    setAvailability(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (resource) => {
    setEditingResource(resource);
    setName(resource.name);
    setDescription(resource.description || '');
    setCapacity(resource.capacity.toString());
    setImageUrl(resource.image_url || '');
    setAvailability(resource.availability);
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name || !capacity) {
      setErrorMsg('Resource Name and Capacity are required fields.');
      return;
    }

    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      name,
      description,
      capacity: parseInt(capacity),
      image_url: imageUrl,
      availability
    };

    try {
      if (editingResource) {
        // Update Action
        const response = await api.put(`/resources/${editingResource.id}`, payload);
        setSuccessMsg(response.data.message || 'Resource updated successfully!');
      } else {
        // Add Action
        const response = await api.post('/resources', payload);
        setSuccessMsg(response.data.message || 'New resource added successfully!');
      }
      setShowModal(false);
      fetchResources();
    } catch (error) {
      console.error('Form submit error:', error);
      setErrorMsg(error.response?.data?.message || 'Error processing resource.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource? All associated bookings will be deleted.')) {
      return;
    }

    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await api.delete(`/resources/${id}`);
      setSuccessMsg(response.data.message || 'Resource deleted successfully.');
      fetchResources();
    } catch (error) {
      console.error('Delete error:', error);
      setErrorMsg(error.response?.data?.message || 'Error deleting resource.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <Navbar toggleSidebar={toggleSidebar} title="Manage Resources" />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto flex-1 flex flex-col">
          {/* Header toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Resources Inventory</h2>
              <p className="text-sm text-slate-400 mt-0.5">Add, modify, or retire halls, computer labs, and conference rooms</p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold rounded-lg shadow-md transition-colors"
            >
              <Plus size={16} />
              <span>Add Resource</span>
            </button>
          </div>

          {/* Messages banners */}
          {successMsg && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-center justify-between shadow-sm animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="text-green-600" size={20} />
                <span className="text-sm text-green-700 font-semibold">{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center justify-between shadow-sm animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center space-x-3">
                <AlertCircle className="text-red-600" size={20} />
                <span className="text-sm text-red-700 font-semibold">{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Cards listing */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 animate-pulse">
                  <div className="h-44 bg-slate-100 rounded-lg w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-8 bg-slate-100 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : resources.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 py-20 text-center shadow-sm flex-1 flex flex-col justify-center items-center">
              <Layers size={48} className="text-slate-350 mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No resources seeded</h3>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">There are no booking spaces configured in the database inventory.</p>
              <button 
                onClick={handleOpenAddModal}
                className="mt-4 px-4 py-2 bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold rounded-lg"
              >
                Create Resource
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {resources.map(resource => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isAdmin={true}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Resource Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleFormSubmit}>
              <div className="bg-navy-850 text-white px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-lg">
                  {editingResource ? 'Edit Resource Details' : 'Add New Resource'}
                </h3>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Resource Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Resource Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Premium Seminar Hall"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Capacity */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Max Capacity (Number of people)
                  </label>
                  <input
                    type="number"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g. 150"
                    min="1"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Image URL */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/images/hall.jpg"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details about size, presentation gadgets, audio equipment..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:bg-white transition-all resize-none"
                  ></textarea>
                </div>

                {/* Availability Checkbox */}
                <div className="flex items-center space-x-3 pt-2">
                  <input
                    type="checkbox"
                    id="availability"
                    checked={availability}
                    onChange={(e) => setAvailability(e.target.checked)}
                    className="w-4.5 h-4.5 text-navy-800 border-slate-300 rounded focus:ring-navy-600 cursor-pointer"
                  />
                  <label htmlFor="availability" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
                    Make available for public bookings
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
                >
                  {editingResource ? 'Update Resource' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResources;
