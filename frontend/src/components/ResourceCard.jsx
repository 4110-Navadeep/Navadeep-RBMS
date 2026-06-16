import React from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckCircle, XCircle, IndianRupee } from 'lucide-react';

const ResourceCard = ({ resource, isAdmin, onBook, onEdit, onDelete }) => {
  const { id, name, description, capacity, image_url, availability, price } = resource;

  const defaultImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800';

  const formatPrice = (p) => {
    if (!p || parseFloat(p) === 0) return null;
    return parseFloat(p).toLocaleString('en-IN');
  };

  const formattedPrice = formatPrice(price);

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 glow-card flex flex-col h-full">
      {/* Resource Image */}
      <div className="h-48 w-full relative overflow-hidden bg-slate-100">
        <img
          src={image_url || defaultImage}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
        />

        {/* Availability Badge */}
        <div className="absolute top-4 right-4">
          {availability ? (
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-sm">
              <CheckCircle size={12} className="text-green-600" />
              <span>Available</span>
            </span>
          ) : (
            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-sm">
              <XCircle size={12} className="text-red-600" />
              <span>Unavailable</span>
            </span>
          )}
        </div>

        {/* Price Badge */}
        {formattedPrice && (
          <div className="absolute bottom-4 left-4">
            <span className="bg-[#0f2942]/85 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-md backdrop-blur-sm">
              <IndianRupee size={11} />
              <span>{formattedPrice}</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 font-sans tracking-tight mb-1">
            {name}
          </h3>
          {formattedPrice && (
            <p className="text-sm font-semibold text-green-700 flex items-center space-x-0.5 mb-2">
              <IndianRupee size={13} />
              <span>{formattedPrice}</span>
              <span className="text-slate-400 font-normal text-xs ml-1">starting price</span>
            </p>
          )}
          <p className="text-sm text-slate-500 line-clamp-2 mb-4">
            {description || 'No description provided.'}
          </p>
        </div>

        <div>
          {/* Capacity */}
          <div className="flex items-center space-x-2 text-slate-600 mb-4">
            <Users size={16} className="text-slate-400" />
            <span className="text-sm font-medium">Capacity: <strong className="text-slate-800">{capacity}</strong> people</span>
          </div>

          {/* Action buttons */}
          {isAdmin ? (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => onEdit(resource)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(id)}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                Delete
              </button>
            </div>
          ) : (
            <div className="pt-2">
              {availability ? (
                <Link
                  to={`/resources/${id}`}
                  className="block w-full text-center py-2.5 bg-[#0f2942] hover:bg-[#1a3f63] text-white text-sm font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                >
                  View & Book
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full py-2.5 bg-slate-100 text-slate-400 text-sm font-semibold rounded-lg cursor-not-allowed"
                >
                  Not Available
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
