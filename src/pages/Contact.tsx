import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, Clock, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Contact = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', description: '' });

  // Force dark mode on contact page for Aura design
  React.useEffect(() => {
    const wasDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.add("dark");
    return () => {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light" || (!savedTheme && !wasDark)) {
        document.documentElement.classList.remove("dark");
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: t('messageSent'), description: t('thankYouContact') });
      setFormData({ name: '', email: '', description: '' });
    } catch {
      toast({ title: "Error", description: t('errorSending'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 text-center">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(11,61,140,0.3) 0%, rgba(12,26,53,0.95) 100%)' }} />
        <div className="container relative mx-auto px-4">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium mb-6"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)' }}>
            <MessageSquare className="w-3.5 h-3.5" />
            Get in Touch
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-foreground">{t('contactUs')}</h1>
          <p className="text-sm max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>{t('contactHero')}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-24 -mt-4">
        <div className="grid lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {/* Info Cards */}
          <div className="space-y-4">
            <div className="rounded-2xl p-6 transition-all" style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
            }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4"
                style={{ background: 'rgba(245,201,106,0.1)', border: '1px solid rgba(245,201,106,0.2)' }}>
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-sans font-semibold text-foreground mb-1">{t('emailUs')}</h3>
              <p className="text-primary text-sm font-medium">support@legio.com</p>
            </div>
            <div className="rounded-2xl p-6 transition-all" style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
            }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4"
                style={{ background: 'rgba(245,201,106,0.1)', border: '1px solid rgba(245,201,106,0.2)' }}>
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-sans font-semibold text-foreground mb-1">Response Time</h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{t('emailResponse')}</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl p-8" style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(28px)',
            }}>
              <h2 className="text-xl font-bold text-foreground mb-1">{t('sendMessage')}</h2>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>{t('formDescription')}</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-sans">{t('fullName')} *</Label>
                    <Input id="name" name="name" type="text" placeholder={t('fullName')} value={formData.name} onChange={handleInputChange} required className="rounded-xl h-11 bg-background/50 border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-sans">{t('emailAddress')} *</Label>
                    <Input id="email" name="email" type="email" placeholder={t('emailAddress')} value={formData.email} onChange={handleInputChange} required className="rounded-xl h-11 bg-background/50 border-border" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-sans">{t('message')} *</Label>
                  <Textarea id="description" name="description" placeholder={t('message')} className="min-h-[140px] rounded-xl bg-background/50 border-border" value={formData.description} onChange={handleInputChange} required />
                </div>
                <Button type="submit" className="w-full rounded-xl h-11 gap-2 font-sans" disabled={isSubmitting}
                  style={{ background: '#2563eb', boxShadow: '0 4px 24px rgba(37,99,235,0.4)' }}>
                  {isSubmitting ? t('sendingMessage') : (
                    <>
                      <Send className="w-4 h-4" />
                      {t('sendMessage')}
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;