import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 10, 2026</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">By accessing and using Legio Finance ("the Service", "we", "us", or "our"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service. These terms apply to all users, including visitors, registered users, and subscribers.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">Legio Finance is a personal and business financial management platform that provides:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">To use our service, you must:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
                <li>Provide accurate, current, and complete registration information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the confidentiality of your password and account credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p className="text-muted-foreground mt-4">You may not share your account credentials with others or allow multiple people to use your account unless your subscription plan explicitly permits it.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Subscription Plans and Payment</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">Our service offers the following subscription tiers:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li><strong>Personal Basic:</strong> €8/month - Includes expense tracking, credit card management, income tracking, budget management, and data export</li>
                <li><strong>Personal Pro:</strong> €10/month - Includes all Basic features plus recurring payments, investment portfolio tracking, financial goals, financial calendar, and AI financial advisor</li>
                <li><strong>Free Currency Converter:</strong> Available to all users without registration</li>
              </ul>
              <p className="text-muted-foreground mt-4">Payment terms:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>All new subscriptions include a 7-day free trial</li>
                <li>Subscriptions automatically renew monthly unless cancelled</li>
                <li>You may cancel your subscription at any time through your account settings</li>
                <li>Cancellations take effect at the end of the current billing period</li>
                <li>All payments are processed securely through Stripe</li>
                <li>Prices are in EUR and may be subject to applicable taxes</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Refund Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">We want you to be satisfied with our service:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>If you cancel during your 7-day free trial, you will not be charged</li>
                <li>For paid subscriptions, refunds may be requested within 14 days of a charge for unused service</li>
                <li>Refund requests should be submitted to support@legiofinance.com</li>
                <li>Refunds are issued at our discretion and typically processed within 5-10 business days</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Acceptable Use</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">You agree not to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction, including tax laws</li>
                <li>Input false or misleading financial data with intent to deceive</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Transmit viruses, malware, or other harmful code</li>
                <li>Reverse engineer, decompile, or disassemble any part of the service</li>
                <li>Use automated systems to access the service without our permission</li>
                <li>Resell or redistribute the service without authorization</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Financial Information Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground"><strong>Important:</strong> Legio Finance provides financial tracking tools and general educational information. Our service is NOT:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Professional financial, tax, or investment advice</li>
                <li>A substitute for consultation with qualified financial professionals</li>
                <li>A guarantee of accuracy for tax calculations or investment projections</li>
              </ul>
              <p className="text-muted-foreground mt-4">You should:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Consult with licensed tax professionals, financial advisors, or accountants for specific advice</li>
                <li>Verify all calculations and data before making financial decisions</li>
                <li>Understand that past investment performance does not guarantee future results</li>
                <li>Make decisions based on your individual financial circumstances and risk tolerance</li>
              </ul>
              <p className="text-muted-foreground mt-4">The AI financial advisor feature provides general guidance based on the information you provide and should not be relied upon as professional advice.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Data Accuracy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">You are responsible for the accuracy of the financial data you input into Legio Finance. We provide tools to help you track and organize your finances, but we:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Do not verify the accuracy of user-inputted data</li>
                <li>Are not responsible for errors in calculations resulting from incorrect input</li>
                <li>May display market data with delays (investment prices may not be real-time)</li>
                <li>Use third-party exchange rates that may vary from actual transaction rates</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">To the maximum extent permitted by law, Legio Finance and its officers, directors, employees, and agents shall not be liable for:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or business opportunities</li>
                <li>Financial decisions made based on information from our service</li>
                <li>Service interruptions, technical issues, or data loss</li>
                <li>Unauthorized access to your account due to compromised credentials</li>
                <li>Errors in third-party data (exchange rates, market prices, etc.)</li>
              </ul>
              <p className="text-muted-foreground mt-4">Our total liability shall not exceed the amount you paid for the service in the 12 months preceding the claim.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">The Legio Finance service, including its design, features, content, and functionality, is owned by Legio Finance and protected by international copyright, trademark, and other intellectual property laws. You may not:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Copy, modify, or distribute our software or content</li>
                <li>Use our trademarks or branding without permission</li>
                <li>Create derivative works based on our service</li>
              </ul>
              <p className="text-muted-foreground mt-4">You retain ownership of all financial data you input into the service.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Account Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">We may suspend or terminate your account if you:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Violate these Terms of Service</li>
                <li>Engage in fraudulent or illegal activities</li>
                <li>Fail to pay subscription fees when due</li>
                <li>Abuse our service or support resources</li>
              </ul>
              <p className="text-muted-foreground mt-4">Upon termination, you may request an export of your data within 30 days. After this period, your data may be permanently deleted.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">We may update these Terms of Service from time to time. We will notify you of material changes by:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li>Posting a notice on our website</li>
                <li>Sending an email to your registered email address</li>
                <li>Displaying a notification when you log in</li>
              </ul>
              <p className="text-muted-foreground mt-4">Your continued use of the service after changes become effective constitutes acceptance of the revised terms.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Governing Law and Disputes</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">These Terms shall be governed by and construed in accordance with the laws of the European Union and the applicable laws of the Netherlands, without regard to conflict of law principles.</p>
              <p className="text-muted-foreground mt-4">Any disputes arising from these terms or your use of the service shall first be attempted to be resolved through good-faith negotiation. If unresolved, disputes shall be submitted to the competent courts in the Netherlands.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>14. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="text-muted-foreground">If you have questions about these Terms of Service, please contact us:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                <li><strong>Email:</strong> legal@legiofinance.com</li>
                <li><strong>Support:</strong> support@legiofinance.com</li>
                <li><strong>Website:</strong> www.legiofinance.com</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;