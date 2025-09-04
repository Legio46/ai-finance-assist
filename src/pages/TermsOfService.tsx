import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>By accessing and using Legio Financial ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>Legio Financial provides:</p>
              <ul>
                <li>Tax calculation services for multiple countries</li>
                <li>Personal and business expense tracking</li>
                <li>Financial advice and recommendations</li>
                <li>Investment and savings guidance</li>
                <li>Analytics and reporting tools</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>To use our service, you must:</p>
              <ul>
                <li>Be at least 18 years old</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of unauthorized use</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Payment Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>Our service offers:</p>
              <ul>
                <li>7-day free trial for all new users</li>
                <li>Personal plan: $29.99/month</li>
                <li>Business plan: $49.99/month</li>
                <li>Automatic recurring billing</li>
                <li>Cancel anytime with no penalty</li>
              </ul>
              <p>All payments are processed securely through Stripe. Refunds are provided according to our refund policy.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Acceptable Use</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>You agree not to:</p>
              <ul>
                <li>Use the service for illegal purposes</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful or malicious code</li>
                <li>Attempt to gain unauthorized access</li>
                <li>Share your account with others</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Financial Advice Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>Important: Our service provides general financial information and educational content. This is not professional financial advice. You should:</p>
              <ul>
                <li>Consult with qualified professionals for specific advice</li>
                <li>Verify all calculations and recommendations</li>
                <li>Understand that past performance doesn't guarantee future results</li>
                <li>Make decisions based on your individual circumstances</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>Legio Financial shall not be liable for:</p>
              <ul>
                <li>Any indirect, incidental, or consequential damages</li>
                <li>Loss of profits, data, or use</li>
                <li>Service interruptions or technical issues</li>
                <li>Third-party actions or content</li>
                <li>Financial decisions made based on our recommendations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>The service and its original content, features, and functionality are owned by Legio Financial and are protected by international copyright, trademark, and other intellectual property laws.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>We reserve the right to modify these terms at any time. We will provide notice of significant changes. Your continued use of the service after changes constitutes acceptance of the new terms.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>These Terms shall be interpreted and governed by the laws of [Your Jurisdiction], without regard to its conflict of law provisions.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>If you have any questions about these Terms, please contact us at:</p>
              <ul>
                <li>Email: legal@legio.financial</li>
                <li>Address: [Your Business Address]</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;