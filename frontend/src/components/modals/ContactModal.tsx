import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MessageCircle, Shield, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Owner {
  name: string;
  phone: string;
  email: string;
  verified: boolean;
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: Owner;
}

const ContactModal = ({ isOpen, onClose, owner }: ContactModalProps) => {
  const handleCopyPhone = () => {
    navigator.clipboard.writeText(owner.phone);
    toast({
      title: "Phone number copied",
      description: "Phone number has been copied to clipboard",
    });
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(owner.email);
    toast({
      title: "Email copied",
      description: "Email address has been copied to clipboard",
    });
  };

  const handleCall = () => {
    window.open(`tel:${owner.phone}`);
  };

  const handleEmail = () => {
    window.open(`mailto:${owner.email}?subject=Inquiry about your property listing`);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hi! I'm interested in your property listing on SmartRent. Could you please provide more details?");
    window.open(`https://wa.me/${owner.phone.replace(/\D/g, '')}?text=${message}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Contact Owner</span>
            {owner.verified && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Get in touch with the property owner to schedule a visit or ask questions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Owner Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {owner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{owner.name}</h3>
                  <p className="text-sm text-muted-foreground">Property Owner</p>
                </div>
              </div>
              
              {/* Contact Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <span className="font-medium">{owner.phone}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleCopyPhone}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <span className="font-medium">{owner.email}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleCopyEmail}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Contact Actions */}
          <div className="grid grid-cols-1 gap-3">
            <Button onClick={handleCall} className="bg-gradient-primary text-white">
              <Phone className="w-4 h-4 mr-2" />
              Call Now
            </Button>
            
            <Button onClick={handleWhatsApp} variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            
            <Button onClick={handleEmail} variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </div>
          
          {/* Safety Tips */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold text-sm text-foreground mb-2">Safety Tips</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Always visit the property in person before making any payments</li>
              <li>• Verify the owner's identity and property documents</li>
              <li>• Never share personal financial information over calls</li>
              <li>• Meet in public places for initial discussions</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;