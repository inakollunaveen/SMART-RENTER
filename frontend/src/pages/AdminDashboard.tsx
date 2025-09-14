import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Shield, CheckCircle, XCircle, Eye, Users, Home, TrendingUp, MapPin, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getPendingProperties, approveProperty } from '@/utils/api';

// Mock pending listings data
const mockPendingListings = [
  {
    id: "pending-1",
    title: "Luxury 3BHK Villa",
    owner: "Suresh Kumar",
    location: "HSR Layout, Bangalore",
    price: 45000,
    type: "3BHK",
    submittedDate: "2024-01-20",
    status: "pending"
  },
  {
    id: "pending-2",
    title: "Modern Studio Apartment",
    owner: "Priya Sharma",
    location: "Koramangala, Bangalore",
    price: 18000,
    type: "Studio",
    submittedDate: "2024-01-19",
    status: "pending"
  }
];

// Mock analytics data
const mockAnalytics = {
  totalListings: 1250,
  activeListings: 980,
  totalUsers: 5420,
  totalOwners: 340,
  avgRent: 28500,
  popularAreas: [
    { name: "Koramangala", listings: 145 },
    { name: "Indiranagar", listings: 132 },
    { name: "Whitefield", listings: 98 },
    { name: "HSR Layout", listings: 87 },
    { name: "Electronic City", listings: 76 }
  ]
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [pendingListings, setPendingListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const fetchPendingProperties = async () => {
    try {
      setLoading(true);
      const response = await getPendingProperties();
      setPendingListings(response.properties || []);
    } catch (error) {
      console.error('Error fetching pending properties:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending properties.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProperty = async (id: string) => {
    try {
      setApproving(id);
      await approveProperty(id, 'approved');
      setPendingListings(listings => listings.filter(listing => listing._id !== id));
      toast({
        title: "Property approved",
        description: "Property has been approved and is now visible to tenants.",
      });
    } catch (error) {
      console.error('Error approving property:', error);
      toast({
        title: "Error",
        description: "Failed to approve property.",
        variant: "destructive"
      });
    } finally {
      setApproving(null);
    }
  };

  const handleRejectProperty = async (id: string) => {
    try {
      setApproving(id);
      await approveProperty(id, 'rejected');
      setPendingListings(listings => listings.filter(listing => listing._id !== id));
      toast({
        title: "Property rejected",
        description: "Property has been rejected and removed from listings.",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error rejecting property:', error);
      toast({
        title: "Error",
        description: "Failed to reject property.",
        variant: "destructive"
      });
    } finally {
      setApproving(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Verified</Badge>;
      case 'blocked':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Blocked</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage platform operations and monitor analytics
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">{mockAnalytics.totalListings}</p>
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
                    <p className="text-2xl font-bold text-primary">{mockAnalytics.totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">{pendingListings.filter(l => l.status === 'pending').length}</p>
                    <p className="text-sm text-muted-foreground">Pending Approvals</p>
                  </div>
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">₹{mockAnalytics.avgRent.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Avg. Rent</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Pending Listings</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Property Listings</CardTitle>
                  <CardDescription>
                    Review and approve property listings submitted by owners
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Property</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                              Loading pending properties...
                            </TableCell>
                          </TableRow>
                        ) : pendingListings.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No pending properties to review
                            </TableCell>
                          </TableRow>
                        ) : (
                          pendingListings.map((listing) => (
                            <TableRow key={listing._id}>
                              <TableCell className="font-medium">
                                <div>
                                  <div className="font-semibold">{listing.title}</div>
                                  <div className="text-sm text-muted-foreground">{listing.propertyType}</div>
                                </div>
                              </TableCell>
                              <TableCell>{listing.owner?.name || 'Unknown'}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                                  {listing.address}
                                </div>
                              </TableCell>
                              <TableCell>₹{listing.price.toLocaleString()}/month</TableCell>
                              <TableCell>{new Date(listing.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>{getStatusBadge(listing.approvalStatus)}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleApproveProperty(listing._id)}
                                    disabled={approving === listing._id}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {approving === listing._id ? (
                                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                    )}
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleRejectProperty(listing._id)}
                                    disabled={approving === listing._id}
                                  >
                                    {approving === listing._id ? (
                                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                    ) : (
                                      <XCircle className="w-4 h-4 mr-1" />
                                    )}
                                    Reject
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="w-4 h-4" />
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
            
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular Areas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Areas</CardTitle>
                    <CardDescription>
                      Top areas by number of listings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockAnalytics.popularAreas.map((area, index) => (
                        <div key={area.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">{index + 1}</span>
                            </div>
                            <span className="font-medium">{area.name}</span>
                          </div>
                          <Badge variant="secondary">{area.listings} listings</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Overview</CardTitle>
                    <CardDescription>
                      Key metrics and statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">Active Listings</span>
                        <span className="font-bold text-primary">{mockAnalytics.activeListings}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">Property Owners</span>
                        <span className="font-bold text-primary">{mockAnalytics.totalOwners}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">Average Rent</span>
                        <span className="font-bold text-primary">₹{mockAnalytics.avgRent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">Success Rate</span>
                        <span className="font-bold text-primary">87%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;