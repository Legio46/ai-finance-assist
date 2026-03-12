import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown, Plus, LogIn, User, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SavedAccount {
  email: string;
  name: string;
}

const STORAGE_KEY = 'legio_saved_accounts';

const getSavedAccounts = (): SavedAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveAccount = (account: SavedAccount) => {
  const accounts = getSavedAccounts();
  if (!accounts.find(a => a.email === account.email)) {
    accounts.push(account);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }
};

const removeAccount = (email: string) => {
  const accounts = getSavedAccounts().filter(a => a.email !== email);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
};

const AccountSwitcher: React.FC = () => {
  const { user, profile, signIn, signOut } = useAuth();
  const { toast } = useToast();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [switchEmail, setSwitchEmail] = useState('');
  const [switchPassword, setSwitchPassword] = useState('');
  const [switching, setSwitching] = useState(false);

  const savedAccounts = getSavedAccounts();
  const currentEmail = user?.email || '';

  // Save current account when component mounts
  React.useEffect(() => {
    if (user?.email) {
      saveAccount({
        email: user.email,
        name: profile?.full_name || user.email.split('@')[0],
      });
    }
  }, [user?.email, profile?.full_name]);

  const handleSwitchToSaved = async (account: SavedAccount) => {
    if (account.email === currentEmail) return;
    setShowLoginDialog(true);
    setSwitchEmail(account.email);
  };

  const handleSwitchAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!switchEmail || !switchPassword) return;
    
    setSwitching(true);
    try {
      await signOut();
      const result = await signIn(switchEmail, switchPassword);
      if (!result.error) {
        setShowLoginDialog(false);
        setSwitchEmail('');
        setSwitchPassword('');
      }
    } catch (err) {
      toast({ title: "Switch failed", description: "Could not switch accounts.", variant: "destructive" });
    } finally {
      setSwitching(false);
    }
  };

  const handleAddNewAccount = () => {
    setSwitchEmail('');
    setSwitchPassword('');
    setShowLoginDialog(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 px-2">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium max-w-[120px] truncate hidden md:inline">
              {displayName}
            </span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-64">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{currentEmail}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {savedAccounts.length > 1 && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">
                Switch Account
              </DropdownMenuLabel>
              {savedAccounts
                .filter(a => a.email !== currentEmail)
                .map(account => (
                  <DropdownMenuItem
                    key={account.email}
                    onClick={() => handleSwitchToSaved(account)}
                    className="cursor-pointer"
                  >
                    <Avatar className="w-6 h-6 mr-2">
                      <AvatarFallback className="bg-muted text-xs">
                        {getInitials(account.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm">{account.name}</span>
                      <span className="text-xs text-muted-foreground">{account.email}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem onClick={handleAddNewAccount} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Add another account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Switch Account</DialogTitle>
            <DialogDescription>
              Sign in to {switchEmail || 'another account'} to switch.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSwitchAccount} className="space-y-4">
            <div>
              <Label htmlFor="switch-email">Email</Label>
              <Input
                id="switch-email"
                type="email"
                value={switchEmail}
                onChange={(e) => setSwitchEmail(e.target.value)}
                placeholder="Enter email"
                required
              />
            </div>
            <div>
              <Label htmlFor="switch-password">Password</Label>
              <Input
                id="switch-password"
                type="password"
                value={switchPassword}
                onChange={(e) => setSwitchPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={switching}>
              {switching ? 'Switching...' : 'Switch Account'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountSwitcher;
