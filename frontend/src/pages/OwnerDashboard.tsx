import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Home, Plus, Edit, Trash2, Eye, MapPin, IndianRupee, Upload, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { addProperty as apiAddProperty, getOwnerProperties as apiGetOwnerProperties, deleteProperty as apiDeleteProperty } from '@/utils/api';

/**
 * OwnerDashboard.tsx
 *
 * Full-featured owner dashboard page that:
 *  - fetches properties for the current owner
 *  - displays stats (total, available, rented, total value)
 *  - shows a table of properties with actions
 *  - contains a full Add Listing form with photo upload + preview
 *
 * Defensive programming: ensures listings is always an array, and all uses
 * of .filter/.reduce/.map are guarded to avoid runtime errors.
 *
 * Replace the inline adapter functions (normalizeGetOwnerPropertiesResponse,
 * normalizeAddPropertyResponse) with your project's API conventions if needed.
 */

/* ----------------------------- Types & Helpers ---------------------------- */

type Nullable<T> = T | null | undefined;

interface Owner {
  _id: string;
  name: string;
  email: string;
}

interface Property {
  _id: string;
  owner: Owner | string;
  title: string;
  description?: string;
  address: string;
  price: number;
  photos?: string[];
  available: boolean;
  location?: {
    lat: number;
    lng: number;
  };
  amenities?: string[];
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  furnished?: boolean;
  petsAllowed?: boolean;
  parking?: boolean;
  ownerContactNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Normalizes whatever the backend returns for get-owner-properties into an array.
 * Expected backend shapes handled:
 *  - [{...}, {...}]
 *  - { properties: [{...}, ...] }
 *  - { data: [{...}, ...] }
 *  - null / undefined -> []
 */
function normalizeGetOwnerPropertiesResponse(raw: unknown): Property[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw as Property[];
  }
  // Try common envelope shapes
  // @ts-ignore
  if (raw.properties && Array.isArray(raw.properties)) return raw.properties;
  // @ts-ignore
  if (raw.data && Array.isArray(raw.data)) return raw.data;
  // If it's an object with numeric keys, try Object.values
  if (typeof raw === "object") {
    try {
      const values = Object.values(raw as Record<string, any>);
      // look for an array inside
      for (const v of values) {
        if (Array.isArray(v)) return v as Property[];
      }
    } catch {
      // noop
    }
  }
  return [];
}

/**
 * Normalize addProperty response into { property }
 * Accepts:
 * - { property: {...} }
 * - { data: {...} }
 * - {...} (property directly)
 */
function normalizeAddPropertyResponse(raw: any): { property?: Property } {
  if (!raw) return {};
  if (raw.property) return { property: raw.property as Property };
  if (raw.data && raw.data.property) return { property: raw.data.property as Property };
  if (raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)) return { property: raw.data as Property };
  // If raw is an object that looks like a property, return it directly
  const candidate = raw as Property;
  if (candidate && candidate._id) return { property: candidate };
  return {};
}

/* ---------------------------- Local Mock Helpers --------------------------- */
/* You can remove these mock adapters and call your utils/api functions directly.
   The file imports apiAddProperty, apiGetOwnerProperties, apiDeleteProperty from '@/utils/api'
   and uses them below. These helpers wrap those calls to normalize responses. */

async function safeGetOwnerProperties(): Promise<Property[]> {
  const raw = await apiGetOwnerProperties();
  return normalizeGetOwnerPropertiesResponse(raw);
}

async function safeAddProperty(formData: FormData): Promise<{ property?: Property }> {
  const raw = await apiAddProperty(formData);
  return normalizeAddPropertyResponse(raw);
}

async function safeDeleteProperty(id: string): Promise<void> {
  await apiDeleteProperty(id);
}

/* --------------------------- Utility Components --------------------------- */

const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 12 }) => (
  <div className={`animate-spin rounded-full h-${size} w-${size} border-b-2 border-primary`} />
);

