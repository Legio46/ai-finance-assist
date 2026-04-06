import { FileText, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: (
        <p>These Terms of Use ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Legio Finance governing your access to and use of the legiofinance.com website and the associated financial management platform (collectively, the "Service"). By creating an account, clicking "I Agree," or otherwise accessing the Service, you represent that: (a) you have read and understood these Terms; (b) you are at least 18 years of age; (c) you have the legal capacity to enter into binding contracts; and (d) you agree to be bound by these Terms and our Privacy Policy, which is incorporated herein by reference.</p>
      ),
    },
    {
      title: "2. Eligibility",
      content: (
        <ul className="list-disc pl-5 space-y-1.5">
          <li>You must be at least 18 years of age to use the Service</li>
          <li>You must not be prohibited from using the Service under any applicable law</li>
          <li>You must not have had a previous account terminated for violation of these Terms</li>
          <li>If accessing the Service on behalf of an entity, you represent that you have authority to bind that entity</li>
        </ul>
      ),
    },
    {
      title: "3. Account Registration and Security",
      content: (
        <p>To access certain features, you must register for an account. You agree to: (a) provide accurate, current, and complete registration information; (b) promptly update your information to maintain its accuracy; (c) maintain the confidentiality of your account credentials; (d) not share account access with any third party; and (e) immediately notify us of any unauthorized use of your account. You are solely responsible for all activity occurring under your account. We reserve the right to suspend or terminate accounts that display signs of unauthorized access or fraudulent activity.</p>
      ),
    },
    {
      title: "4. Description of Services",
      content: (
        <>
          <p className="mb-3">The Service provides personal and business financial management tools including budgeting, expense tracking, financial analytics, report generation, and related features. The Service is provided for informational and personal financial management purposes only.</p>
          <div className="bg-destructive/5 border border-destructive/15 rounded-xl p-4 mb-5">
            <p className="font-semibold text-foreground text-sm mb-1">⚠️ Disclaimer</p>
            <p className="text-xs">The Service does not constitute financial, investment, tax, legal, or other professional advice. Any financial data, projections, or analyses provided through the Service are for informational purposes only. You should consult a qualified professional before making any financial decisions. We are not a registered investment advisor, broker-dealer, or fiduciary.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
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
        </>
      ),
    },
    {
      title: "5. Acceptable Use Policy",
      content: (
        <>
          <p className="mb-3">You agree to use the Service only for lawful purposes. You expressly agree NOT to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Use the Service for any fraudulent, deceptive, or illegal purpose, including money laundering or tax evasion</li>
            <li>Access or attempt to access accounts, systems, or data you are not authorized to access</li>
            <li>Upload, transmit, or distribute viruses, malware, or other harmful code</li>
            <li>Attempt to reverse-engineer, decompile, disassemble, or derive the source code of the Service</li>
            <li>Scrape, crawl, or use automated means to collect data without prior written consent</li>
            <li>Interfere with or disrupt the integrity or performance of the Service</li>
            <li>Impersonate any person or entity or misrepresent your affiliation</li>
            <li>Violate any applicable local, national, or international law or regulation</li>
          </ul>
          <p className="mt-3">Violation may result in immediate account suspension or termination, and may be reported to law enforcement.</p>
        </>
      ),
    },
    {
      title: "6. Fees, Billing, and Cancellation",
      content: (
        <>
          <p className="mb-3">Certain features require payment. By providing payment information, you authorize us to charge applicable fees.</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>All new subscriptions include a <strong className="text-foreground">7-day free trial</strong></li>
            <li>Subscription fees are billed in advance on a recurring basis</li>
            <li>All fees are non-refundable except as expressly provided in our Refund Policy or as required by applicable law</li>
            <li>Refunds may be requested within 14 days of a charge for unused service</li>
            <li>You may cancel your subscription at any time; cancellation takes effect at the end of the current billing period</li>
            <li>Payments processed securely through Stripe</li>
            <li>Prices in EUR, subject to applicable taxes</li>
          </ul>
        </>
      ),
    },
    {
      title: "7. Limitation of Liability",
      content: (
        <>
          <p className="mb-3 uppercase text-xs font-semibold text-foreground">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, LEGIO FINANCE SHALL NOT BE LIABLE FOR:</p>
          <ul className="list-disc pl-5 space-y-1.5 mb-4">
            <li>Any indirect, incidental, special, consequential, or punitive damages</li>
            <li>Loss of profits, revenue, data, business opportunities, or goodwill</li>
            <li>Financial losses or investment decisions made in reliance on Service data</li>
            <li>Unauthorized access to or alteration of your data</li>
            <li>Any matter beyond our reasonable control</li>
          </ul>
          <div className="bg-muted/40 rounded-lg p-4 border border-border/50">
            <p className="text-sm"><strong className="text-foreground">Maximum liability:</strong> Our total aggregate liability shall not exceed the greater of (A) the amounts paid by you in the 12 months immediately preceding the claim, or (B) €100.00.</p>
          </div>
        </>
      ),
    },
    {
      title: "8. Disclaimer of Warranties",
      content: (
        <p className="uppercase text-xs">THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF DEALING. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES. WE MAKE NO WARRANTY REGARDING THE ACCURACY, COMPLETENESS, OR TIMELINESS OF ANY FINANCIAL DATA OR CALCULATIONS PROVIDED THROUGH THE SERVICE.</p>
      ),
    },
    {
      title: "9. Indemnification",
      content: (
        <p>You agree to defend, indemnify, and hold harmless Legio Finance and its officers, directors, employees, agents, and successors from and against any claims, liabilities, damages, losses, and expenses arising out of or connected with: (a) your access to or use of the Service; (b) your violation of these Terms; (c) your violation of any third-party rights, including intellectual property rights; (d) your violation of any applicable law or regulation; or (e) any information you submit through the Service.</p>
      ),
    },
    {
      title: "10. Governing Law and Jurisdiction",
      content: (
        <p>These Terms shall be governed by and construed in accordance with the laws of the European Union and the applicable laws of the Netherlands, without regard to conflict of law principles. Subject to the arbitration clause below, you consent to the exclusive jurisdiction of the courts located in the Netherlands.</p>
      ),
    },
    {
      title: "11. Dispute Resolution — Binding Arbitration",
      content: (
        <>
          <div className="bg-destructive/5 border border-destructive/15 rounded-xl p-4 mb-4">
            <p className="font-semibold text-foreground text-sm">⚠️ IMPORTANT: This section affects your legal rights.</p>
          </div>
          <p className="mb-3">Any dispute arising out of or relating to these Terms or the Service (except disputes relating to intellectual property rights) shall be resolved exclusively through final and binding arbitration, rather than in court. You agree that you may only bring claims on an individual basis and not as a plaintiff or class member in any purported class or representative action.</p>
          <p>You may opt out of this arbitration agreement by sending written notice to <a href="mailto:legal@legiofinance.com" className="text-primary hover:underline font-medium">legal@legiofinance.com</a> within 30 days of first accepting these Terms.</p>
        </>
      ),
    },
    {
      title: "12. Modifications to Terms",
      content: (
        <p>We reserve the right to modify these Terms at any time. We will provide notice of material changes via email or a prominent notice on the Service at least 15 days before the changes take effect. Continued use constitutes acceptance. If you do not agree to the modified Terms, you must cease using the Service.</p>
      ),
    },
    {
      title: "13. Termination",
      content: (
        <>
          <p className="mb-3">We may suspend or terminate your account for conduct that violates these Terms, is harmful to others, or for any other reason at our discretion.</p>
          <p>Upon termination, your right to use the Service immediately ceases. All provisions that by their nature should survive termination shall survive, including intellectual property rights, warranty disclaimers, indemnification, and limitation of liability. You may request a data export within 30 days of termination.</p>
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
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-10 -left-40 w-80 h-80 bg-accent/8 rounded-full blur-3xl" />
        <div className="container relative mx-auto px-4 py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-6 flex items-center justify-center shadow-lg">
            <FileText className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: April 6, 2025</p>
          <div className="flex justify-center gap-3 mt-5">
            <Badge variant="outline" className="text-xs">EU Compliant</Badge>
            <Badge variant="outline" className="text-xs">GDPR</Badge>
            <Badge variant="outline" className="text-xs">Stripe Payments</Badge>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="bg-destructive/5 border border-destructive/15 rounded-xl p-4 mb-10">
          <p className="text-sm"><strong className="text-foreground">PLEASE READ THESE TERMS CAREFULLY.</strong> By accessing or using our Service, you agree to be legally bound by these Terms. If you do not agree, do not access or use the Service.</p>
        </div>

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

        <div className="mt-16 p-6 rounded-2xl bg-muted/30 border border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
            <Link to="/data-governance" className="text-primary hover:underline font-medium">Data Governance</Link>
            <Link to="/ip-policy" className="text-primary hover:underline font-medium">IP Policy</Link>
          </div>
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
