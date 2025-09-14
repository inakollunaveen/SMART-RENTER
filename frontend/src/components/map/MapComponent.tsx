import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  price: number;
  coordinates?: { lat: number; lng: number };
}

interface MapComponentProps {
  center: { lat: number; lng: number };
  listings: Listing[];
  height?: string;
}

const MapComponent = ({ center, listings, height = "400px" }: MapComponentProps) => {
  // This is a placeholder component
  // In a real application, you would integrate with Google Maps, Mapbox, or Leaflet
  
  return (
    <div 
      className="relative bg-muted/30 rounded-lg overflow-hidden border border-border"
      style={{ height }}
    >
      {/* Map Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-purple-500/5">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Interactive Map</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Map integration with Google Maps/Leaflet will be implemented here
          </p>
        </div>
      </div>
      
      {/* Mock Map Pins */}
      <div className="absolute inset-0">
        {listings.map((listing, index) => (
          <div
            key={listing.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              left: `${20 + index * 15}%`,
              top: `${30 + index * 10}%`
            }}
          >
            <div className="relative group">
              <div className="w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              
              {/* Tooltip */}
              <Card className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-48">
                <CardContent className="p-3">
                  <h4 className="font-semibold text-sm">{listing.title}</h4>
                  <p className="text-primary font-bold">₹{listing.price.toLocaleString()}/month</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
      
      {/* Map Controls Placeholder */}
      <div className="absolute top-4 right-4 space-y-2">
        <div className="w-8 h-8 bg-background border border-border rounded shadow-sm flex items-center justify-center">
          <span className="text-xs font-bold">+</span>
        </div>
        <div className="w-8 h-8 bg-background border border-border rounded shadow-sm flex items-center justify-center">
          <span className="text-xs font-bold">-</span>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;