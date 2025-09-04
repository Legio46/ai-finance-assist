import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>We collect information you provide directly to us, such as:</p>
              <ul>
                <li>Account information (name, email, password)</li>
                <li>Financial data you input for calculations and tracking</li>
                <li>Profile information and preferences</li>
                <li>Communications with our support team</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>We use your information to:</p>
              <ul>
                <li>Provide and maintain our services</li>
                <li>Process your transactions and tax calculations</li>
                <li>Send you technical notices and support messages</li>
                <li>Improve our services and develop new features</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
              <ul>
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>We implement industry-standard security measures to protect your information:</p>
              <ul>
                <li>End-to-end encryption for sensitive data</li>
                <li>Secure data transmission using SSL/TLS</li>
                <li>Regular security audits and monitoring</li>
                <li>Limited access to personal information on a need-to-know basis</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>We use cookies and similar technologies to:</p>
              <ul>
                <li>Maintain your login session</li>
                <li>Remember your preferences</li>
                <li>Analyze how you use our service</li>
                <li>Improve user experience</li>
              </ul>
              <p>You can control cookie settings through your browser preferences.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. International Transfers</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>As we serve users in multiple countries (Slovakia, USA, UK, Germany, France), your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <ul>
                <li>Email: privacy@legio.financial</li>
                <li>Address: [Your Business Address]</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;