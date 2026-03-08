import { Shield, FileText, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "Introduction",
      content: (
        <p>Legio Finance ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our financial management platform. By using Legio Finance, you consent to the practices described in this policy.</p>
      ),
    },
    {
      title: "1. Information We Collect",
      content: (
        <>
          <h4 className="font-semibold text-foreground mb-2 text-sm">Account Information</h4>
          <ul className="list-disc pl-5 space-y-1.5 mb-5">
            <li>Full name and email address</li>
            <li>Password (encrypted and securely stored)</li>
            <li>Account type preference (personal or business)</li>
            <li>Country of residence</li>
            <li>Phone number (optional, for two-factor authentication)</li>
          </ul>
          <h4 className="font-semibold text-foreground mb-2 text-sm">Financial Data You Provide</h4>
          <ul className="list-disc pl-5 space-y-1.5 mb-5">
            <li>Expense records (amounts, categories, descriptions, dates)</li>
            <li>Income sources and amounts</li>
            <li>Credit card information (card names, last 4 digits, balances — we never store full card numbers)</li>
            <li>Budget settings and financial goals</li>
            <li>Investment holdings (names, quantities, purchase prices)</li>
            <li>Recurring payment information</li>
            <li>Receipt images you upload</li>
          </ul>
          <h4 className="font-semibold text-foreground mb-2 text-sm">Automatically Collected Information</h4>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Device information (browser type, operating system)</li>
            <li>IP address and approximate location</li>
            <li>Usage data (features used, pages visited, time spent)</li>
            <li>Login timestamps and session information</li>
          </ul>
        </>
      ),
    },
    {
      title: "2. How We Use Your Information",
      content: (
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Provide our services:</strong> Process and display your financial data, generate reports and insights, track your goals and budgets</li>
          <li><strong className="text-foreground">AI Financial Advisor:</strong> Analyze your financial patterns to provide personalized suggestions (Pro plan only)</li>
          <li><strong className="text-foreground">Account management:</strong> Create and maintain your account, process subscription payments, send account-related notifications</li>
          <li><strong className="text-foreground">Security:</strong> Detect and prevent fraud, unauthorized access, and other security threats</li>
          <li><strong className="text-foreground">Improvement:</strong> Analyze usage patterns to improve our features and user experience</li>
          <li><strong className="text-foreground">Communication:</strong> Respond to your inquiries, send important updates about our service</li>
          <li><strong className="text-foreground">Legal compliance:</strong> Meet our legal and regulatory obligations</li>
        </ul>
      ),
    },
    {
      title: "3. Data Sharing and Disclosure",
      content: (
        <>
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 mb-5">
            <p className="font-semibold text-foreground text-sm">We do not sell your personal or financial data.</p>
          </div>
          <p className="mb-3">We may share your information only in these circumstances:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">Service Providers:</strong> Trusted third parties — Stripe (payment processing), Supabase (data storage & authentication), cloud hosting providers</li>
            <li><strong className="text-foreground">Legal Requirements:</strong> When required by law, court order, or government request</li>
            <li><strong className="text-foreground">Protection of Rights:</strong> To protect the rights, property, or safety of Legio Finance, our users, or the public</li>
            <li><strong className="text-foreground">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (you would be notified)</li>
            <li><strong className="text-foreground">With Your Consent:</strong> When you explicitly authorize us to share specific information</li>
          </ul>
        </>
      ),
    },
    {
      title: "4. Data Security",
      content: (
        <>
          <p className="mb-3">We implement robust security measures to protect your financial data:</p>
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            {[
              { label: "Encryption", desc: "TLS/SSL in transit, AES-256 at rest" },
              { label: "Authentication", desc: "Secure hashing, optional 2FA" },
              { label: "Access Controls", desc: "Strict role-based system access" },
              { label: "Infrastructure", desc: "Enterprise-grade cloud with audits" },
              { label: "Monitoring", desc: "Continuous threat detection" },
              { label: "Payments", desc: "Stripe PCI-DSS compliant processing" },
            ].map((item) => (
              <div key={item.label} className="bg-muted/40 rounded-lg p-3 border border-border/50">
                <p className="font-semibold text-foreground text-xs mb-0.5">{item.label}</p>
                <p className="text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
          <p>While we use industry-standard security practices, no system is 100% secure. We encourage you to use a strong, unique password and enable two-factor authentication.</p>
        </>
      ),
    },
    {
      title: "5. Your Rights (GDPR & Global Privacy)",
      content: (
        <>
          <p className="mb-3">Depending on your location, you have the following rights:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">Access:</strong> Request a copy of the personal data we hold about you</li>
            <li><strong className="text-foreground">Rectification:</strong> Correct inaccurate or incomplete data</li>
            <li><strong className="text-foreground">Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
            <li><strong className="text-foreground">Portability:</strong> Export your data in a machine-readable format (CSV/PDF)</li>
            <li><strong className="text-foreground">Restriction:</strong> Request we limit processing in certain circumstances</li>
            <li><strong className="text-foreground">Objection:</strong> Object to processing based on legitimate interests</li>
            <li><strong className="text-foreground">Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
          </ul>
          <p className="mt-4">To exercise these rights, contact us at <a href="mailto:privacy@legiofinance.com" className="text-primary hover:underline font-medium">privacy@legiofinance.com</a>. We will respond within 30 days.</p>
        </>
      ),
    },
    {
      title: "6. Data Retention",
      content: (
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Active accounts:</strong> Data retained as long as your account is active</li>
          <li><strong className="text-foreground">Cancelled accounts:</strong> Data retained for 30 days, then permanently deleted</li>
          <li><strong className="text-foreground">Financial records:</strong> May be retained up to 7 years for legal/tax compliance</li>
          <li><strong className="text-foreground">Security logs:</strong> Retained for up to 12 months</li>
        </ul>
      ),
    },
    {
      title: "7. Cookies and Tracking",
      content: (
        <>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><strong className="text-foreground">Essential cookies:</strong> Login sessions and security (required)</li>
            <li><strong className="text-foreground">Preference cookies:</strong> Theme, language, and currency settings</li>
            <li><strong className="text-foreground">Analytics cookies:</strong> Usage insights to improve service</li>
          </ul>
          <p>We do not use cookies for advertising. You can manage cookie preferences through your browser settings.</p>
        </>
      ),
    },
    {
      title: "8. International Data Transfers",
      content: (
        <>
          <p className="mb-3">Your data may be processed in the EU (primary) and US (certain providers). We ensure safeguards through:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>EU Standard Contractual Clauses</li>
            <li>Data processing agreements with all service providers</li>
            <li>Full GDPR compliance for transfers outside the EEA</li>
          </ul>
        </>
      ),
    },
    {
      title: "9. Children's Privacy",
      content: (
        <p>Legio Finance is not intended for users under 18. We do not knowingly collect information from children. If you believe a child has provided us with personal data, please contact <a href="mailto:privacy@legiofinance.com" className="text-primary hover:underline font-medium">privacy@legiofinance.com</a>.</p>
      ),
    },
    {
      title: "10. Third-Party Services",
      content: (
        <p>Our service may link to third-party websites or integrate with external services for market data. We are not responsible for their privacy practices and encourage you to review their policies.</p>
      ),
    },
    {
      title: "11. Policy Changes",
      content: (
        <>
          <p className="mb-3">When we make material changes, we will:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Update the "Last updated" date</li>
            <li>Notify you via email for significant changes</li>
            <li>Display a notice within the application</li>
          </ul>
        </>
      ),
    },
    {
      title: "12. Contact Us",
      content: (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: "Privacy inquiries", email: "privacy@legiofinance.com" },
              { label: "General support", email: "support@legiofinance.com" },
              { label: "Data Protection Officer", email: "dpo@legiofinance.com" },
              { label: "Website", email: "www.legiofinance.com" },
            ].map((c) => (
              <div key={c.label} className="bg-muted/40 rounded-lg p-3 border border-border/50">
                <p className="text-xs text-muted-foreground mb-0.5">{c.label}</p>
                <p className="text-sm font-medium text-foreground">{c.email}</p>
              </div>
            ))}
          </div>
          <p className="text-sm mt-4">For EU residents: You have the right to lodge a complaint with your local data protection authority.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-10 -right-40 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
        <div className="container relative mx-auto px-4 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-6 flex items-center justify-center shadow-lg">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 10, 2026</p>
          <div className="flex justify-center gap-3 mt-5">
            <Badge variant="outline" className="text-xs">GDPR Compliant</Badge>
            <Badge variant="outline" className="text-xs">AES-256 Encryption</Badge>
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
              <a key={i} href={`#privacy-${i}`} className="text-sm text-muted-foreground hover:text-primary transition-colors py-0.5">
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        {/* Sections */}
        <div className="space-y-0">
          {sections.map((section, idx) => (
            <div key={idx} id={`privacy-${idx}`} className="scroll-mt-24">
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
            See also: <Link to="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link>
          </p>
          <a href="mailto:privacy@legiofinance.com" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline">
            <Mail className="w-4 h-4" />
            privacy@legiofinance.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
