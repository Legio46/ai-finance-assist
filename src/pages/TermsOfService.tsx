import { FileText, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: (
        <p>By accessing and using Legio Finance ("the Service", "we", "us", or "our"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service. These terms apply to all users, including visitors, registered users, and subscribers.</p>
      ),
    },
    {
      title: "2. Description of Service",
      content: (
        <>
          <p className="mb-3">Legio Finance is a personal and business financial management platform that provides:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Expense tracking and categorization</li>
            <li>Credit card management and transaction monitoring</li>
            <li>Income tracking and budget management</li>
            <li>Recurring payment tracking and reminders</li>
            <li>Investment portfolio tracking (stocks, crypto, ETFs, real estate)</li>
            <li>Financial goal setting and progress tracking</li>
            <li>Financial calendar for bills, paydays, and important dates</li>
            <li>AI-powered financial advisor chat</li>
            <li>Currency conversion tools</li>
            <li>Data export capabilities (CSV/PDF)</li>
          </ul>
        </>
      ),
    },
    {
      title: "3. User Accounts",
      content: (
        <>
          <p className="mb-3">To use our service, you must:</p>
          <ul className="list-disc pl-5 space-y-1.5 mb-4">
            <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
            <li>Provide accurate, current, and complete registration information</li>
            <li>Maintain and promptly update your account information</li>
            <li>Maintain the confidentiality of your password and account credentials</li>
            <li>Accept responsibility for all activities that occur under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>
          <p>You may not share your account credentials with others or allow multiple people to use your account unless your subscription plan explicitly permits it.</p>
        </>
      ),
    },
    {
      title: "4. Subscription Plans & Payment",
      content: (
        <>
          <p className="mb-3">Our service offers the following subscription tiers:</p>
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            <div className="bg-muted/40 rounded-lg p-4 border border-border/50">
              <p className="font-semibold text-foreground text-sm mb-1">Personal Basic</p>
              <p className="text-xl font-bold text-primary mb-1">€5<span className="text-xs font-normal text-muted-foreground">/month</span></p>
              <p className="text-xs">Expense tracking, credit cards, income, budgets, data export</p>
            </div>
            <div className="bg-muted/40 rounded-lg p-4 border border-primary/20">
              <p className="font-semibold text-foreground text-sm mb-1">Personal Pro</p>
              <p className="text-xl font-bold text-primary mb-1">€10<span className="text-xs font-normal text-muted-foreground">/month</span></p>
              <p className="text-xs">All Basic + investments, AI advisor, financial calendar, goals</p>
            </div>
          </div>
          <h4 className="font-semibold text-foreground text-sm mb-2">Payment Terms</h4>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>All new subscriptions include a <strong className="text-foreground">7-day free trial</strong></li>
            <li>Subscriptions automatically renew monthly unless cancelled</li>
            <li>Cancel at any time through account settings — takes effect at end of billing period</li>
            <li>Payments processed securely through Stripe</li>
            <li>Prices in EUR, subject to applicable taxes</li>
          </ul>
        </>
      ),
    },
    {
      title: "5. Refund Policy",
      content: (
        <ul className="list-disc pl-5 space-y-2">
          <li>Cancel during your 7-day free trial — <strong className="text-foreground">no charge</strong></li>
          <li>Refunds may be requested within 14 days of a charge for unused service</li>
          <li>Submit requests to <a href="mailto:support@legiofinance.com" className="text-primary hover:underline font-medium">support@legiofinance.com</a></li>
          <li>Refunds are issued at our discretion, typically within 5–10 business days</li>
        </ul>
      ),
    },
    {
      title: "6. Acceptable Use",
      content: (
        <>
          <p className="mb-3">You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Use the service for any illegal or unauthorized purpose</li>
            <li>Violate any laws in your jurisdiction, including tax laws</li>
            <li>Input false or misleading financial data with intent to deceive</li>
            <li>Attempt unauthorized access to our systems or other users' accounts</li>
            <li>Transmit viruses, malware, or other harmful code</li>
            <li>Reverse engineer, decompile, or disassemble any part of the service</li>
            <li>Use automated systems to access the service without permission</li>
            <li>Resell or redistribute the service without authorization</li>
          </ul>
        </>
      ),
    },
    {
      title: "7. Financial Information Disclaimer",
      content: (
        <>
          <div className="bg-destructive/5 border border-destructive/15 rounded-xl p-4 mb-5">
            <p className="font-semibold text-foreground text-sm mb-1">⚠️ Important Notice</p>
            <p className="text-xs">Legio Finance provides financial tracking tools and general educational information. It is <strong>not</strong> professional financial, tax, or investment advice, and should not substitute consultation with qualified professionals.</p>
          </div>
          <p className="mb-3">You should:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Consult licensed professionals for specific financial, tax, or investment advice</li>
            <li>Verify all calculations before making financial decisions</li>
            <li>Understand that past investment performance does not guarantee future results</li>
            <li>Make decisions based on your individual circumstances and risk tolerance</li>
          </ul>
          <p className="mt-4">The AI financial advisor provides general guidance and should not be relied upon as professional advice.</p>
        </>
      ),
    },
    {
      title: "8. Data Accuracy",
      content: (
        <>
          <p className="mb-3">You are responsible for the accuracy of financial data you input. We:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Do not verify the accuracy of user-inputted data</li>
            <li>Are not responsible for errors resulting from incorrect input</li>
            <li>May display market data with delays</li>
            <li>Use third-party exchange rates that may vary from actual rates</li>
          </ul>
        </>
      ),
    },
    {
      title: "9. Limitation of Liability",
      content: (
        <>
          <p className="mb-3">To the maximum extent permitted by law, Legio Finance shall not be liable for:</p>
          <ul className="list-disc pl-5 space-y-1.5 mb-4">
            <li>Any indirect, incidental, special, consequential, or punitive damages</li>
            <li>Loss of profits, revenue, data, or business opportunities</li>
            <li>Financial decisions made based on information from our service</li>
            <li>Service interruptions, technical issues, or data loss</li>
            <li>Unauthorized access due to compromised credentials</li>
            <li>Errors in third-party data (exchange rates, market prices)</li>
          </ul>
          <div className="bg-muted/40 rounded-lg p-4 border border-border/50">
            <p className="text-sm"><strong className="text-foreground">Maximum liability:</strong> Our total liability shall not exceed the amount you paid in the 12 months preceding the claim.</p>
          </div>
        </>
      ),
    },
    {
      title: "10. Intellectual Property",
      content: (
        <>
          <p className="mb-3">Legio Finance's design, features, content, and functionality are protected by international copyright, trademark, and other IP laws. You may not:</p>
          <ul className="list-disc pl-5 space-y-1.5 mb-4">
            <li>Copy, modify, or distribute our software or content</li>
            <li>Use our trademarks or branding without permission</li>
            <li>Create derivative works based on our service</li>
          </ul>
          <p>You retain full ownership of all financial data you input into the service.</p>
        </>
      ),
    },
    {
      title: "11. Account Termination",
      content: (
        <>
          <p className="mb-3">We may suspend or terminate your account if you:</p>
          <ul className="list-disc pl-5 space-y-1.5 mb-4">
            <li>Violate these Terms of Service</li>
            <li>Engage in fraudulent or illegal activities</li>
            <li>Fail to pay subscription fees when due</li>
            <li>Abuse our service or support resources</li>
          </ul>
          <p>Upon termination, you may request a data export within 30 days. After this period, data may be permanently deleted.</p>
        </>
      ),
    },
    {
      title: "12. Changes to Terms",
      content: (
        <>
          <p className="mb-3">We will notify you of material changes by:</p>
          <ul className="list-disc pl-5 space-y-1.5 mb-4">
            <li>Posting a notice on our website</li>
            <li>Sending an email to your registered address</li>
            <li>Displaying a notification at login</li>
          </ul>
          <p>Continued use after changes become effective constitutes acceptance of the revised terms.</p>
        </>
      ),
    },
    {
      title: "13. Governing Law & Disputes",
      content: (
        <>
          <p className="mb-3">These Terms shall be governed by and construed in accordance with the laws of the European Union and the applicable laws of the Netherlands, without regard to conflict of law principles.</p>
          <p>Disputes shall first be resolved through good-faith negotiation. If unresolved, they shall be submitted to the competent courts in the Netherlands.</p>
        </>
      ),
    },
    {
      title: "14. Contact Information",
      content: (
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { label: "Legal", email: "legal@legiofinance.com" },
            { label: "Support", email: "support@legiofinance.com" },
            { label: "Website", email: "www.legiofinance.com" },
          ].map((c) => (
            <div key={c.label} className="bg-muted/40 rounded-lg p-3 border border-border/50">
              <p className="text-xs text-muted-foreground mb-0.5">{c.label}</p>
              <p className="text-sm font-medium text-foreground">{c.email}</p>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-10 -left-40 w-80 h-80 bg-accent/8 rounded-full blur-3xl" />
        <div className="container relative mx-auto px-4 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-6 flex items-center justify-center shadow-lg">
            <FileText className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 10, 2026</p>
          <div className="flex justify-center gap-3 mt-5">
            <Badge variant="outline" className="text-xs">EU Compliant</Badge>
            <Badge variant="outline" className="text-xs">Stripe Payments</Badge>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Table of Contents */}
        <nav className="mb-14 p-6 rounded-2xl bg-muted/30 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-3">Table of Contents</h3>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {sections.map((s, i) => (
              <a key={i} href={`#terms-${i}`} className="text-sm text-muted-foreground hover:text-primary transition-colors py-0.5">
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        {/* Sections */}
        <div className="space-y-0">
          {sections.map((section, idx) => (
            <div key={idx} id={`terms-${idx}`} className="scroll-mt-24">
              {idx > 0 && <Separator className="my-10" />}
              <h2 className="text-xl font-bold text-foreground mb-4">{section.title}</h2>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Footer nav */}
        <div className="mt-16 p-6 rounded-2xl bg-muted/30 border border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            See also: <Link to="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
          </p>
          <a href="mailto:legal@legiofinance.com" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline">
            <Mail className="w-4 h-4" />
            legal@legiofinance.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
