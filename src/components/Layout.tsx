import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              Legio Financial
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`text-foreground hover:text-primary transition-colors ${
                  location.pathname === '/' ? 'text-primary font-medium' : ''
                }`}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className={`text-foreground hover:text-primary transition-colors ${
                  location.pathname === '/about' ? 'text-primary font-medium' : ''
                }`}
              >
                About
              </Link>
              <Link 
                to="/pricing" 
                className={`text-foreground hover:text-primary transition-colors ${
                  location.pathname === '/pricing' ? 'text-primary font-medium' : ''
                }`}
              >
                Pricing
              </Link>
            </div>

            <Button asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-secondary/10 border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-primary">Legio Financial</h3>
              <p className="text-muted-foreground text-sm">
                Empowering individuals and businesses with intelligent financial management tools.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/pricing" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
                <li><Link to="/about" className="text-muted-foreground hover:text-primary">About</Link></li>
                <li><Link to="/auth" className="text-muted-foreground hover:text-primary">Get Started</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@legio.financial" className="text-muted-foreground hover:text-primary">Contact</a></li>
                <li><a href="mailto:help@legio.financial" className="text-muted-foreground hover:text-primary">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Legio Financial. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;