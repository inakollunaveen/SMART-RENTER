import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Home, IndianRupee } from "lucide-react";

const HeroSection = () => {
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (priceRange) params.set("price", priceRange);
    if (propertyType) params.set("type", propertyType);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/tharunu.jpg')" }}
      />

      <div className="relative z-10 w-full max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Hero Content */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Find Your{" "}
            <span className="text-white font-semibold">Dream Home</span>
            <br />
            Without Brokers
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto mb-8 drop-shadow-lg">
            Connect directly with property owners and save on broker fees. 
            Discover thousands of verified rental properties across the city.
          </p>
        </div>

        {/* Search Bar in Middle */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-lg max-w-4xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Location */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
              <Input
                placeholder="Enter location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 bg-white/20 border-white/40 text-white placeholder-white h-12 placeholder-opacity-100"
              />
            </div>

            {/* Price Range */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="bg-white/20 border-white/40 text-white h-12">
                <div className="flex items-center">
                  <IndianRupee className="w-4 h-4 mr-2 text-white" />
                  <SelectValue placeholder="Price range" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-gray-900 text-white">
                <SelectItem value="5000-15000">₹5,000 - ₹15,000</SelectItem>
                <SelectItem value="15000-25000">₹15,000 - ₹25,000</SelectItem>
                <SelectItem value="25000-35000">₹25,000 - ₹35,000</SelectItem>
                <SelectItem value="35000-50000">₹35,000 - ₹50,000</SelectItem>
                <SelectItem value="50000+">₹50,000+</SelectItem>
              </SelectContent>
            </Select>

            {/* Property Type */}
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="bg-white/20 border-white/40 text-white h-12">
                <div className="flex items-center">
                  <Home className="w-4 h-4 mr-2 text-white" />
                  <SelectValue placeholder="Property type" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-gray-900 text-white">
                <SelectItem value="1bhk">1 BHK</SelectItem>
                <SelectItem value="2bhk">2 BHK</SelectItem>
                <SelectItem value="3bhk">3 BHK</SelectItem>
                <SelectItem value="4bhk">4 BHK</SelectItem>
                <SelectItem value="villa">VILLA</SelectItem>
              </SelectContent>
            </Select>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="bg-purple-600 hover:bg-purple-700 h-12 font-semibold text-white"
              size="lg"
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Quick Stats at Bottom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 text-white">
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">10,000+</div>
            <div className="opacity-90">Verified Properties</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">5,000+</div>
            <div className="opacity-90">Happy Tenants</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">0%</div>
            <div className="opacity-90">Broker Fees</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
