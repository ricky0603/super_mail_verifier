import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `Terms of Use | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
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
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Terms of Use for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Effective Date: January 1, 2026
Last Updated: February 12, 2026

These Terms of Use ("Terms") are a legal agreement between you and Answer42 LLC ("Answer42," "we," "us," or "our") and govern your access to and use of Reeverify, including https://reeverify.com and related services (collectively, the "Service"). By using the Service, you agree to these Terms.

If you do not agree to these Terms, do not use the Service.

1. Eligibility and Accounts

You must be at least 13 years old to use the Service. If you are under 18, you may use the Service only with the involvement and consent of a parent or legal guardian.

You may use the Service as an individual or on behalf of a company or other organization. If you create an account on behalf of an organization, you represent that you have authority to bind that organization to these Terms.

You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.

2. Service Description and No Guarantee

The Service provides email verification assessments and related status signals. Results are probabilistic and provided "as is", without guarantees of deliverability or mailbox validity.

You are responsible for how you use results and for your own compliance with applicable laws, policies, and third-party platform requirements.

3. Acceptable Use

You agree not to misuse the Service, including by:
- violating any applicable law or regulation;
- attempting unauthorized access to systems or data;
- interfering with Service performance or security;
- using the Service to support spam, fraud, harassment, or other abusive activity;
- uploading content you do not have rights to process.

We may suspend or terminate access for misuse, security risk, legal risk, or breach of these Terms.

4. Subscription, Billing, and Credits

Paid plans are billed through Stripe on a monthly or yearly basis, depending on the plan you select. We do not offer a free trial unless expressly stated at checkout.

The Service uses credits. Credits reset at each subscription renewal and do not roll over unless explicitly stated otherwise in your plan.

You authorize us and our payment processor to charge the applicable subscription fees, taxes, and any other disclosed charges.

5. Cancellation, Refunds, and Fees

You may cancel your subscription at any time. Cancellation takes effect at the end of your current billing period, and you keep access through that period.

As a general rule, fees are non-refundable. In exceptional cases, we may issue a partial refund based on unused remaining credits, calculated using 70% of your plan's implied per-credit rate (the plan price divided by the credits included in that plan), multiplied by unused remaining credits, less applicable Stripe processing fees.

No refunds are provided for orders older than 14 days.

No prorated refund is provided for annual plans canceled before the end of the billing period.

6. Intellectual Property

We and our licensors retain all rights, title, and interest in and to the Service, including software, content, branding, and related intellectual property, except for your own uploaded data.

Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable right to use the Service during your subscription term.

7. Privacy

Your use of the Service is also governed by our Privacy Policy: https://reeverify.com/privacy-policy.

8. Disclaimers

THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.

TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT RESULTS WILL MEET YOUR REQUIREMENTS.

9. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW, ANSWER42 LLC AND ITS AFFILIATES, OFFICERS, EMPLOYEES, AGENTS, AND SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL.

TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ALL CLAIMS RELATING TO THE SERVICE WILL NOT EXCEED THE AMOUNTS PAID BY YOU TO US FOR THE SERVICE IN THE 12 MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM.

10. Indemnification

You agree to defend, indemnify, and hold harmless Answer42 LLC and its affiliates, officers, employees, and agents from and against claims, liabilities, damages, losses, and expenses (including reasonable attorneys' fees) arising from or related to your use of the Service, your data, or your breach of these Terms.

11. Governing Law

These Terms are governed by the laws of the State of Wyoming, USA, without regard to conflict-of-law principles.

12. Dispute Resolution; Arbitration; Class Action Waiver

Please read this section carefully. It affects your legal rights.

Any dispute, claim, or controversy arising out of or relating to these Terms or the Service will be resolved by final and binding arbitration in Wyoming, USA, except that either party may seek injunctive or equitable relief in a court of competent jurisdiction for actual or threatened infringement or misuse of intellectual property rights.

You and Answer42 LLC agree that each may bring claims only in an individual capacity and not as a plaintiff or class member in any purported class, collective, consolidated, private attorney general, or representative proceeding.

To the extent permitted by law, the arbitrator may not consolidate more than one person's claims and may not preside over any form of representative or class proceeding.

13. Changes to the Terms

We may update these Terms from time to time. If we make material changes, we will post the updated Terms with a new "Last Updated" date and may provide additional notice when required by law.

Your continued use of the Service after updated Terms become effective means you accept the updated Terms.

14. Contact Information

Answer42 LLC
30 N Gould St, Sheridan, WY 82801
Email: support@reeverify.com

15. Miscellaneous

If any provision of these Terms is held unenforceable, the remaining provisions remain in full force and effect.

Our failure to enforce any provision is not a waiver of our right to do so later.

You may not assign these Terms without our prior written consent. We may assign these Terms in connection with a merger, acquisition, reorganization, or sale of assets.

These Terms constitute the entire agreement between you and Answer42 LLC regarding the Service and supersede prior agreements on that subject.`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
