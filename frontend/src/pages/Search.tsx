// src/pages/Search.tsx
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { searchProperties } from "@/utils/api";

interface Filters {
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  propertyType?: string;
  bedrooms?: string;
  bathrooms?: string;
  furnished?: boolean;
  petsAllowed?: boolean;
  parking?: boolean;
  amenities?: string;
}

const Search = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});

  // Fetch properties whenever filters change
  useEffect(() => {
    const handler = setTimeout(async () => {
      try {
        setLoading(true);
        const result = await searchProperties(filters);
        console.log("Search properties result:", result);
        const fixedProperties = result.map((property: any) => {
          if (property.photos && Array.isArray(property.photos)) {
            property.photos = property.photos.map((photo: string) => {
              if (photo.startsWith("http://") || photo.startsWith("https://")) {
                return photo;
              }
              if (photo.startsWith("/")) {
                return `${process.env.REACT_APP_API_URL || "https://smartrenter1.onrender.com"}${photo}`;
              }
              return photo;
            });
          }
          return property;
        });
        setProperties(fixedProperties);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [filters]);

  const handleCheckbox = (field: keyof Filters) => {
    setFilters({ ...filters, [field]: !filters[field] });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Search Results</h1>
              <p className="text-muted-foreground">Found {properties.length} properties</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex gap-8">
            {/* Filter Sidebar */}
            <div className={`${showFilters ? "block" : "hidden"} lg:block w-80 flex-shrink-0 border p-4 rounded`}>
              <h3 className="font-semibold mb-2">Filters</h3>

              <input
                placeholder="Location"
                className="border rounded p-1 w-full mb-2"
                value={filters.location || ""}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
              <input
                placeholder="Min Price (₹)"
                className="border rounded p-1 w-full mb-2"
                type="number"
                value={filters.minPrice || ""}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
              <input
                placeholder="Max Price (₹)"
                className="border rounded p-1 w-full mb-2"
                type="number"
                value={filters.maxPrice || ""}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
              <input
                placeholder="Property Type (1BHK,2BHK,villa, etc.)"
                className="border rounded p-1 w-full mb-2"
                value={filters.propertyType || ""}
                onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
              />
              <input
                placeholder="Bedrooms"
                className="border rounded p-1 w-full mb-2"
                type="number"
                value={filters.bedrooms || ""}
                onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
              />
              <input
                placeholder="Bathrooms"
                className="border rounded p-1 w-full mb-2"
                type="number"
                value={filters.bathrooms || ""}
                onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
              />

              <div className="flex flex-col mb-2">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={filters.furnished || false} onChange={() => handleCheckbox("furnished")} />
                  Furnished
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={filters.petsAllowed || false} onChange={() => handleCheckbox("petsAllowed")} />
                  Pets Allowed
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={filters.parking || false} onChange={() => handleCheckbox("parking")} />
                  Parking
                </label>
              </div>

              <input
                placeholder="Amenities (comma separated)"
                className="border rounded p-1 w-full mb-2"
                value={filters.amenities || ""}
                onChange={(e) => setFilters({ ...filters, amenities: e.target.value })}
              />
            </div>

            {/* Property Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading properties...</p>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No properties found matching your criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property._id} property={property} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// ✅ Export default added
export default Search;
