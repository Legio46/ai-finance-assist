import React, { useState } from 'react';
import { Shield, Lock, CheckCircle, Info, ShieldCheck, Fingerprint, Eye, Server, Globe, FileKey } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
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
  className,
}) => {
  const [showDialog, setShowDialog] = useState(false);

  if (variant === 'inline') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("inline-flex items-center gap-1.5 text-xs text-success cursor-help", className)}>
              <Lock className="h-3 w-3" />
              <span className="font-medium">AES-256 Encrypted</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-semibold text-sm">Bank-Level Security</p>
            <p className="text-xs mt-1 text-muted-foreground">Your data is protected with AES-256-GCM encryption, the same standard used by major financial institutions.</p>
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
            <span className={cn(
              "inline-flex items-center gap-1.5 cursor-help rounded-lg border px-2.5 py-1 text-xs font-semibold",
              "border-success/30 bg-success/10 text-success",
              className
            )}>
              <ShieldCheck className="h-3.5 w-3.5" />
              Bank-Level Security
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" />
                <p className="font-semibold text-sm">AES-256-GCM Encryption</p>
              </div>
              <ul className="text-xs space-y-1.5 text-muted-foreground">
                <li className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-success flex-shrink-0" /> Military-grade encryption standard</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-success flex-shrink-0" /> Data encrypted at rest & in transit</li>
                <li className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3 text-success flex-shrink-0" /> NIST-approved algorithms</li>
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full variant — professional security overview
  return (
    <>
      <Card
        className={cn("border-0 shadow-lg overflow-hidden cursor-pointer group", className)}
        onClick={() => setShowDialog(true)}
      >
        <div className="bg-gradient-to-br from-success/10 via-success/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success to-success/70 flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-7 w-7 text-success-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground">Bank-Level Security Active</h3>
                  <Badge variant="outline" className="text-success border-success/30 text-[10px] px-1.5 py-0">VERIFIED</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  AES-256-GCM Encryption • PBKDF2 Key Derivation • NIST Approved
                </p>
              </div>
              <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
            </div>

            {/* Security metrics row */}
            <div className="grid grid-cols-4 gap-3 mt-5">
              {[
                { label: "Encryption", value: "AES-256", icon: Lock },
                { label: "Key Derivation", value: "PBKDF2", icon: FileKey },
                { label: "Iterations", value: "100,000", icon: Fingerprint },
                { label: "Standard", value: "NIST", icon: Shield },
              ].map((item) => (
                <div key={item.label} className="text-center p-2.5 rounded-xl bg-card border border-border/50">
                  <item.icon className="h-4 w-4 text-success mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-foreground">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </div>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-success/70 flex items-center justify-center shadow-md">
                <ShieldCheck className="h-5 w-5 text-success-foreground" />
              </div>
              <div>
                <DialogTitle>Security & Encryption</DialogTitle>
                <DialogDescription>How we protect your financial data</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Encryption", value: SECURITY_INFO.encryptionType, desc: "Galois/Counter Mode" },
                { label: "Key Derivation", value: SECURITY_INFO.keyDerivation, desc: "SHA-256 based" },
                { label: "PBKDF2 Iterations", value: SECURITY_INFO.iterations.toLocaleString(), desc: "Brute-force resistant" },
                { label: "Certification", value: SECURITY_INFO.standard, desc: "Government standard" },
              ].map((spec) => (
                <div key={spec.label} className="p-3 rounded-xl bg-muted/50 border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{spec.label}</p>
                  <p className="font-bold text-sm text-foreground mt-0.5">{spec.value}</p>
                  <p className="text-[10px] text-muted-foreground">{spec.desc}</p>
                </div>
              ))}
            </div>

            {/* Features */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Security Features</h4>
              <div className="space-y-2.5">
                {SECURITY_INFO.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-success" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust footer */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-success/5 border border-success/15">
              <Lock className="h-5 w-5 text-success flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Your data is encrypted with the same technology used by major banks and financial institutions worldwide.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SecurityBadge;
