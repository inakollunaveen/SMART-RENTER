// src/components/property/PropertyCard.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

interface Property {
  _id: string;
  title: string;
  address: string;
  price: number;
  photos?: string[];
  amenities?: string[];
  owner?: {
    name?: string;
  };yy
  ownerContactNumber?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  furnished?: boolean;
  petsAllowed?: boolean;
  parking?: boolean;
}

interface Props {
  property: Property;
}

const PropertyCard: React.FC<Props> = ({ property }) => {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const photos = property.photos || [];
  const backendUrl = (import.meta.env.VITE_API_URL || "https://smartrenter-l0z3.onrender.com/api").replace(/\/$/, "");

  const nextPhoto = () => setCurrentPhoto((prev) => (prev + 1) % photos.length);
  const prevPhoto = () =>
    setCurrentPhoto((prev) => (prev - 1 + photos.length) % photos.length);

  const getPhotoUrl = (photo: string) => {
    if (!photo) return "/default-image.png";
    if (photo.startsWith("/")) {
      return `${backendUrl}${photo}`;
    } else {
      return `${backendUrl}/${photo}`;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Image Carousel */}
      <div className="relative h-60 w-full">
        {photos.length > 0 ? (
          <>
            <img
              src={getPhotoUrl(photos[currentPhoto])}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                >
                  ◀
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                >
                  ▶
                </button>
              </>
            )}
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i === currentPhoto ? "bg-primary" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <img
            src="/default-image.png"
            alt="No image"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Property Info */}
      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-800 line-clamp-1">
          {property.title}
        </h2>
        <p className="text-gray-500 text-sm mt-1 line-clamp-1">
          {property.address}
        </p>

        {/* Price (Indian Rupee) */}
        <p className="mt-3 text-lg font-bold bg-gradient-to-r from-green-500 to-blue-500 text-transparent bg-clip-text">
          ₹{property.price.toLocaleString("en-IN")}
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mt-3">
          {property.amenities?.slice(0, 3).map((amenity, i) => (
            <span
              key={i}
              className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
            >
              {amenity}
            </span>
          ))}
          {property.amenities && property.amenities.length > 3 && (
            <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
              +{property.amenities.length - 3} more
            </span>
          )}
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-3 mt-4 text-gray-600 text-sm">
          <span>🛏 {property.bedrooms || 0}</span>
          <span>🛁 {property.bathrooms || 0}</span>
          <span>📐 {property.area || 0} sqft</span>
          <span>{property.furnished ? "Furnished" : "Unfurnished"}</span>
          <span>{property.petsAllowed ? "Pets Allowed" : "No Pets"}</span>
          <span>{property.parking ? "Parking" : "No Parking"}</span>
        </div>

        {/* Owner Info */}
        <div className="mt-5 border-t pt-3 flex flex-col gap-2">
          <p className="text-gray-500 text-sm">
            👤 {property.owner?.name || "Unknown"}
          </p>

          {property.ownerContactNumber && (
            <a
              href={`tel:${property.ownerContactNumber}`}
              className="w-full text-center bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              📞 Contact Owner
            </a>
          )}

          <Link
            to={`/properties/${property._id}`}
            className="w-full text-center border border-primary text-primary py-2 rounded-lg font-semibold hover:bg-primary hover:text-white transition"
          >
            🔍 View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;

