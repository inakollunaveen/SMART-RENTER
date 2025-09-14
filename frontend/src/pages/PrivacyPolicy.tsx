import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, UserCheck } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground text-lg">
              How we collect, use, and protect your information
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: January 1, 2024
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-sm">Data Protection</h3>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-sm">Secure Storage</h3>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Eye className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-sm">Transparency</h3>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <UserCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-sm">User Rights</h3>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-4">
                  <li>Name, email address, and phone number</li>
                  <li>Account credentials and profile information</li>
                  <li>Property listing details and photos</li>
                  <li>Communication preferences</li>
                </ul>

                <h4 className="font-semibold mb-2">Usage Information</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                  <li>Pages visited and features used</li>
                  <li>Search queries and preferences</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Provide and improve our services</li>
                  <li>Connect property owners with potential tenants</li>
                  <li>Send important updates and notifications</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                  <li>Prevent fraud and ensure platform security</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Information Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We do not sell your personal information. We may share information in these limited circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>With property owners:</strong> When you express interest in a property</li>
                  <li><strong>With service providers:</strong> Who help us operate our platform</li>
                  <li><strong>For legal compliance:</strong> When required by law or legal process</li>
                  <li><strong>With your consent:</strong> When you explicitly agree to sharing</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication protocols</li>
                  <li>Secure data storage with backup systems</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Rights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Access and review your personal information</li>
                  <li>Update or correct inaccurate data</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request data portability</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you have questions about this Privacy Policy or your data, contact us:
                </p>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Email:</strong> privacy@smartrent.com</p>
                  <p className="text-sm"><strong>Phone:</strong> +91 98765 43210</p>
                  <p className="text-sm"><strong>Address:</strong> 123 Tech Park, Bangalore, Karnataka 560001</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;