import { useState, useCallback } from 'react';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

interface RateLimitState {
  attempts: number;
  lockedUntil: number | null;
}

export const useLoginRateLimit = () => {
  const [state, setState] = useState<RateLimitState>(() => {
    try {
      const stored = sessionStorage.getItem('login_rate_limit');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Clear if lockout expired
        if (parsed.lockedUntil && Date.now() > parsed.lockedUntil) {
          sessionStorage.removeItem('login_rate_limit');
          return { attempts: 0, lockedUntil: null };
        }
        return parsed;
      }
    } catch {}
    return { attempts: 0, lockedUntil: null };
  });

  const isLocked = state.lockedUntil !== null && Date.now() < state.lockedUntil;

  const remainingLockSeconds = isLocked
    ? Math.ceil((state.lockedUntil! - Date.now()) / 1000)
    : 0;

  const recordAttempt = useCallback(() => {
    setState(prev => {
      const newAttempts = prev.attempts + 1;
      const newState: RateLimitState = newAttempts >= MAX_ATTEMPTS
        ? { attempts: newAttempts, lockedUntil: Date.now() + LOCKOUT_DURATION }
        : { attempts: newAttempts, lockedUntil: null };
      sessionStorage.setItem('login_rate_limit', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const resetAttempts = useCallback(() => {
    setState({ attempts: 0, lockedUntil: null });
    sessionStorage.removeItem('login_rate_limit');
  }, []);

  return {
    isLocked,
    remainingLockSeconds,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - state.attempts),
    recordAttempt,
    resetAttempts,
  };
};
