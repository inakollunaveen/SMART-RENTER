import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Search, User, Settings, LogOut } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-glass backdrop-blur-md border-b border-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">SmartRent</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate("/")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => navigate("/search")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Search
            </button>
            
            {isAuthenticated ? (
              <>
                <button 
                  onClick={() => navigate(user?.role === 'owner' ? '/owner-dashboard' : user?.role === 'admin' ? '/admin-dashboard' : '/search')}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </button>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">Hi, {user?.name}</span>
<Button variant="outline" size="sm" onClick={() => { logout(); navigate("/auth"); }}>
  <LogOut className="w-4 h-4 mr-2" />
  Logout
</Button>
                </div>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-card/95 backdrop-blur-sm border border-border rounded-lg mt-2 mb-4 p-4">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => navigate("/")}
                className="text-foreground hover:text-primary transition-colors text-left"
              >
                Home
              </button>
              <button 
                onClick={() => navigate("/search")}
                className="text-foreground hover:text-primary transition-colors text-left"
              >
                Search
              </button>
              
              {isAuthenticated ? (
                <>
                  <button 
                    onClick={() => navigate(user?.role === 'owner' ? '/owner-dashboard' : user?.role === 'admin' ? '/admin-dashboard' : '/search')}
                    className="text-foreground hover:text-primary transition-colors text-left"
                  >
                    Dashboard
                  </button>
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Hi, {user?.name}</p>
<Button variant="outline" size="sm" className="w-fit" onClick={() => { logout(); navigate("/auth"); }}>
  <LogOut className="w-4 h-4 mr-2" />
  Logout
</Button>
                  </div>
                </>
              ) : (
                <Button variant="outline" size="sm" className="w-fit" onClick={() => navigate("/auth")}>
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;