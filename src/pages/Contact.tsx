import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, Clock, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';

const Contact = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', description: '' });

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
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-10 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="container relative mx-auto px-4 py-20 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
            <MessageSquare className="w-3.5 h-3.5 mr-1.5 inline" />
            Get in Touch
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">{t('contactUs')}</h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">{t('contactHero')}</p>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-24 -mt-4">
        <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Info Cards */}
          <div className="space-y-4">
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-6">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-md">
                  <Mail className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-1">{t('emailUs')}</h3>
                <p className="text-primary font-medium text-sm">support@legio.com</p>
              </div>
            </Card>
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-br from-accent/10 via-primary/5 to-transparent p-6">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4 shadow-md">
                  <Clock className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-1">Response Time</h3>
                <p className="text-muted-foreground text-sm">{t('emailResponse')}</p>
              </div>
            </Card>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">{t('sendMessage')}</CardTitle>
                <CardDescription>{t('formDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm">{t('fullName')} *</Label>
                      <Input id="name" name="name" type="text" placeholder={t('fullName')} value={formData.name} onChange={handleInputChange} required className="rounded-xl h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">{t('emailAddress')} *</Label>
                      <Input id="email" name="email" type="email" placeholder={t('emailAddress')} value={formData.email} onChange={handleInputChange} required className="rounded-xl h-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm">{t('message')} *</Label>
                    <Textarea id="description" name="description" placeholder={t('message')} className="min-h-[140px] rounded-xl" value={formData.description} onChange={handleInputChange} required />
                  </div>
                  <Button type="submit" className="w-full rounded-xl h-11 shadow-md gap-2" disabled={isSubmitting}>
                    {isSubmitting ? t('sendingMessage') : (
                      <>
                        <Send className="w-4 h-4" />
                        {t('sendMessage')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
