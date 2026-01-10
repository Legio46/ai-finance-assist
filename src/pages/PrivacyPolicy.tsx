import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 10, 2026</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Introduction</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">Legio Finance ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our financial management platform. By using Legio Finance, you consent to the practices described in this policy.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground"><strong>Account Information:</strong></p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Full name and email address</li>
                <li>Password (encrypted and securely stored)</li>
                <li>Account type preference (personal or business)</li>
                <li>Country of residence</li>
                <li>Phone number (optional, for two-factor authentication)</li>
              </ul>
              
              <p className="text-muted-foreground mt-4"><strong>Financial Data You Provide:</strong></p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Expense records (amounts, categories, descriptions, dates)</li>
                <li>Income sources and amounts</li>
                <li>Credit card information (card names, last 4 digits, balances - we never store full card numbers)</li>
                <li>Budget settings and financial goals</li>
                <li>Investment holdings (names, quantities, purchase prices)</li>
                <li>Recurring payment information</li>
                <li>Receipt images you upload</li>
              </ul>

              <p className="text-muted-foreground mt-4"><strong>Automatically Collected Information:</strong></p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Device information (browser type, operating system)</li>
                <li>IP address and approximate location</li>
                <li>Usage data (features used, pages visited, time spent)</li>
                <li>Login timestamps and session information</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">We use your information to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li><strong>Provide our services:</strong> Process and display your financial data, generate reports and insights, track your goals and budgets</li>
                <li><strong>AI Financial Advisor:</strong> Analyze your financial patterns to provide personalized suggestions (Pro plan only)</li>
                <li><strong>Account management:</strong> Create and maintain your account, process subscription payments, send account-related notifications</li>
                <li><strong>Security:</strong> Detect and prevent fraud, unauthorized access, and other security threats</li>
                <li><strong>Improvement:</strong> Analyze usage patterns to improve our features and user experience</li>
                <li><strong>Communication:</strong> Respond to your inquiries, send important updates about our service</li>
                <li><strong>Legal compliance:</strong> Meet our legal and regulatory obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Data Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground"><strong>We do not sell your personal or financial data.</strong></p>
              <p className="text-muted-foreground mt-4">We may share your information only in these circumstances:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li><strong>Service Providers:</strong> We work with trusted third parties who help us operate our service:
                  <ul className="list-disc pl-6 mt-1 space-y-1">
                    <li>Stripe - for secure payment processing</li>
                    <li>Supabase - for secure data storage and authentication</li>
                    <li>Cloud hosting providers - for reliable service delivery</li>
                  </ul>
                </li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                <li><strong>Protection of Rights:</strong> To protect the rights, property, or safety of Legio Finance, our users, or the public</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (you would be notified)</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share specific information</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">We implement robust security measures to protect your financial data:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest (AES-256)</li>
                <li><strong>Authentication:</strong> Secure password hashing, optional two-factor authentication</li>
                <li><strong>Access Controls:</strong> Strict role-based access to systems containing personal data</li>
                <li><strong>Infrastructure:</strong> Hosted on enterprise-grade cloud infrastructure with regular security audits</li>
                <li><strong>Monitoring:</strong> Continuous security monitoring and threat detection</li>
                <li><strong>Payment Security:</strong> We never store full credit/debit card numbers; all payment processing is handled by Stripe (PCI-DSS compliant)</li>
              </ul>
              <p className="text-muted-foreground mt-4">While we use industry-standard security practices, no system is 100% secure. We encourage you to use a strong, unique password and enable two-factor authentication.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Your Rights (GDPR and Global Privacy Rights)</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">Depending on your location, you have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format (CSV/PDF)</li>
                <li><strong>Restriction:</strong> Request we limit processing of your data in certain circumstances</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="text-muted-foreground mt-4">To exercise these rights, contact us at privacy@legiofinance.com. We will respond within 30 days. You can also export or delete your data directly from your account settings.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">We retain your data as follows:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li><strong>Active accounts:</strong> Data is retained as long as your account is active</li>
                <li><strong>Cancelled accounts:</strong> We retain data for 30 days after cancellation to allow for reactivation, then permanently delete it</li>
                <li><strong>Financial records:</strong> Some data may be retained longer for legal/tax compliance (up to 7 years)</li>
                <li><strong>Security logs:</strong> Retained for up to 12 months for security purposes</li>
              </ul>
              <p className="text-muted-foreground mt-4">You can request immediate deletion of your data by contacting support, subject to legal retention requirements.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li><strong>Essential cookies:</strong> Maintain your login session and security (required)</li>
                <li><strong>Preference cookies:</strong> Remember your settings (theme, language, currency)</li>
                <li><strong>Analytics cookies:</strong> Understand how you use our service to improve it</li>
              </ul>
              <p className="text-muted-foreground mt-4">We do not use cookies for advertising. You can manage cookie preferences through your browser settings, though disabling essential cookies may affect functionality.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">Legio Finance serves users globally. Your data may be transferred to and processed in countries outside your residence, including:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>European Union (primary data storage)</li>
                <li>United States (certain service providers)</li>
              </ul>
              <p className="text-muted-foreground mt-4">We ensure appropriate safeguards for international transfers through:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>EU Standard Contractual Clauses</li>
                <li>Data processing agreements with all service providers</li>
                <li>Compliance with GDPR requirements for transfers outside the EEA</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">Legio Finance is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we discover that a child has provided us with personal information, we will delete it promptly. If you believe a child has provided us with their data, please contact us at privacy@legiofinance.com.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Third-Party Links and Services</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">Our service may contain links to third-party websites or integrate with external services (e.g., for market data). We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">We may update this Privacy Policy periodically. When we make material changes, we will:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Update the "Last updated" date at the top of this policy</li>
                <li>Notify you via email for significant changes</li>
                <li>Display a prominent notice within the application</li>
              </ul>
              <p className="text-muted-foreground mt-4">Your continued use of Legio Finance after changes become effective constitutes acceptance of the revised policy.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">If you have questions about this Privacy Policy or how we handle your data, please contact us:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li><strong>Privacy inquiries:</strong> privacy@legiofinance.com</li>
                <li><strong>General support:</strong> support@legiofinance.com</li>
                <li><strong>Data Protection Officer:</strong> dpo@legiofinance.com</li>
                <li><strong>Website:</strong> www.legiofinance.com</li>
              </ul>
              <p className="text-muted-foreground mt-4">For EU residents: You have the right to lodge a complaint with your local data protection authority if you believe we have not handled your data in accordance with applicable law.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;