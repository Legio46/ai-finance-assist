import { Database, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const DataGovernance = () => {
  const sections = [
    {
      title: "1. Data Governance Framework",
      content: (
        <p>Legio Finance maintains a formal Data Governance Framework designed to ensure the integrity, confidentiality, availability, and regulatory compliance of all personal and financial data processed through the Service. Our framework is based on internationally recognized standards including ISO/IEC 27001, NIST Cybersecurity Framework, and applicable financial industry regulations.</p>
      ),
    },
    {
      title: "2. GDPR Compliance Commitments",
      content: (
        <>
          <h4 className="font-semibold text-foreground mb-2 text-sm">2.1 Data Processing Principles</h4>
          <p className="mb-3">We adhere to the six core principles of the GDPR (Art. 5) in all processing activities:</p>
          <ul className="list-disc pl-5 space-y-1.5 mb-5">
            <li><strong className="text-foreground">Lawfulness, Fairness, and Transparency:</strong> Processing is lawful, fair, and transparent to data subjects</li>
            <li><strong className="text-foreground">Purpose Limitation:</strong> Data is collected for specified, explicit, and legitimate purposes</li>
            <li><strong className="text-foreground">Data Minimisation:</strong> We collect only data that is adequate, relevant, and limited to what is necessary</li>
            <li><strong className="text-foreground">Accuracy:</strong> We take reasonable steps to ensure personal data is kept accurate and up to date</li>
            <li><strong className="text-foreground">Storage Limitation:</strong> Data is retained only as long as necessary</li>
            <li><strong className="text-foreground">Integrity and Confidentiality:</strong> Appropriate security measures are applied</li>
          </ul>
          <h4 className="font-semibold text-foreground mb-2 text-sm">2.2 Records of Processing Activities</h4>
          <p className="mb-5">Pursuant to Art. 30 GDPR, we maintain comprehensive Records of Processing Activities (RoPAs) documenting all categories of processing, legal bases, purposes, data categories, recipient categories, international transfer mechanisms, and applicable retention schedules.</p>
          <h4 className="font-semibold text-foreground mb-2 text-sm">2.3 Data Protection Impact Assessments (DPIAs)</h4>
          <p className="mb-5">We conduct DPIAs pursuant to Art. 35 GDPR for all new processing activities likely to result in a high risk to data subjects' rights and freedoms, particularly in connection with new financial features, AI-driven analytics, or large-scale processing.</p>
          <h4 className="font-semibold text-foreground mb-2 text-sm">2.4 Data Protection by Design and Default</h4>
          <p>Privacy and data protection are embedded into our product development lifecycle from the initial design stage through implementation and beyond, consistent with Art. 25 GDPR.</p>
        </>
      ),
    },
    {
      title: "3. CCPA/CPRA Compliance",
      content: (
        <>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">"Do Not Sell or Share":</strong> We do not sell or share personal information to third parties for cross-context behavioral advertising</li>
            <li><strong className="text-foreground">Annual Privacy Rights Report:</strong> We publish an annual report disclosing the number of privacy rights requests received, complied with, denied, and median response times</li>
            <li><strong className="text-foreground">Sensitive Personal Information:</strong> We limit the use of sensitive personal information to purposes specified at collection</li>
          </ul>
        </>
      ),
    },
    {
      title: "4. Gramm-Leach-Bliley Act (GLBA) Compliance",
      content: (
        <p>To the extent applicable, we comply with the GLBA Financial Privacy Rule and Safeguards Rule. We provide annual privacy notices to customers, maintain a comprehensive information security program, and conduct regular risk assessments of our systems and processes.</p>
      ),
    },
    {
      title: "5. Payment Card Industry Data Security Standard (PCI-DSS)",
      content: (
        <p>Payment card transactions processed through the Service are handled in accordance with PCI-DSS standards. We do not store full payment card numbers on our servers. All cardholder data is processed through PCI-DSS-compliant third-party payment processors (Stripe).</p>
      ),
    },
    {
      title: "6. Anti-Money Laundering (AML) and Know Your Customer (KYC)",
      content: (
        <p>We comply with applicable AML and KYC regulations. Where required, we conduct identity verification procedures before permitting access to financial features. We maintain suspicious activity reporting (SAR) procedures and cooperate with relevant financial intelligence authorities as required by law.</p>
      ),
    },
    {
      title: "7. Data Security Measures",
      content: (
        <>
          <h4 className="font-semibold text-foreground mb-2 text-sm">7.1 Technical Controls</h4>
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            {[
              { label: "Encryption", desc: "AES-256 at rest, TLS 1.3 minimum in transit" },
              { label: "Access Controls", desc: "RBAC and principle of least privilege" },
              { label: "Authentication", desc: "MFA for all staff accessing production" },
              { label: "Network Security", desc: "WAF, IDS/IPS, continuous monitoring" },
              { label: "Vulnerability Mgmt", desc: "Regular automated scanning, annual pen tests" },
              { label: "Incident Response", desc: "Formal plan with 72-hour breach notification" },
            ].map((item) => (
              <div key={item.label} className="bg-muted/40 rounded-lg p-3 border border-border/50">
                <p className="font-semibold text-foreground text-xs mb-0.5">{item.label}</p>
                <p className="text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
          <h4 className="font-semibold text-foreground mb-2 text-sm">7.2 Organizational Controls</h4>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Mandatory security awareness training for all staff with access to personal data</li>
            <li>Data processing agreements (DPAs) with all sub-processors</li>
            <li>Regular security audits and assessments</li>
            <li>Formal incident response and breach notification procedures</li>
            <li>Background checks for personnel with access to sensitive financial data</li>
          </ul>
        </>
      ),
    },
    {
      title: "8. Data Breach Response",
      content: (
        <ul className="list-disc pl-5 space-y-2">
          <li><strong className="text-foreground">GDPR:</strong> Notification to the relevant supervisory authority within 72 hours. Affected data subjects notified without undue delay where the breach results in high risk</li>
          <li><strong className="text-foreground">CCPA:</strong> Notification to affected California residents in accordance with California Civil Code Section 1798.82</li>
          <li><strong className="text-foreground">State Law:</strong> Compliance with applicable state data breach notification laws in all U.S. jurisdictions</li>
        </ul>
      ),
    },
    {
      title: "9. Sub-Processor Management",
      content: (
        <p>We maintain a current list of sub-processors (available upon request at <a href="mailto:dpo@legiofinance.com" className="text-primary hover:underline font-medium">dpo@legiofinance.com</a>). We perform due diligence on all sub-processors before engagement and require all sub-processors to enter into binding DPAs ensuring equivalent levels of data protection.</p>
      ),
    },
    {
      title: "10. International Data Transfer Safeguards",
      content: (
        <p>All international transfers of personal data from the EEA, UK, or Switzerland to third countries are conducted in compliance with applicable data transfer mechanisms including the EU Standard Contractual Clauses (SCCs) (2021), UK IDTA, or other applicable safeguards. We continuously monitor developments in cross-border data transfer requirements.</p>
      ),
    },
    {
      title: "11. Regulatory Authority Contacts",
      content: (
        <p>Users in the EEA may lodge complaints with their local Data Protection Authority. UK users may contact the Information Commissioner's Office (ICO). California users may contact the California Privacy Protection Agency (CPPA). We cooperate fully with all competent regulatory authorities.</p>
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
            <Database className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">Data Governance & Compliance</h1>
          <p className="text-muted-foreground">Last updated: April 6, 2025</p>
          <div className="flex justify-center gap-3 mt-5">
            <Badge variant="outline" className="text-xs">ISO 27001</Badge>
            <Badge variant="outline" className="text-xs">NIST Framework</Badge>
            <Badge variant="outline" className="text-xs">PCI-DSS</Badge>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <nav className="mb-14 p-6 rounded-2xl bg-muted/30 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-3">Table of Contents</h3>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {sections.map((s, i) => (
              <a key={i} href={`#dg-${i}`} className="text-sm text-muted-foreground hover:text-primary transition-colors py-0.5">
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="space-y-0">
          {sections.map((section, idx) => (
            <div key={idx} id={`dg-${idx}`} className="scroll-mt-24">
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
            <Link to="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
            <Link to="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link>
            <Link to="/ip-policy" className="text-primary hover:underline font-medium">IP Policy</Link>
          </div>
          <a href="mailto:dpo@legiofinance.com" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline">
            <Mail className="w-4 h-4" />
            dpo@legiofinance.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default DataGovernance;
