import { Copyright, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const IPPolicy = () => {
  const sections = [
    {
      title: "1. Ownership of Intellectual Property",
      content: (
        <p>Unless otherwise expressly stated, the Service and all of its contents, features, and functionality — including but not limited to all information, software, source code, text, displays, images, graphics, audio, video, data compilations, algorithms, user interface designs, and the selection and arrangement thereof — are owned by Legio Finance, its licensors, or other providers of such material, and are protected by United States and international laws governing copyright, trademark, patent, trade secret, and other intellectual property rights. No right, title, or interest in or to the Service or any content therein is transferred to you by virtue of these Terms, and all rights not expressly granted are reserved by the Company.</p>
      ),
    },
    {
      title: "2. Trademarks",
      content: (
        <p>The Legio Finance name, logo, and all related names, logos, product and service names, designs, and slogans are trademarks of Legio Finance or its affiliates. You may not use such marks without prior written permission from us. All other trademarks, service marks, and logos used in connection with the Service are the trademarks of their respective owners.</p>
      ),
    },
    {
      title: "3. Limited License to Users",
      content: (
        <>
          <p className="mb-3">Subject to your compliance with our Terms, we grant you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Service for your personal, non-commercial financial management purposes. This license does not include any right to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Reproduce, modify, distribute, or create derivative works of the Service or its content</li>
            <li>Publicly display or perform any content from the Service</li>
            <li>Use any data mining, robots, scraping, or similar automated data gathering tools</li>
            <li>Download, copy, or cache any portion of the Service for purposes other than personal use</li>
            <li>Frame or mirror any part of the Service without prior written authorization</li>
          </ul>
          <p className="mt-3">Any use of the Service not expressly permitted is a breach and may violate copyright, trademark, and other applicable laws.</p>
        </>
      ),
    },
    {
      title: "4. User-Generated Content",
      content: (
        <>
          <p className="mb-3">By submitting any content to the Service ("User Content"), you represent and warrant that: (a) you own or have all necessary rights; (b) the content does not infringe any third party's intellectual property rights; and (c) the content complies with applicable law.</p>
          <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
            <p className="text-sm"><strong className="text-foreground">You retain ownership of your User Content.</strong> By providing User Content, you grant us a limited, non-exclusive, worldwide, royalty-free license to use, store, process, and display such content solely as necessary to provide the Service to you. We do not claim ownership of your User Content and will not use it for any other purpose without your consent.</p>
          </div>
        </>
      ),
    },
    {
      title: "5. Copyright Infringement — DMCA Notice and Takedown",
      content: (
        <>
          <p className="mb-3">If you believe any content available through the Service infringes your copyright, please provide our Designated Copyright Agent with the following information:</p>
          <ul className="list-disc pl-5 space-y-1.5 mb-4">
            <li>A physical or electronic signature of the copyright owner or an authorized agent</li>
            <li>Identification of the copyrighted work(s) claimed to have been infringed</li>
            <li>Identification of the allegedly infringing material and sufficient information to locate it</li>
            <li>Your name, address, telephone number, and email address</li>
            <li>A statement that you have a good-faith belief that the disputed use is not authorized</li>
            <li>A statement, made under penalty of perjury, that the information is accurate and that you are the copyright owner or authorized to act on the owner's behalf</li>
          </ul>
          <div className="bg-muted/40 rounded-lg p-4 border border-border/50">
            <p className="text-sm"><strong className="text-foreground">Submit DMCA notices to:</strong> <a href="mailto:legal@legiofinance.com" className="text-primary hover:underline">legal@legiofinance.com</a></p>
          </div>
          <p className="mt-4">Upon receipt of a valid DMCA notice, we will promptly investigate and, if appropriate, remove or disable access to the allegedly infringing material. Repeat infringers will have their accounts terminated.</p>
        </>
      ),
    },
    {
      title: "5.1 Counter-Notification",
      content: (
        <p>If you believe your content was removed in error, you may file a counter-notification with our Designated Copyright Agent containing: (a) your signature; (b) identification of the removed material and its prior location; (c) a statement under penalty of perjury that you have a good-faith belief the material was removed by mistake; (d) your name, address, phone number, and email; and (e) a statement consenting to the jurisdiction of federal court in your district.</p>
      ),
    },
    {
      title: "6. Patent Notice",
      content: (
        <p>One or more patents may protect aspects of the Service. All patent rights are reserved by the Company or its licensors. Nothing in these Terms shall be construed as granting any license under any patent right.</p>
      ),
    },
    {
      title: "7. Trade Secrets",
      content: (
        <p>Legio Finance's proprietary algorithms, financial modeling methodologies, software architecture, and related technical and business information constitute trade secrets protected under applicable law, including the Defend Trade Secrets Act (DTSA) and applicable state law. Unauthorized acquisition, disclosure, or use of such information is strictly prohibited and may result in legal action.</p>
      ),
    },
    {
      title: "8. Feedback",
      content: (
        <p>If you provide us with any feedback, suggestions, or ideas regarding the Service ("Feedback"), you hereby assign to us all right, title, and interest in and to such Feedback, including all intellectual property rights therein. You acknowledge that we may use and implement any Feedback without restriction and without any obligation to compensate you.</p>
      ),
    },
    {
      title: "9. Dispute Resolution",
      content: (
        <>
          <h4 className="font-semibold text-foreground mb-2 text-sm">Informal Resolution</h4>
          <p className="mb-4">Before initiating any formal legal proceeding, you agree to attempt to resolve any dispute informally by contacting us at <a href="mailto:legal@legiofinance.com" className="text-primary hover:underline font-medium">legal@legiofinance.com</a> and providing a written description of the dispute. We will attempt to resolve the dispute informally within 30 days.</p>
          <h4 className="font-semibold text-foreground mb-2 text-sm">Binding Arbitration</h4>
          <p>Subject to applicable law, any unresolved dispute shall be submitted to binding arbitration as set forth in the Terms of Service. The arbitrator's award shall be binding and may be entered as a judgment in any court of competent jurisdiction.</p>
        </>
      ),
    },
    {
      title: "10. Contact Information",
      content: (
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "Legal & IP Inquiries", email: "legal@legiofinance.com" },
            { label: "DMCA Agent", email: "legal@legiofinance.com" },
            { label: "Privacy & Data Protection", email: "privacy@legiofinance.com" },
            { label: "Data Protection Officer", email: "dpo@legiofinance.com" },
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
            <Copyright className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">Intellectual Property Policy</h1>
          <p className="text-muted-foreground">Last updated: April 6, 2025</p>
          <div className="flex justify-center gap-3 mt-5">
            <Badge variant="outline" className="text-xs">DMCA Compliant</Badge>
            <Badge variant="outline" className="text-xs">DTSA Protected</Badge>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <nav className="mb-14 p-6 rounded-2xl bg-muted/30 border border-border/50">
          <h3 className="text-sm font-semibold text-foreground mb-3">Table of Contents</h3>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
            {sections.map((s, i) => (
              <a key={i} href={`#ip-${i}`} className="text-sm text-muted-foreground hover:text-primary transition-colors py-0.5">
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="space-y-0">
          {sections.map((section, idx) => (
            <div key={idx} id={`ip-${idx}`} className="scroll-mt-24">
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
            <Link to="/data-governance" className="text-primary hover:underline font-medium">Data Governance</Link>
          </div>
          <a href="mailto:legal@legiofinance.com" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline">
            <Mail className="w-4 h-4" />
            legal@legiofinance.com
          </a>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>© 2026 Legio Finance. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default IPPolicy;
