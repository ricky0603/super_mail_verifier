import Image from "next/image";
import Link from "next/link";
import ButtonSignin from "@/components/ButtonSignin";
import BrandLogo from "@/components/BrandLogo";

const pricingPlans = [
  {
    name: "Starter",
    credits: "500 credits / month",
    creditPrice: "$0.0980 per credit",
    price: "$49",
    featured: false,
    ctaText: "get start",
    ctaHref: "/signin",
  },
  {
    name: "Growth",
    credits: "3,000 credits / month",
    creditPrice: "$0.0497 per credit",
    price: "$149",
    featured: true,
    ctaText: "get start",
    ctaHref: "/signin",
  },
  {
    name: "Scale",
    credits: "12,000 credits / month",
    creditPrice: "$0.0333 per credit",
    price: "$399",
    featured: false,
    ctaText: "get start",
    ctaHref: "/signin",
  },
  {
    name: "Enterprise",
    credits: "Custom credits",
    creditPrice: "Custom per-credit pricing",
    price: "Custom",
    featured: false,
    ctaText: "contact us",
    ctaHref: "mailto:support@reeverify.com",
  },
];

const intelCards = [
  {
    title: "Referral Discovery",
    description:
      "If a prospect left the company, we extract the successor contact automatically so you get an exclusive lead.",
  },
  {
    title: "OOO Optimization",
    description:
      "We detect out-of-office auto-replies and provide the best date to follow up for stronger response rates.",
  },
  {
    title: "Resignation Alerts",
    description:
      "Detect inboxes no longer monitored and stop paying your outreach stack for contacts that are gone.",
  },
];

const faqItems = [
  {
    question: "Why does verification take 24 hours?",
    answer:
      "Because we are not guessing. To catch asynchronous bounces, we monitor cluster feedback loops for a full 24-hour cycle.",
  },
  {
    question: "What should I use Reeverify for?",
    answer:
      "Use Reeverify to re-check addresses that other tools marked as Valid or catch-all, or simply run Reeverify on your entire email list directly. Instead of relying on static checks, we use real-send probing to verify deliverability behavior in live conditions. In many lists, we identify roughly 20% of \"Valid\" records as actually unsafe to send, and we can usually recover around 30% to 50% deliverable addresses from catch-all segments.",
  },
  {
    question: "How do credits work for email verification?",
    answer:
      "Email verification consumes credits. Each verified email address costs 1 credit, regardless of the final result (Safe, Bounce, or any other outcome).",
  },
  {
    question: "How is this safer than my own SMTP tool?",
    answer:
      "Reeverify uses isolated probing clusters with no connection to your own domains. We absorb the bounce risk, not your sender identity.",
  },
  {
    question: "What is the difference between Reeverify and ZeroBounce-type tools?",
    answer:
      "Traditional tools like ZeroBounce rely on static checks (SMTP handshake, historical data, pattern rules) and can still label risky emails as valid. Reeverify uses dynamic real-send probing and 24-hour signal monitoring to classify each address by actual delivery behavior, then returns SAFE or BOUNCE with actionable reply intelligence.",
  },
];

const compatibleTools = [
  { name: "Clay", logo: "/compatible/clay.png" },
  { name: "Instantly", logo: "/compatible/instantly.svg" },
  { name: "Smartlead", logo: "/compatible/smartlead.svg" },
  { name: "Apollo", logo: "/compatible/apollo.png" },
];

const compatibleLogos = [
  { name: "Clay", src: "/compatible/clay.png", width: 126, height: 40 },
  { name: "Instantly", src: "/compatible/instantly.svg", width: 143, height: 32 },
  { name: "Smartlead", src: "/compatible/smartlead.svg", width: 189, height: 41 },
  { name: "Apollo", src: "/compatible/apollo.png", width: 202, height: 52 },
];

