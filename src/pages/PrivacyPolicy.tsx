import { Shield, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "1. Identity of the Data Controller",
      content: (
        <>
          <p className="mb-3">Legio Finance (hereinafter referred to as "Company," "we," "us," or "our") operates the legiofinance.com website and the associated financial management platform (collectively, the "Service"). For purposes of applicable data protection laws, including the GDPR, the Company acts as the Data Controller with respect to the personal data of its users.</p>
          <div className="bg-muted/40 rounded-lg p-4 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Contact Information for Data Protection Inquiries</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong className="text-foreground">Data Protection Officer (DPO):</strong> dpo@legiofinance.com</li>
              <li><strong className="text-foreground">Privacy Inquiries:</strong> privacy@legiofinance.com</li>
            </ul>
          </div>
        </>
      ),
    },
    {
      title: "2. Scope and Applicability",
      content: (
        <p>This Privacy Policy applies to all personal data collected, processed, stored, or transmitted through our Service, including but not limited to data provided during account registration, service use, communications with our support team, and automatic data collection through cookies and similar technologies.</p>
      ),
    },
    {
      title: "3. Categories of Personal Data We Collect",
      content: (
        <>
          <h4 className="font-semibold text-foreground mb-2 text-sm">3.1 Data You Provide Directly</h4>
          <ul className="list-disc pl-5 space-y-1.5 mb-5">
            <li><strong className="text-foreground">Identity Data:</strong> Full legal name, date of birth, government-issued identification numbers (where required by KYC/AML regulations)</li>
            <li><strong className="text-foreground">Contact Data:</strong> Email address, phone number, mailing address</li>
            <li><strong className="text-foreground">Financial Data:</strong> Bank account information, credit/debit card details, investment portfolio information, transaction history, financial goals and preferences</li>
            <li><strong className="text-foreground">Authentication Data:</strong> Username, password (hashed and salted), multi-factor authentication credentials</li>
            <li><strong className="text-foreground">Communications Data:</strong> Messages sent through our platform, support tickets, survey responses</li>
          </ul>
          <h4 className="font-semibold text-foreground mb-2 text-sm">3.2 Data Collected Automatically</h4>
          <ul className="list-disc pl-5 space-y-1.5 mb-5">
            <li><strong className="text-foreground">Technical Data:</strong> IP address, browser type and version, operating system, device identifiers, time zone, and geolocation data</li>
            <li><strong className="text-foreground">Usage Data:</strong> Pages visited, features accessed, search queries, click patterns, session duration, and referral URLs</li>
            <li><strong className="text-foreground">Cookie Data:</strong> Session cookies, persistent cookies, and similar tracking technologies</li>
          </ul>
          <h4 className="font-semibold text-foreground mb-2 text-sm">3.3 Data from Third Parties</h4>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Financial institution data received through open banking APIs or authorized integrations</li>
            <li>Identity verification data from KYC/AML service providers</li>
            <li>Credit data from credit reporting agencies where applicable and authorized</li>
          </ul>
        </>
      ),
    },
    {
      title: "4. Legal Bases for Processing (GDPR Compliance)",
      content: (
        <>
          <p className="mb-3">We process your personal data only where we have a lawful basis to do so under Article 6 of the GDPR:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">Contract Performance (Art. 6(1)(b)):</strong> Processing necessary to provide the financial management services you have requested</li>
            <li><strong className="text-foreground">Legal Obligation (Art. 6(1)(c)):</strong> Processing required to comply with applicable laws, including AML, KYC, tax reporting, and financial regulatory requirements</li>
            <li><strong className="text-foreground">Legitimate Interests (Art. 6(1)(f)):</strong> Processing necessary for fraud prevention, platform security, and service improvement</li>
            <li><strong className="text-foreground">Consent (Art. 6(1)(a)):</strong> Marketing communications and non-essential cookies, which you may withdraw at any time</li>
            <li><strong className="text-foreground">Vital Interests (Art. 6(1)(d)):</strong> In rare circumstances, processing necessary to protect life</li>
          </ul>
          <p className="mt-3">For special categories of data (Art. 9 GDPR), we rely on explicit consent or legal obligation bases.</p>
        </>
      ),
    },
    {
      title: "5. Purposes of Processing",
      content: (
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Account creation, verification, and management</li>
          <li>Delivery of financial management features, budgeting tools, and analytics</li>
          <li>Transaction processing and financial record-keeping</li>
          <li>Fraud detection, identity verification, and security monitoring</li>
          <li>Regulatory compliance including AML, KYC, and tax obligations</li>
          <li>Customer support and dispute resolution</li>
          <li>Product improvement, research, and analytics (using anonymized or aggregated data where possible)</li>
          <li>Legal proceedings and enforcement of our Terms of Use</li>
        </ul>
      ),
    },
    {
      title: "6. Data Retention",
      content: (
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">Financial and transactional records:</strong> Retained for a minimum of seven (7) years to comply with applicable financial and tax regulations</li>
          <li><strong className="text-foreground">Account data:</strong> Retained for the duration of the account plus five (5) years post-closure</li>
          <li><strong className="text-foreground">Marketing data:</strong> Retained until consent is withdrawn</li>
          <li>You may request deletion of data not subject to mandatory retention obligations</li>
        </ul>
      ),
    },
    {
      title: "7. Data Sharing and Third-Party Disclosures",
      content: (
        <>
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 mb-5">
            <p className="font-semibold text-foreground text-sm">We do not sell, rent, or trade your personal data to third parties for their own marketing purposes.</p>
          </div>
          <p className="mb-3">We may share your data with:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">Service Providers:</strong> Payment processors (Stripe), cloud hosting providers (Supabase), analytics services, and cybersecurity vendors operating under strict data processing agreements</li>
            <li><strong className="text-foreground">Financial Institutions:</strong> As necessary to complete transactions or fulfill regulatory obligations</li>
            <li><strong className="text-foreground">Regulatory Bodies and Law Enforcement:</strong> Where required by applicable law, court order, or regulatory mandate</li>
            <li><strong className="text-foreground">Professional Advisors:</strong> Lawyers, auditors, and insurers under confidentiality obligations</li>
            <li><strong className="text-foreground">Business Transfers:</strong> In connection with a merger, acquisition, or asset sale, subject to equivalent privacy protections</li>
          </ul>
          <p className="mt-3">All third-party data processors are required to enter into Data Processing Agreements (DPAs) pursuant to Art. 28 GDPR.</p>
        </>
      ),
    },
    {
      title: "8. International Data Transfers",
      content: (
        <p>Where your data is transferred outside the European Economic Area (EEA) or outside the United States, we ensure adequate protections are in place including: Standard Contractual Clauses (SCCs) approved by the European Commission; adequacy decisions; Binding Corporate Rules; or other legally recognized transfer mechanisms. Users in the EEA have the right to obtain copies of applicable transfer safeguards by contacting our DPO.</p>
      ),
    },
    {
      title: "9. Your Data Rights",
      content: (
        <>
          <h4 className="font-semibold text-foreground mb-2 text-sm">9.1 Rights Under GDPR (EEA/UK Users)</h4>
          <ul className="list-disc pl-5 space-y-1.5 mb-5">
            <li><strong className="text-foreground">Right of Access (Art. 15):</strong> Obtain confirmation of whether and how we process your data, and receive a copy</li>
            <li><strong className="text-foreground">Right to Rectification (Art. 16):</strong> Request correction of inaccurate or incomplete data</li>
            <li><strong className="text-foreground">Right to Erasure / "Right to be Forgotten" (Art. 17):</strong> Request deletion subject to legal retention requirements</li>
            <li><strong className="text-foreground">Right to Restriction (Art. 18):</strong> Request limitation of processing in certain circumstances</li>
            <li><strong className="text-foreground">Right to Data Portability (Art. 20):</strong> Receive your data in a structured, machine-readable format</li>
            <li><strong className="text-foreground">Right to Object (Art. 21):</strong> Object to processing based on legitimate interests or for direct marketing</li>
            <li><strong className="text-foreground">Right to Withdraw Consent (Art. 7(3)):</strong> Withdraw consent at any time without affecting prior lawful processing</li>
            <li><strong className="text-foreground">Right to Lodge a Complaint:</strong> With your national Data Protection Authority (DPA)</li>
          </ul>
          <h4 className="font-semibold text-foreground mb-2 text-sm">9.2 Rights Under CCPA/CPRA (California Residents)</h4>
          <ul className="list-disc pl-5 space-y-1.5 mb-4">
            <li><strong className="text-foreground">Right to Know:</strong> Request disclosure of personal information collected, used, disclosed, or sold in the preceding 12 months</li>
            <li><strong className="text-foreground">Right to Delete:</strong> Request deletion of personal information, subject to certain exceptions</li>
            <li><strong className="text-foreground">Right to Correct:</strong> Request correction of inaccurate personal information</li>
            <li><strong className="text-foreground">Right to Opt-Out of Sale or Sharing:</strong> We do not sell personal data</li>
            <li><strong className="text-foreground">Right to Non-Discrimination:</strong> Exercise your rights without receiving discriminatory treatment</li>
          </ul>
          <p>To exercise any of your rights, submit a verifiable request to: <a href="mailto:privacy@legiofinance.com" className="text-primary hover:underline font-medium">privacy@legiofinance.com</a>. We will respond within 30 days (GDPR) or 45 days (CCPA).</p>
        </>
      ),
    },
    {
      title: "10. Cookies and Tracking Technologies",
      content: (
        <p>We use cookies and similar technologies for essential platform functionality, security, analytics, and where you have consented, personalization. You may manage your cookie preferences through our Cookie Consent Manager accessible at any time. Essential cookies cannot be disabled as they are necessary for platform operation.</p>
      ),
    },
    {
      title: "11. Security",
      content: (
        <>
          <p className="mb-3">We implement industry-standard technical and organizational security measures including:</p>
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            {[
              { label: "Encryption", desc: "AES-256 at rest, TLS 1.3 in transit" },
              { label: "Authentication", desc: "Secure hashing, 2FA support" },
              { label: "Access Controls", desc: "Role-based access (RBAC), least privilege" },
              { label: "Monitoring", desc: "Continuous threat detection, WAF, IDS/IPS" },
              { label: "Testing", desc: "Regular vulnerability scanning, annual penetration testing" },
              { label: "Payments", desc: "Stripe PCI-DSS compliant processing" },
            ].map((item) => (
              <div key={item.label} className="bg-muted/40 rounded-lg p-3 border border-border/50">
                <p className="font-semibold text-foreground text-xs mb-0.5">{item.label}</p>
                <p className="text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
          <p>In the event of a personal data breach likely to result in a risk to your rights and freedoms, we will notify the relevant supervisory authority within 72 hours (GDPR) and affected users without undue delay.</p>
        </>
      ),
    },
    {
      title: "12. Children's Privacy",
      content: (
        <p>Our Service is not directed to individuals under the age of 18 (or the applicable age of majority in their jurisdiction). We do not knowingly collect personal data from minors. If you believe we have inadvertently collected data from a minor, please contact us immediately at <a href="mailto:privacy@legiofinance.com" className="text-primary hover:underline font-medium">privacy@legiofinance.com</a> and we will promptly delete such information.</p>
      ),
    },
    {
      title: "13. Changes to This Privacy Policy",
      content: (
        <p>We reserve the right to update this Privacy Policy at any time. Material changes will be communicated via email to registered users or through a prominent notice on our platform at least 30 days prior to taking effect. Continued use of the Service after the effective date constitutes acceptance of the revised policy.</p>
      ),
    },
    {
      title: "14. Contact Us",
      content: (
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "Privacy Inquiries", email: "privacy@legiofinance.com" },
            { label: "Data Protection Officer", email: "dpo@legiofinance.com" },
            { label: "General Support", email: "support@legiofinance.com" },
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
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-10 -right-40 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
        <div className="container relative mx-auto px-4 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-6 flex items-center justify-center shadow-lg">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: April 6, 2025</p>
          <p className="text-sm text-muted-foreground mt-1">GDPR • CCPA • COPPA • FINRA Compliant</p>
          <div className="flex justify-center gap-3 mt-5">
            <Badge variant="outline" className="text-xs">GDPR Compliant</Badge>
            <Badge variant="outline" className="text-xs">CCPA/CPRA Compliant</Badge>
            <Badge variant="outline" className="text-xs">AES-256 Encryption</Badge>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="bg-destructive/5 border border-destructive/15 rounded-xl p-4 mb-10">
          <p className="text-sm"><strong className="text-foreground">Important Legal Notice:</strong> This document constitutes a legally binding agreement between you and Legio Finance. Please read all sections carefully before using this platform. By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by all terms contained herein.</p>
        </div>

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

        <div className="mt-16 p-6 rounded-2xl bg-muted/30 border border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link>
            <Link to="/data-governance" className="text-primary hover:underline font-medium">Data Governance</Link>
            <Link to="/ip-policy" className="text-primary hover:underline font-medium">IP Policy</Link>
          </div>
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
