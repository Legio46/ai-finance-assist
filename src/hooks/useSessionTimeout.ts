import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE = 2 * 60 * 1000; // Warn 2 minutes before

export const useSessionTimeout = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
  }, []);

  const resetTimers = useCallback(() => {
    if (!user) return;
    clearTimers();

    warningRef.current = setTimeout(() => {
      toast({
        title: "Session Expiring",
        description: "You'll be logged out in 2 minutes due to inactivity. Move your mouse or press a key to stay signed in.",
      });
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE);

    timeoutRef.current = setTimeout(() => {
      signOut();
      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity.",
        variant: "destructive",
      });
    }, INACTIVITY_TIMEOUT);
  }, [user, signOut, toast, clearTimers]);

  useEffect(() => {
    if (!user) {
      clearTimers();
      return;
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => resetTimers();

    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));
    resetTimers();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      clearTimers();
    };
  }, [user, resetTimers, clearTimers]);
};