export default function Page() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-base-300/80 bg-base-100/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo size="sm" />
          </Link>

          <nav className="hidden items-center gap-6 text-xs font-bold lg:flex">
            <a href="#gap" className="link link-hover">The Problem</a>
            <a href="#how" className="link link-hover">How it Works</a>
            <a href="#showdown" className="link link-hover">Showdown</a>
            <a href="#intel" className="link link-hover">Intelligence</a>
            <a href="#pricing" className="link link-hover">Pricing</a>
          </nav>

          <ButtonSignin text="Get Started" extraStyle="btn-primary btn-sm lg:btn-md" />
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-base-100 py-24 lg:py-32">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, color-mix(in oklab, var(--color-base-content) 10%, transparent) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-8">
            <div className="badge gap-2 border-none bg-error px-5 py-4 font-black italic text-white">
              Stop trusting fake &quot;valid&quot; results
            </div>

            <h1 className="mt-8 text-5xl font-black italic leading-[0.9] tracking-tighter md:text-7xl lg:text-8xl">
              Tired of &quot;Valid&quot;
              <br />
              <span className="inline-block -rotate-1 rounded bg-neutral px-4 text-primary">
                Emails Bouncing?
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-base-content/70 md:text-2xl">
              Legacy tools <span className="line-through decoration-error decoration-4">lie to you</span>.
              They mark emails as valid, but can still bounce. Reeverify uses
              <span className="font-bold text-base-content"> Real-Send Probing</span> to catch the
              bounces they miss before you launch.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="#pricing"
                className="btn btn-primary btn-lg rounded-full px-12 font-black italic text-neutral"
              >
                Verify Now
              </a>
            </div>

            <div className="mx-auto mt-14 max-w-2xl overflow-hidden rounded-2xl border-2 border-neutral bg-white p-4 text-left shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-4 flex items-center gap-2 border-b border-base-300 pb-2">
                <div className="h-3 w-3 rounded-full bg-error" />
                <div className="h-3 w-3 rounded-full bg-warning" />
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="ml-2 text-xs font-mono italic opacity-40">
                  Live Comparison Engine
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="mb-1 text-[10px] font-bold uppercase text-slate-400">Legacy Verifier</div>
                  <div className="flex items-center gap-2">
                    <span className="truncate font-mono text-sm text-slate-700">ceo@target.com</span>
                    <span className="badge badge-success badge-xs p-1 text-[8px] font-bold">VALID</span>
                  </div>
                </div>

                <div className="rounded-lg border-2 border-primary bg-neutral p-3 text-white">
                  <div className="mb-1">
                    <BrandLogo size="sm" dark />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="truncate font-mono text-sm">ceo@target.com</span>
                    <span className="badge badge-error badge-xs p-1 text-[8px] font-bold">BOUNCE</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-[11px] font-bold italic text-error">
                We caught an invalid email that legacy validators missed.
              </div>
            </div>

            <p className="mt-12 text-sm font-bold tracking-widest opacity-60">
              Compatible with your workflow
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {compatibleLogos.map((logo) => (
                <div
                  key={logo.name}
                  className="flex h-16 items-center justify-center rounded-xl border border-base-300 bg-base-200/40 px-3"
                >
                  <Image
                    src={logo.src}
                    alt={`${logo.name} logo`}
                    width={logo.width}
                    height={logo.height}
                    className="h-8 w-auto object-contain opacity-80"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="gap" className="border-y border-base-300 bg-base-100 py-24">
          <div className="mx-auto grid max-w-6xl gap-16 px-6 lg:grid-cols-2 lg:items-center lg:px-8">
            <div>
              <h2 className="text-4xl font-black italic leading-none md:text-5xl">
                Why do verified lists still <span className="text-error">bounce</span>
              </h2>
              <div className="mt-8 space-y-5 text-lg text-base-content/70">
                <p>
                  Legacy tools like ZeroBounce or Hunter ask servers if an email exists and trust the response.
                </p>
                <p className="rounded-xl border-l-4 border-error bg-base-200 p-4">
                  <b>The trap:</b> enterprise firewalls often say yes to almost everything to defend against mining.
                </p>
                <p>
                  Campaign send time reveals the truth: hard bounces, damaged reputation, and lower inbox placement.
                </p>
              </div>
            </div>

            <div className="mockup-window border bg-neutral shadow-2xl">
              <div className="space-y-2 bg-neutral p-6 font-mono text-sm text-neutral-content">
                <div className="text-neutral-content/40">{`// PROBING: marketing@fortune500.com`}</div>
                <div className="text-success">Step 1: SMTP Ping... SUCCESS (server lied)</div>
                <div className="text-warning">Step 2: Database Check... RECORD VALID</div>
                <div className="mt-4 animate-pulse font-bold text-error">! REALITY CHECK: EMAIL DOES NOT EXIST</div>
                <div className="italic text-neutral-content/60">
                  Standard tools would mark this as safe. We mark it dead.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="bg-base-200 py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-5xl font-black italic tracking-tighter">Real-Send Testing Logic</h2>
              <p className="mt-4 text-xl text-base-content/60">We take the bullet so your domain does not have to.</p>
            </div>

            <div className="mt-16 grid gap-10 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-7 flex h-20 w-20 rotate-3 items-center justify-center rounded-3xl bg-primary text-3xl font-black text-neutral shadow-xl">
                  01
                </div>
                <h3 className="text-2xl font-black italic">Import Lists</h3>
                <p className="mt-3 text-base-content/65">
                  Sync valid, catch-all, and risky segments from your lead source.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-7 flex h-20 w-20 -rotate-3 items-center justify-center rounded-3xl bg-neutral text-3xl font-black text-primary shadow-xl">
                  02
                </div>
                <h3 className="text-2xl font-black italic">Distributed Probing</h3>
                <p className="mt-3 text-base-content/65">
                  Sender clusters simulate real delivery and monitor bounce, OOO, and firewall behavior for 24h.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-7 flex h-20 w-20 rotate-6 items-center justify-center rounded-3xl bg-primary text-3xl font-black text-neutral shadow-xl">
                  03
                </div>
                <h3 className="text-2xl font-black italic">100% Valid CSV</h3>
                <p className="mt-3 text-base-content/65">Export contacts physically capable of receiving email.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="showdown" className="bg-base-100 py-24">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-black italic">The Truth: Case Study #842</h2>
              <p className="mt-2 text-base-content/60">
                3,746 emails marked as valid by legacy tools.
              </p>
            </div>

            <div className="relative mt-12 grid gap-6 md:grid-cols-2 md:gap-8">
              <div className="card border-2 border-base-300 bg-base-100 p-8">
                <div className="mb-6 flex items-start justify-between">
                  <span className="text-sm font-black opacity-40">Legacy tools</span>
                  <span className="text-2xl font-black text-error">✕</span>
                </div>
                <div className="py-8 text-center">
                  <p className="font-mono text-base-content/50">Result for &quot;Valid&quot; segment:</p>
                  <p className="mt-2 text-3xl font-black text-success">VALID (Guess)</p>
                  <div className="divider">Actual Outcome</div>
                  <p className="text-5xl font-black text-error">12.5% 😱</p>
                  <p className="mt-2 text-sm font-bold">Hard bounce rate</p>
                </div>
              </div>

              <div className="card scale-[1.02] border-4 border-primary bg-neutral p-8 text-neutral-content shadow-2xl">
                <div className="mb-6 flex items-start justify-between">
                  <BrandLogo size="sm" dark />
                  <span className="text-2xl font-black text-success">✓</span>
                </div>
                <div className="py-8 text-center">
                  <p className="font-mono text-neutral-content/50">Result for &quot;Valid&quot; segment:</p>
                  <p className="mt-2 text-3xl font-black text-primary">Safe or Bounce</p>
                  <div className="divider opacity-20">Actual Outcome</div>
                  <p className="text-5xl font-black text-success">0.0% 😎</p>
                  <p className="mt-2 text-sm font-bold text-primary">Bounce rate guaranteed</p>
                </div>
              </div>

              <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-base-100 bg-primary font-black text-neutral md:flex">
                VS
              </div>
            </div>
          </div>
        </section>

        <section className="bg-base-100 py-24">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <h2 className="mb-10 text-center text-3xl font-black italic">Reality vs. Illusion</h2>
            <div className="overflow-x-auto rounded-3xl bg-base-100 shadow-xl">
              <table className="table table-lg">
                <thead className="bg-neutral text-neutral-content">
                  <tr>
                    <th>Verification Factor</th>
                    <th className="text-center">Legacy Static Tools</th>
                    <th className="text-center text-primary">Reeverify (Dynamic)</th>
                  </tr>
                </thead>
                <tbody className="font-bold">
                  <tr>
                    <td>Actual Accuracy</td>
                    <td className="text-center text-error">40% - 60%</td>
                    <td className="text-center text-success">99.9%</td>
                  </tr>
                  <tr>
                    <td>Detection Method</td>
                    <td className="text-center font-normal opacity-50">SMTP Handshake (Guessing)</td>
                    <td className="text-center">Real-Send Probing (Physical Path)</td>
                  </tr>
                  <tr>
                    <td>Domain Reputation Safety</td>
                    <td className="text-center text-warning">Medium Risk</td>
                    <td className="text-center text-success">Zero Risk</td>
                  </tr>
                  <tr>
                    <td>Extra Signals</td>
                    <td className="text-center text-error">No</td>
                    <td className="text-center text-success">
                      Out of office, resigned, autoreply and referrals
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="intel" className="bg-neutral py-24 text-neutral-content">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-black italic leading-none md:text-5xl">
                Verification is for saving.
                <br />
                <span className="text-primary underline decoration-wavy">Intelligence is for earning.</span>
              </h2>
              <p className="mt-4 text-neutral-content/65">Our probing engine extracts data static tools cannot see.</p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {intelCards.map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/10 p-8 transition hover:bg-white/5">
                  <h3 className="text-xl font-black italic tracking-tight text-primary">{item.title}</h3>
                  <p className="mt-3 text-sm text-neutral-content/70">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-base-300 bg-base-200 py-24">
          <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
            <h2 className="text-3xl font-black italic">Built for the Modern Outreach Stack</h2>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {compatibleTools.map((tool) => (
                <div
                  key={tool.name}
                  className="rounded-xl bg-base-100 p-6 shadow-sm flex flex-col items-center justify-center gap-3"
                >
                  <div className="relative h-12 w-40">
                    <Image
                      src={tool.logo}
                      alt={`${tool.name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-10 font-bold text-base-content/60">14,000,000+ Emails Probed. 850,000+ Bounces Blocked.</p>
          </div>
        </section>

        <section id="pricing" className="bg-base-100 py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-black italic leading-none md:text-5xl">Pick a plan based on your growth</h2>
              <p className="mt-4 text-base-content/65">
                Every verification consumes 1 credit. Choose the plan that matches your monthly list size.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-4">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex h-full flex-col rounded-3xl border-2 p-8 ${
                    plan.featured
                      ? "border-neutral bg-neutral text-neutral-content shadow-2xl"
                      : "border-base-300 bg-base-100 shadow-sm"
                  }`}
                >
                  {plan.featured && (
                    <div className="badge badge-primary absolute -top-3 left-8 font-black italic">Most popular</div>
                  )}

                  <p className={`text-sm font-bold tracking-wide ${plan.featured ? "text-primary" : "text-base-content/60"}`}>
                    {plan.name.toUpperCase()}
                  </p>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-5xl font-black">{plan.price}</span>
                    {plan.name !== "Enterprise" && (
                      <span className={`mb-1 text-2xl font-bold ${plan.featured ? "text-neutral-content/70" : "text-base-content/50"}`}>
                        /month
                      </span>
                    )}
                  </div>
                  <p className={`mt-2 text-sm ${plan.featured ? "text-neutral-content/70" : "text-base-content/60"}`}>
                    {plan.credits}
                  </p>
                  <p className={`mt-1 text-xs font-semibold ${plan.featured ? "text-primary" : "text-base-content/50"}`}>
                    {plan.creditPrice}
                  </p>

                  <ul className={`mt-8 flex-1 space-y-3 text-base ${plan.featured ? "text-neutral-content/90" : "text-base-content/80"}`}>
                    {(plan.name === "Enterprise"
                      ? [
                          "Custom credits volume and pricing",
                          "Custom data integrations",
                          "Custom verification strategy",
                          "All other features from other packages",
                        ]
                      : [
                          plan.credits,
                          "Verified via real-send probing",
                          "Autoreply detection",
                          "Catch-all recovery",
                          "CSV upload and export",
                          ...(plan.name === "Starter" ? [] : ["API access"]),
                        ]).map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className={`mt-0.5 text-sm font-black ${plan.featured ? "text-primary" : "text-success"}`}>✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={plan.ctaHref}
                    className={`btn mt-8 w-full rounded-xl border-none text-base font-black ${
                      plan.featured ? "btn-primary text-neutral" : "bg-neutral text-neutral-content hover:bg-neutral/90"
                    }`}
                  >
                    {plan.ctaText}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-base-200 py-24">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <h2 className="mb-10 text-center text-3xl font-black italic">Technical Intelligence</h2>
            <div className="join join-vertical w-full overflow-hidden rounded-3xl bg-base-100 shadow-lg">
              {faqItems.map((item, index) => (
                <div key={item.question} className="collapse collapse-arrow join-item border border-base-300">
                  <input type="radio" name="faq-acc" defaultChecked={index === 0} />
                  <div className="collapse-title text-xl font-bold italic tracking-tight">{item.question}</div>
                  <div className="collapse-content text-base-content/65">
                    <p>{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer footer-center rounded-t-[3rem] bg-neutral p-16 text-neutral-content lg:p-20">
        <div className="max-w-2xl text-center">
          <h2 className="text-4xl font-black italic leading-none text-white md:text-6xl">
            Start scaling with <span className="font-extrabold text-primary">zero risk</span> email list
          </h2>
          <a href="/signin" className="btn btn-primary btn-lg mt-8 mb-12 rounded-full px-14 font-black italic text-neutral">
            Create Free Account
          </a>

          <BrandLogo size="md" dark className="justify-center" />
          <p className="mt-4 text-xs opacity-50">The Ultimate email verification solution</p>

          <nav className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-semibold tracking-[0.12em] text-neutral-content/70">
            <Link href="/tos" className="link link-hover">
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className="link link-hover">
              Privacy Policy
            </Link>
            <a href="mailto:support@reeverify.com" className="link link-hover">
              Support
            </a>
          </nav>

          <p className="mt-6 text-xs text-neutral-content/45">
            Copyright © {new Date().getFullYear()} Reeverify. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
