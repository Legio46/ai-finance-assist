import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie, Shield } from 'lucide-react';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Cookie className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">We use cookies</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use cookies and similar technologies to enhance your experience, analyze site usage, and assist in our security efforts. By clicking "Accept All", you consent to the use of cookies. Read our{' '}
              <a href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</a> for more information.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-4">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            Essential Only
          </Button>
          <Button size="sm" onClick={handleAccept} className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
