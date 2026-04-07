import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import CurrencyConverterDropdown from "@/components/CurrencyConverterDropdown";
import logo from "@/assets/shield-logo.png";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: "/", label: t('home') },
    { to: "/pricing", label: t('pricing') },
    { to: "/contact", label: t('contact') },
  ];

  return (
    <div className="min-h-screen flex flex-col noise-overlay">
      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="container mx-auto px-4 py-3 lg:px-12">
          <nav className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2.5 text-xl font-bold group">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg" style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))',
                border: '2px solid hsl(var(--primary) / 0.5)',
              }}>
                <img src={logo} alt="Legio Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-serif text-xl font-black tracking-tight text-white">
                Legio
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-4 py-2 rounded-lg text-sm transition-all ${
                    location.pathname === link.to
                      ? 'text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  {link.label}
                </Link>
              ))}
              <div className="ml-2 pl-2 border-l border-border">
                <CurrencyConverterDropdown />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button asChild size="sm" className="ml-1 hidden sm:inline-flex rounded-3xl px-5 bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/auth">{t('getStarted')} →</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-foreground"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </nav>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden mt-3 pb-3 pt-3 space-y-1 border-t border-border">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm transition-all ${
                    location.pathname === link.to
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-4 pt-2">
                <Button asChild className="w-full rounded-3xl bg-primary text-primary-foreground">
                  <Link to="/auth" onClick={() => setMobileOpen(false)}>{t('getStarted')}</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">{children}</main>

      {/* Footer */}
      <footer className="relative z-10 bg-card border-t border-border">
        <div className="container mx-auto px-4 py-14 lg:px-12">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <Link to="/" className="flex items-center gap-2 text-lg font-bold text-foreground mb-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden shadow" style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))',
                  border: '1px solid hsl(var(--primary) / 0.4)',
                }}>
                  <img src={logo} alt="Legio" className="w-full h-full object-cover" />
                </div>
                <span className="font-serif">Legio</span>
              </Link>
              <p className="text-sm mb-5 leading-relaxed text-muted-foreground">
                {t('empoweringText')}
              </p>
              <div className="flex space-x-3">
                <a href="https://www.youtube.com/@legiox46" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg flex items-center justify-center transition-all bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg flex items-center justify-center transition-all bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg flex items-center justify-center transition-all bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg flex items-center justify-center transition-all bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://www.tiktok.com/@legiox46" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg flex items-center justify-center transition-all bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-sans font-semibold text-sm text-foreground mb-4">{t('productTitle')}</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">{t('pricing')}</Link></li>
                <li><Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">{t('getStarted')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-sans font-semibold text-sm text-foreground mb-4">{t('legalTitle')}</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">{t('privacyPolicy')}</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">{t('termsOfService')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-sans font-semibold text-sm text-foreground mb-4">{t('supportTitle')}</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">{t('contact')}</Link></li>
                <li><a href="mailto:help@legio.financial" className="text-muted-foreground hover:text-foreground transition-colors">{t('helpCenter')}</a></li>
                <li><Link to="/affiliate" className="text-muted-foreground hover:text-foreground transition-colors">{t('affiliateProgram')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-8 text-center text-sm border-t border-border text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Legio Finance. {t('allRightsReserved')}.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
