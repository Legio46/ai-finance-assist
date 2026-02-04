import React, { useState } from 'react';
import { Shield, Lock, CheckCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SECURITY_INFO } from '@/utils/encryption';
import { cn } from '@/lib/utils';

interface SecurityBadgeProps {
  variant?: 'compact' | 'full' | 'inline';
  showDetails?: boolean;
  className?: string;
}

const SecurityBadge: React.FC<SecurityBadgeProps> = ({ 
  variant = 'compact', 
  showDetails = false,
  className 
}) => {
  const [showDialog, setShowDialog] = useState(false);

  if (variant === 'inline') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground cursor-help", className)}>
              <Lock className="h-3 w-3 text-green-600" />
              <span>AES-256 Encrypted</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-medium">Bank-Level Security</p>
            <p className="text-xs mt-1">Your data is protected with AES-256-GCM encryption, the same standard used by major financial institutions.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn("gap-1 cursor-help border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400", className)}
            >
              <Shield className="h-3 w-3" />
              Bank-Level Security
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <p className="font-medium">🔒 AES-256-GCM Encryption</p>
              <ul className="text-xs space-y-1">
                <li>• Military-grade encryption standard</li>
                <li>• Data encrypted at rest & in transit</li>
                <li>• NIST-approved algorithms</li>
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <div className={cn("flex items-center gap-3 p-4 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900 transition-colors", className)}>
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-green-700 dark:text-green-400">Bank-Level Security</h4>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-sm text-green-600 dark:text-green-500">
              AES-256-GCM Encryption • NIST Approved • Data Protected
            </p>
          </div>
          <Info className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Security & Encryption Details
          </DialogTitle>
          <DialogDescription>
            How we protect your sensitive financial data
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">Encryption</p>
              <p className="font-semibold">{SECURITY_INFO.encryptionType}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">Key Derivation</p>
              <p className="font-semibold">{SECURITY_INFO.keyDerivation}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">PBKDF2 Iterations</p>
              <p className="font-semibold">{SECURITY_INFO.iterations.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">Standard</p>
              <p className="font-semibold">{SECURITY_INFO.standard}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Security Features</h4>
            <ul className="space-y-2">
              {SECURITY_INFO.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <Lock className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-700 dark:text-green-400">
              Your data is encrypted with the same technology used by major banks and financial institutions worldwide.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityBadge;
