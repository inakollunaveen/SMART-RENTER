// src/pages/PropertyDetails.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPropertyById } from "@/utils/api";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const data = await getPropertyById(id!);
        setProperty(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading)
    return <p className="text-center py-12 text-gray-600">Loading...</p>;
  if (!property)
    return <p className="text-center py-12 text-gray-600">Property not found</p>;

  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const photos = property.photos || [];
  const photosCount = photos.length;

  const nextPhoto = () => setCurrentPhoto((prev) => (prev + 1) % photosCount);
  const prevPhoto = () => setCurrentPhoto((prev) => (prev - 1 + photosCount) % photosCount);

  // Common section style
  const sectionClass = "bg-green-50 border-l-4 border-green-600 shadow-md rounded-xl p-6 mb-8";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Photo Carousel */}
      <div className="max-w-6xl mx-auto mt-6">
        <div className="relative w-full h-[450px] rounded-2xl overflow-hidden shadow-lg">
          {photosCount > 0 ? (
            <>
              <img
                src={`${backendUrl}${photos[currentPhoto]}`}
                alt={`${property.title} - ${currentPhoto + 1}`}
                className="w-full h-full object-cover transition-transform duration-500"
              />
              {photosCount > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                  >
                    ◀
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                  >
                    ▶
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {photos.map((_, i) => (
                      <span
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          i === currentPhoto ? "bg-green-600" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <img
              src="/default-image.png"
              alt="No image available"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        {/* Property Details */}
        <section className={sectionClass}>
          <h2 className="text-xl font-semibold text-green-900 mb-4">Property Details</h2>

          {/* Price Highlight */}
          <p className="text-2xl font-extrabold text-white bg-green-600 inline-block px-4 py-2 rounded mb-4">
            ₹{property.price.toLocaleString("en-IN")}
          </p>

          <ul className="space-y-1 text-gray-700">
            <li><span className="font-medium">Owner:</span> {property.owner?.name || "Not available"}</li>
            <li><span className="font-medium">Address:</span> {property.address || "Not available"}</li>
            <li><span className="font-medium">Bedrooms:</span> {property.bedrooms}</li>
            <li><span className="font-medium">Bathrooms:</span> {property.bathrooms}</li>
            <li><span className="font-medium">Area:</span> {property.area} sqft</li>
            <li><span className="font-medium">Furnished:</span> {property.furnished ? "Yes" : "No"}</li>
            <li><span className="font-medium">Pets Allowed:</span> {property.petsAllowed ? "Yes" : "No"}</li>
            <li><span className="font-medium">Parking:</span> {property.parking ? "Yes" : "No"}</li>
          </ul>
        </section>

        {/* Description */}
        {property.description && (
          <section className={sectionClass}>
            <h2 className="text-xl font-semibold text-green-900 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </section>
        )}

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <section className={sectionClass}>
            <h2 className="text-xl font-semibold text-green-900 mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium shadow-sm"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Owner Info */}
        <section className={sectionClass}>
          <h2 className="text-xl font-semibold text-green-900 mb-4">Owner Information</h2>
          <p className="text-gray-700 mb-2">
            <span className="font-medium">Name:</span> {property.owner?.name || "Not available"}
          </p>
          {property.ownerContactNumber && (
            <a
              href={`tel:${property.ownerContactNumber}`}
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              📞 Contact Owner: {property.ownerContactNumber}
            </a>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyDetails;
