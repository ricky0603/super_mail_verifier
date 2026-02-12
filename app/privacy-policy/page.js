import Link from "next/link";
import { getSEOTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: "Privacy Policy | Reeverify",
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>{" "}
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">Privacy Policy</h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap font-sans"
        >
          {`Last Updated: February 12, 2026

This Privacy Policy explains how Answer42 LLC ("we," "us," or "our") collects, uses, and shares information when you use Reeverify (the "Service"), including our website at https://reeverify.com (the "Website").

By accessing or using the Service, you agree to this Privacy Policy. If you do not agree, please do not use the Service.

1. Information We Collect

1.1 Account Information
If you create an account, we may collect information such as your name, email address, and company name.

1.2 Billing and Payment Information
If you make a purchase, payments are processed by Stripe. We may receive billing-related details (such as your billing name, billing address, and payment status), but we do not store full payment card numbers on our servers.

1.3 Customer Content (Uploaded Data)
When you use the Service, you may upload data such as email addresses and related fields (for example, name and company). We process this data to provide verification results and related reporting.

1.4 Usage Data and Device Information
We may collect information about how you use the Service, including IP address, device and browser information, pages/screens viewed, timestamps, and diagnostic/log data.

1.5 Cookies and Analytics
We use cookies and similar technologies for essential functionality and analytics. We use Google Analytics and Microsoft Clarity to help understand Website usage. These providers may collect information such as your IP address, device identifiers, and interaction data, subject to their own privacy practices.

2. How We Use Information

We use information we collect to:
- Provide, maintain, and improve the Service
- Process transactions and send related notices
- Provide customer support and respond to requests
- Monitor, prevent, and address security, fraud, and abuse
- Comply with legal obligations and enforce our terms

3. How We Share Information

We may share information in the following circumstances:
- Service Providers: We work with vendors to operate the Service, such as Stripe (payments), Supabase (database and storage), Resend (transactional email), Sentry (error monitoring), Google Analytics and Microsoft Clarity (analytics), and Cloudflare (security and performance).
- Legal and Safety: We may disclose information if required by law or if we believe disclosure is necessary to protect rights, safety, and the integrity of the Service.
- Business Transfers: If we are involved in a merger, acquisition, financing, reorganization, or sale of assets, information may be transferred as part of that transaction.
- With Your Instructions: We may share information when you direct us to do so.

We do not sell your personal information.

4. Children's Privacy

The Service is not intended for children under 13, and we do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us.

5. Data Retention

We retain information for as long as necessary to provide the Service and for legitimate business and legal purposes. Typical retention periods include:
- Customer Content (Uploaded Lists and Results): We generally retain uploaded data and verification results for up to 180 days, unless you delete it sooner. If self-serve deletion is not available for certain data, you can request deletion by contacting us.
- Account Information: We retain account information while your account is active. If you request account deletion, we aim to delete or de-identify account data within 30 days, subject to legal and operational requirements.
- Billing Records: We may retain billing and transaction records for up to 7 years (or longer if required) for tax, accounting, and compliance purposes.
- Security and Diagnostic Logs: We generally retain logs for up to 60 days, unless we need to keep them longer to investigate abuse or security incidents.
- Analytics Data: Retention depends on provider settings and configurations.

6. Security

We take reasonable measures to protect information, but no method of transmission or storage is 100% secure. You use the Service at your own risk.

7. International Processing

We are based in the United States, and information may be processed and stored in the United States and other locations where our service providers operate.

8. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will post the updated version on this page and update the "Last Updated" date. If changes are material, we may provide additional notice (for example, by email).

9. Contact Us

If you have questions or requests about this Privacy Policy or your information, contact us at:
support@reeverify.com`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
