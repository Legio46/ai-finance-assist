import React from 'react';
import { 
  Tv, Music, Gamepad2, ShoppingCart, Receipt, Ticket, 
  Wifi, Home, Zap, Droplets, Phone, Car, Plane,
  GraduationCap, Heart, Dumbbell, Cloud, Mail,
  Newspaper, BookOpen, Coffee, UtensilsCrossed
} from 'lucide-react';

// Logo imports
import netflixLogo from '@/assets/logos/netflix.png';
import spotifyLogo from '@/assets/logos/spotify.png';
import disneyLogo from '@/assets/logos/disney.png';
import hboLogo from '@/assets/logos/hbomax.png';
import huluLogo from '@/assets/logos/hulu.png';
import youtubeLogo from '@/assets/logos/youtube.png';
import appleMusicLogo from '@/assets/logos/applemusic.png';
import appleTvLogo from '@/assets/logos/appletv.png';
import espnLogo from '@/assets/logos/espn.png';
import paramountLogo from '@/assets/logos/paramount.png';
import playstationLogo from '@/assets/logos/playstation.png';
import xboxLogo from '@/assets/logos/xbox.png';
import amazonLogo from '@/assets/logos/amazon.png';

export interface ServiceInfo {
  name: string;
  category: string;
  color: string;
  logo: string;
}

const LOGO_SIZE = "w-5 h-5";

export const SERVICE_DATABASE: Record<string, ServiceInfo> = {
  // Streaming Services
  'Netflix': { name: 'Netflix', category: 'Streaming Services', color: '#E50914', logo: netflixLogo },
  'Disney+': { name: 'Disney+', category: 'Streaming Services', color: '#113CCF', logo: disneyLogo },
  'HBO Max': { name: 'HBO Max', category: 'Streaming Services', color: '#5822B4', logo: hboLogo },
  'Hulu': { name: 'Hulu', category: 'Streaming Services', color: '#1CE783', logo: huluLogo },
  'Apple TV+': { name: 'Apple TV+', category: 'Streaming Services', color: '#000000', logo: appleTvLogo },
  'Paramount+': { name: 'Paramount+', category: 'Streaming Services', color: '#0064FF', logo: paramountLogo },
  'Amazon Prime': { name: 'Amazon Prime', category: 'Streaming Services', color: '#00A8E1', logo: amazonLogo },
  'ESPN+': { name: 'ESPN+', category: 'Streaming Services', color: '#D00', logo: espnLogo },
  'YouTube Premium': { name: 'YouTube Premium', category: 'Streaming Services', color: '#FF0000', logo: youtubeLogo },

  // Music
  'Spotify': { name: 'Spotify', category: 'Music', color: '#1DB954', logo: spotifyLogo },
  'Apple Music': { name: 'Apple Music', category: 'Music', color: '#FA243C', logo: appleMusicLogo },

  // Gaming Services
  'PlayStation Plus': { name: 'PlayStation Plus', category: 'Gaming Services', color: '#003791', logo: playstationLogo },
  'Xbox Game Pass': { name: 'Xbox Game Pass', category: 'Gaming Services', color: '#107C10', logo: xboxLogo },
};

export const CATEGORY_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  'Streaming Services': { icon: <Tv className={LOGO_SIZE} />, color: '#8B5CF6' },
  'Music': { icon: <Music className={LOGO_SIZE} />, color: '#EC4899' },
  'Gaming Services': { icon: <Gamepad2 className={LOGO_SIZE} />, color: '#10B981' },
  'Groceries': { icon: <ShoppingCart className={LOGO_SIZE} />, color: '#F59E0B' },
  'Bills & Utilities': { icon: <Receipt className={LOGO_SIZE} />, color: '#3B82F6' },
  'Rent/Mortgage': { icon: <Home className={LOGO_SIZE} />, color: '#6366F1' },
  'Internet': { icon: <Wifi className={LOGO_SIZE} />, color: '#06B6D4' },
  'Phone Bill': { icon: <Phone className={LOGO_SIZE} />, color: '#8B5CF6' },
  'Electricity': { icon: <Zap className={LOGO_SIZE} />, color: '#F59E0B' },
  'Water': { icon: <Droplets className={LOGO_SIZE} />, color: '#06B6D4' },
  'Transportation': { icon: <Car className={LOGO_SIZE} />, color: '#64748B' },
  'Travel': { icon: <Plane className={LOGO_SIZE} />, color: '#0EA5E9' },
  'Entertainment': { icon: <Ticket className={LOGO_SIZE} />, color: '#A855F7' },
  'Education': { icon: <GraduationCap className={LOGO_SIZE} />, color: '#14B8A6' },
  'Healthcare': { icon: <Heart className={LOGO_SIZE} />, color: '#EF4444' },
  'Fitness': { icon: <Dumbbell className={LOGO_SIZE} />, color: '#F97316' },
  'Cloud Storage': { icon: <Cloud className={LOGO_SIZE} />, color: '#6366F1' },
  'Subscriptions': { icon: <Mail className={LOGO_SIZE} />, color: '#8B5CF6' },
  'News & Magazines': { icon: <Newspaper className={LOGO_SIZE} />, color: '#64748B' },
  'Food & Dining': { icon: <UtensilsCrossed className={LOGO_SIZE} />, color: '#EF4444' },
  'Shopping': { icon: <ShoppingCart className={LOGO_SIZE} />, color: '#F59E0B' },
  'Other': { icon: <Receipt className={LOGO_SIZE} />, color: '#94A3B8' },
};

interface ServiceLogoProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export const ServiceLogo: React.FC<ServiceLogoProps> = ({ name, size = 'md', showName = false }) => {
  const service = SERVICE_DATABASE[name];
  const sizeClasses = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-11 h-11' };
  const imgSizes = { sm: 'w-5 h-5', md: 'w-7 h-7', lg: 'w-9 h-9' };

  if (service) {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`${sizeClasses[size]} rounded-lg flex items-center justify-center overflow-hidden bg-card border border-border`}
        >
          <img 
            src={service.logo} 
            alt={service.name} 
            className={`${imgSizes[size]} object-contain`}
          />
        </div>
        {showName && <span className="text-sm font-medium">{service.name}</span>}
      </div>
    );
  }

  // Fallback: check category icons
  const catIcon = CATEGORY_ICONS[name];
  if (catIcon) {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`${sizeClasses[size]} rounded-lg flex items-center justify-center`}
          style={{ backgroundColor: `${catIcon.color}15`, color: catIcon.color }}
        >
          {catIcon.icon}
        </div>
        {showName && <span className="text-sm font-medium">{name}</span>}
      </div>
    );
  }

  // Generic fallback
  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} rounded-lg bg-muted flex items-center justify-center`}>
        <Receipt className={LOGO_SIZE + " text-muted-foreground"} />
      </div>
      {showName && <span className="text-sm font-medium">{name}</span>}
    </div>
  );
};

export const getServiceCategory = (name: string): string => {
  return SERVICE_DATABASE[name]?.category || 'Other';
};

export const POPULAR_SERVICES = Object.keys(SERVICE_DATABASE);

export default ServiceLogo;