/* ------------------------------ Main Component ---------------------------- */

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [photoPreview, setPhotoPreview] = useState<string[]>([]);

  // full form state
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    address: '',
    price: '',
    type: '',
    rooms: '',
    bathrooms: '',
    area: '',
    occupancy: '',
    furnishing: '',
    amenities: '',
    ownerContactNumber: '',
    photos: [] as File[],
  });

  /* --------------------------- Authentication --------------------------- */
  useEffect(() => {
    if (user === null) {
      navigate('/auth');
      return;
    }
    if (user) setAuthChecked(true);
  }, [user, navigate]);

  /* --------------------------- Load Properties -------------------------- */
  useEffect(() => {
    if (!authChecked) return;

    let cancelled = false;
    const loadProperties = async () => {
      setLoading(true);
      try {
        const properties = await safeGetOwnerProperties();
        if (!cancelled) {
          setListings(Array.isArray(properties) ? properties : []);
        }
      } catch (err) {
        console.error("Failed to load properties:", err);
        toast({
          title: "Error Loading Properties",
          description: err instanceof Error ? err.message : "Failed to load your properties. Please check backend.",
          variant: "destructive",
        });
        if (!cancelled) setListings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProperties();

    return () => {
      cancelled = true;
    };
  }, [authChecked]);

  /* --------------------------- Derived Stats ---------------------------- */
  const totalListings = useMemo(() => (Array.isArray(listings) ? listings.length : 0), [listings]);
  const availableListings = useMemo(() => (Array.isArray(listings) ? listings.filter(l => !!l && !!l.available).length : 0), [listings]);
  const rentedListings = useMemo(() => (Array.isArray(listings) ? listings.filter(l => !!l && !l.available).length : 0), [listings]);
  const totalValue = useMemo(() => (Array.isArray(listings) ? listings.reduce((acc, l) => acc + (l?.price ?? 0), 0) : 0), [listings]);

  /* ----------------------------- Handlers -------------------------------- */

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newPhotos = [...newListing.photos, ...files].slice(0, 5);
    setNewListing(prev => ({ ...prev, photos: newPhotos }));

    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPhotoPreview(prev => [...prev, ...newPreviews].slice(0, 5));
  };

  const removePhoto = (index: number) => {
    setNewListing(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
    setPhotoPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Build FormData
      const formData = new FormData();
      formData.append('title', newListing.title);
      formData.append('description', newListing.description);
      formData.append('address', newListing.address);
      formData.append('price', newListing.price);
      formData.append('propertyType', newListing.type);
      formData.append('bedrooms', newListing.rooms || '1');
      formData.append('bathrooms', newListing.bathrooms || '1');
      formData.append('area', newListing.area || '');
      formData.append('furnished', (newListing.furnishing === 'furnished').toString());
      formData.append('petsAllowed', 'false');
      formData.append('parking', 'false');
      formData.append('amenities', newListing.amenities);
      formData.append('ownerContactNumber', newListing.ownerContactNumber);

      newListing.photos.forEach(p => formData.append('photos', p));

      // Call API (safeAddProperty normalizes response)
      const normalized = await safeAddProperty(formData);
      const newProp = normalized.property;
      if (!newProp) {
        // Try to be resilient: maybe the API returned the property directly
        toast({
          title: "Unexpected API Response",
          description: "Property added but server response did not include property details. Refresh the page to see update.",
          variant: "destructive",
        });
      } else {
        setListings(prev => [newProp, ...prev]);
        toast({ title: "Listing added", description: "Your property has been listed successfully." });
      }

      // Reset the form
      setNewListing({
        title: '',
        description: '',
        address: '',
        price: '',
        type: '',
        rooms: '',
        bathrooms: '',
        area: '',
        occupancy: '',
        furnishing: '',
        amenities: '',
        ownerContactNumber: '',
        photos: [],
      });
      setPhotoPreview([]);
    } catch (err) {
      console.error("Failed to add property:", err);
      toast({
        title: "Error Adding Property",
        description: err instanceof Error ? err.message : "Failed to add property. Check backend.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    try {
      await safeDeleteProperty(id);
      setListings(prev => prev.filter(p => p._id !== id));
      toast({ title: "Listing deleted", description: "Property listing has been removed." });
    } catch (err) {
      console.error("Failed to delete property:", err);
      toast({
        title: "Error Deleting Property",
        description: err instanceof Error ? err.message : "Failed to delete property.",
        variant: "destructive",
      });
    }
  };

  /* ----------------------------- UI Helpers ------------------------------ */

  const getStatusBadge = (statusOrAvailable: string | boolean) => {
    const status = typeof statusOrAvailable === "string" ? statusOrAvailable : (statusOrAvailable ? 'active' : 'rented');
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case 'rented':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Rented</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      default:
        return <Badge variant="secondary">{String(status)}</Badge>;
    }
  };

  /* ------------------------------- Render -------------------------------- */

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Owner Dashboard</h1>
            <p className="text-muted-foreground">Manage your property listings and track performance</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">{totalListings}</p>
                    <p className="text-sm text-muted-foreground">Total Listings</p>
                  </div>
                  <Home className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">{availableListings}</p>
                    <p className="text-sm text-muted-foreground">Available Listings</p>
                  </div>
                  <Eye className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">{rentedListings}</p>
                    <p className="text-sm text-muted-foreground">Rented Listings</p>
                  </div>
                  <Eye className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">{totalValue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                  </div>
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="listings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="listings" className="flex items-center space-x-2">
                <Home className="w-4 h-4" />
                <span>My Listings</span>
              </TabsTrigger>
              <TabsTrigger value="add-listing" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Listing</span>
              </TabsTrigger>
            </TabsList>

            {/* Listings tab */}
            <TabsContent value="listings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Listings</CardTitle>
                  <CardDescription>Manage your property listings and track their performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Property</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Views</TableHead>
                          <TableHead>Inquiries</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
                                <div>Loading your properties...</div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : !Array.isArray(listings) || listings.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              No properties found. Add your first property listing.
                            </TableCell>
                          </TableRow>
                        ) : (
                          listings.map((listing) => (
                            <TableRow key={listing._id}>
                              <TableCell className="font-medium">
                                <div>
                                  <div className="font-semibold">{listing.title}</div>
                                  <div className="text-sm text-muted-foreground">{listing.propertyType}</div>
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                                  {listing.address}
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="flex items-center">
                                  <IndianRupee className="w-4 h-4 mr-1" />
                                  {(typeof listing.price === 'number' ? listing.price : Number(listing.price || 0)).toLocaleString()}/month
                                </div>
                              </TableCell>

                              <TableCell>{getStatusBadge(listing.available)}</TableCell>

                              <TableCell>0</TableCell>
                              <TableCell>0</TableCell>

                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button variant="ghost" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteListing(listing._id)} className="text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Add listing tab */}
            <TabsContent value="add-listing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="w-5 h-5 text-primary" />
                    <span>Add New Property</span>
                  </CardTitle>
                  <CardDescription>Create a new property listing to attract tenants</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddListing} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Property Title *</Label>
                        <Input id="title" placeholder="e.g., Modern 2BHK Apartment" value={newListing.title} onChange={(e) => setNewListing(prev => ({ ...prev, title: e.target.value }))} required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type">Property Type *</Label>
                        <Select value={newListing.type} onValueChange={(value) => setNewListing(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1bhk">1 BHK</SelectItem>
                            <SelectItem value="2bhk">2 BHK</SelectItem>
                            <SelectItem value="3bhk">3 BHK</SelectItem>
                            <SelectItem value="4bhk">4 BHK</SelectItem>
                            <SelectItem value="villa">VILLA</SelectItem>
                                        
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price">Monthly Rent (₹) *</Label>
                        <Input id="price" type="number" placeholder="25000" value={newListing.price} onChange={(e) => setNewListing(prev => ({ ...prev, price: e.target.value }))} required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rooms">Number of Rooms</Label>
                        <Input id="rooms" type="number" placeholder="2" value={newListing.rooms} onChange={(e) => setNewListing(prev => ({ ...prev, rooms: e.target.value }))} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="furnishing">Furnishing Status</Label>
                        <Select value={newListing.furnishing} onValueChange={(value) => setNewListing(prev => ({ ...prev, furnishing: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select furnishing status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="furnished">Furnished</SelectItem>
                            <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                            <SelectItem value="unfurnished">Unfurnished</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bathrooms">Number of Bathrooms</Label>
                        <Input id="bathrooms" type="number" placeholder="2" value={newListing.bathrooms} onChange={(e) => setNewListing(prev => ({ ...prev, bathrooms: e.target.value }))} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="area">Area (sq ft)</Label>
                        <Input id="area" type="number" placeholder="1200" value={newListing.area} onChange={(e) => setNewListing(prev => ({ ...prev, area: e.target.value }))} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="occupancy">Preferred Occupancy</Label>
                        <Select value={newListing.occupancy} onValueChange={(value) => setNewListing(prev => ({ ...prev, occupancy: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select occupancy type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bachelors">Bachelors</SelectItem>
                            <SelectItem value="working-professionals">Working Professionals</SelectItem>
                            <SelectItem value="married-couples">Married Couples</SelectItem>
                            <SelectItem value="students">Students</SelectItem>
                            <SelectItem value="family">Family</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="Location">Location *</Label>
                      <Input id="address" placeholder="Enter complete address with area, city" value={newListing.address} onChange={(e) => setNewListing(prev => ({ ...prev, address: e.target.value }))} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ownerContactNumber">Owner Contact Number *</Label>
                      <Input id="ownerContactNumber" type="tel" placeholder="e.g., +91 9876543210" value={newListing.ownerContactNumber} onChange={(e) => setNewListing(prev => ({ ...prev, ownerContactNumber: e.target.value }))} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Describe your property, nearby amenities, and any special features..." rows={4} value={newListing.description} onChange={(e) => setNewListing(prev => ({ ...prev, description: e.target.value }))} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                      <Input id="amenities" placeholder="Furnished, WiFi, Parking, Security, AC" value={newListing.amenities} onChange={(e) => setNewListing(prev => ({ ...prev, amenities: e.target.value }))} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="photos">Property Photos (Max 5)</Label>
                      <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                          <label htmlFor="photos" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                              <p className="mb-2 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> property photos
                              </p>
                              <p className="text-xs text-muted-foreground">PNG, JPG or JPEG (MAX. 5 photos)</p>
                            </div>
                            <input id="photos" type="file" className="hidden" multiple accept="image/*" onChange={handlePhotoUpload} />
                          </label>
                        </div>

                        {photoPreview.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {photoPreview.map((preview, index) => (
                              <div key={index} className="relative group">
                                <img src={preview} alt={`Property photo ${index + 1}`} className="w-full h-24 object-cover rounded-lg border border-border" />
                                <button type="button" onClick={() => removePhoto(index)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button type="submit" className="bg-gradient-primary" disabled={submitting}>
                      <Plus className="w-4 h-4 mr-2" />
                      {submitting ? "Adding Property..." : "Add Property Listing"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OwnerDashboard;

