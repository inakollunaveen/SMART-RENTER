import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ContactModal from '@/components/modals/ContactModal';
import ImageCarousel from '@/components/property/ImageCarousel';
import MapComponent from '@/components/map/MapComponent';
import ReviewsSection from '@/components/reviews/ReviewsSection';
import { Heart, MapPin, Users, Home, Wifi, Car, Shield, Phone, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock listing data - replace with API call
const mockListing = {
  id: "1",
  title: "Modern 2BHK Apartment in Koramangala",
  description: "Beautiful 2BHK apartment located in the heart of Koramangala. Fully furnished with modern amenities, perfect for working professionals or small families. Close to metro station, shopping centers, and restaurants.",
  location: "Koramangala, Bangalore",
  address: "123 Main Street, Koramangala 4th Block, Bangalore - 560034",
  price: 25000,
  deposit: 50000,
  type: "2BHK",
  rooms: 2,
  bathrooms: 2,
  area: 1200,
  occupancy: "Working Professionals",
  availableFrom: "2024-01-15",
  furnishing: "Fully Furnished",
  images: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1556020685-ae41abfc9365?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  ],
  amenities: [
    { name: "WiFi", icon: Wifi },
    { name: "Parking", icon: Car },
    { name: "Security", icon: Shield },
    { name: "Furnished", icon: Home },
  ],
  owner: {
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    email: "rajesh@email.com",
    verified: true
  },
  coordinates: { lat: 12.9352, lng: 77.6245 }
};

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? "Property removed from your saved list" : "Property saved to your favorites",
    });
  };

  const handleContactOwner = () => {
    setShowContactModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Search
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteToggle}
                className={isFavorite ? "text-red-500" : "text-muted-foreground"}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {mockListing.title}
                </h1>
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{mockListing.location}</span>
                </div>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="text-3xl font-bold text-primary">
                    ₹{mockListing.price.toLocaleString()}/month
                  </div>
                  <Badge variant="secondary">{mockListing.type}</Badge>
                  <Badge variant="outline">{mockListing.occupancy}</Badge>
                </div>
              </div>
              
              <div className="flex justify-end items-start">
                <Button 
                  onClick={handleContactOwner}
                  className="bg-gradient-primary text-white px-8 py-3"
                  size="lg"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Owner
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Carousel */}
              <ImageCarousel images={mockListing.images} />
              
              {/* Property Details */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Property Details</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{mockListing.rooms}</div>
                      <div className="text-sm text-muted-foreground">Bedrooms</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{mockListing.bathrooms}</div>
                      <div className="text-sm text-muted-foreground">Bathrooms</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{mockListing.area}</div>
                      <div className="text-sm text-muted-foreground">Sq Ft</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">₹{mockListing.deposit.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Deposit</div>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {mockListing.description}
                    </p>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Property Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Property Type:</span>
                        <span className="font-medium">{mockListing.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Furnishing:</span>
                        <span className="font-medium">{mockListing.furnishing}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Occupancy:</span>
                        <span className="font-medium">{mockListing.occupancy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available From:</span>
                        <span className="font-medium">{new Date(mockListing.availableFrom).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Amenities */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mockListing.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                        <amenity.icon className="w-5 h-5 text-primary" />
                        <span className="font-medium">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Reviews */}
              <ReviewsSection />
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Map */}
              <Card>
                <CardContent className="p-0">
                  <MapComponent 
                    center={mockListing.coordinates}
                    listings={[mockListing]}
                    height="300px"
                  />
                </CardContent>
              </Card>
              
              {/* Owner Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Property Owner</h3>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{mockListing.owner.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {mockListing.owner.verified ? "Verified Owner" : "Owner"}
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleContactOwner}
                    className="w-full bg-gradient-primary"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Owner
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <ContactModal 
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        owner={mockListing.owner}
      />
    </div>
  );
};

export default ListingDetail;