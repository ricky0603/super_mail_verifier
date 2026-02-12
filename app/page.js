import Link from "next/link";
import ButtonSignin from "@/components/ButtonSignin";
import BrandLogo from "@/components/BrandLogo";

const pricingPlans = [
  { name: "Starter", probes: "500 Probes / mo", price: "$49/mo", featured: false },
  { name: "Growth", probes: "3,000 Probes / mo", price: "$149/mo", featured: true },
  { name: "Scale", probes: "12,000 Probes / mo", price: "$399/mo", featured: false },
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
    question: "How is this safer than my own SMTP tool?",
    answer:
      "Reeverify uses isolated probing clusters with no connection to your own domains. We absorb the bounce risk, not your sender identity.",
  },
];

export default function Page() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-base-300/80 bg-base-100/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo size="sm" />
          </Link>

          <nav className="hidden items-center gap-6 text-xs font-bold uppercase lg:flex">
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
            <div className="badge gap-2 border-none bg-neutral px-5 py-4 font-black text-primary">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              </span>
              ACTIVATE 40% OF YOUR RISKY LIST
            </div>

            <h1 className="mt-8 text-5xl font-black uppercase italic leading-[0.9] tracking-tighter md:text-7xl lg:text-8xl">
              Zero Bounces.
              <br />
              <span className="inline-block -rotate-1 rounded bg-primary px-4 text-neutral">Pure ROI.</span>
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-base-content/70 md:text-2xl">
              Stop throwing away catch-all emails that traditional tools mark as dead. Reeverify uses
              <span className="font-bold text-base-content"> real-send probing</span> to unlock leads your competitors ignore.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <a href="#pricing" className="btn btn-primary btn-lg rounded-full px-10 font-black italic text-neutral">
                Start Verifying Free
              </a>
              <a href="#gap" className="btn btn-outline btn-lg rounded-full">
                Why SMTP Fails?
              </a>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-3 opacity-50 grayscale sm:grid-cols-4">
              <div className="font-black italic">CLAY</div>
              <div className="font-black italic">INSTANTLY</div>
              <div className="font-black italic">SMARTLEAD</div>
              <div className="font-black italic">APOLLO</div>
            </div>
          </div>
        </section>

        <section id="gap" className="border-y border-base-300 bg-base-100 py-24">
          <div className="mx-auto grid max-w-6xl gap-16 px-6 lg:grid-cols-2 lg:items-center lg:px-8">
            <div>
              <h2 className="text-4xl font-black uppercase italic leading-none md:text-5xl">
                Why do verified lists still <span className="text-error">kill your domain?</span>
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
              <h2 className="text-5xl font-black uppercase italic tracking-tighter">Real-Send Testing Logic</h2>
              <p className="mt-4 text-xl text-base-content/60">We take the bullet so your domain does not have to.</p>
            </div>

            <div className="mt-16 grid gap-10 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-7 flex h-20 w-20 rotate-3 items-center justify-center rounded-3xl bg-primary text-3xl font-black text-neutral shadow-xl">
                  01
                </div>
                <h3 className="text-2xl font-black uppercase italic">Import Risky</h3>
                <p className="mt-3 text-base-content/65">Sync catch-all and risky segments from your lead source.</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-7 flex h-20 w-20 -rotate-3 items-center justify-center rounded-3xl bg-neutral text-3xl font-black text-primary shadow-xl">
                  02
                </div>
                <h3 className="text-2xl font-black uppercase italic">Distributed Probing</h3>
                <p className="mt-3 text-base-content/65">
                  Sender clusters simulate real delivery and monitor bounce, OOO, and firewall behavior for 24h.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-7 flex h-20 w-20 rotate-6 items-center justify-center rounded-3xl bg-primary text-3xl font-black text-neutral shadow-xl">
                  03
                </div>
                <h3 className="text-2xl font-black uppercase italic">100% Valid CSV</h3>
                <p className="mt-3 text-base-content/65">Export contacts physically capable of receiving email.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="showdown" className="bg-base-100 py-24">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-black uppercase italic">The Truth: Case Study #842</h2>
              <p className="mt-2 text-base-content/60">5,000 Fortune 500 prospects, catch-all segment only.</p>
            </div>

            <div className="relative mt-12 grid gap-6 md:grid-cols-2 md:gap-8">
              <div className="card border-2 border-base-300 bg-base-100 p-8">
                <div className="mb-6 flex items-start justify-between">
                  <span className="text-sm font-black opacity-40">LEGACY TOOLS</span>
                  <span className="text-error">✕</span>
                </div>
                <div className="py-8 text-center">
                  <p className="font-mono text-base-content/50">Result for Catch-all:</p>
                  <p className="mt-2 text-3xl font-black text-success">VALID (Guess)</p>
                  <div className="divider">Actual Outcome</div>
                  <p className="text-5xl font-black text-error">12.5%</p>
                  <p className="mt-2 text-sm font-bold uppercase">Hard Bounce Rate</p>
                </div>
              </div>

              <div className="card scale-[1.02] border-4 border-primary bg-neutral p-8 text-neutral-content shadow-2xl">
                <div className="mb-6 flex items-start justify-between">
                  <span className="text-sm font-black text-primary">REEVERIFY</span>
                  <span className="text-primary">✓✓</span>
                </div>
                <div className="py-8 text-center">
                  <p className="font-mono text-neutral-content/50">Result for Catch-all:</p>
                  <p className="mt-2 text-3xl font-black text-primary">PROTECTED</p>
                  <div className="divider opacity-20">Actual Outcome</div>
                  <p className="text-5xl font-black text-success">0.0%</p>
                  <p className="mt-2 text-sm font-bold uppercase text-primary">Bounce Rate Guaranteed</p>
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
            <h2 className="mb-10 text-center text-3xl font-black uppercase italic">Reality vs. Illusion</h2>
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
                    <td>Catch-all Accuracy</td>
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
                    <td>Second-Order Intel</td>
                    <td className="text-center text-error">No</td>
                    <td className="text-center text-success">OOO and Referrals</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="intel" className="bg-neutral py-24 text-neutral-content">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl font-black uppercase italic leading-none md:text-5xl">
                Verification is for saving.
                <br />
                <span className="text-primary underline decoration-wavy">Intelligence is for earning.</span>
              </h2>
              <p className="mt-4 text-neutral-content/65">Our probing engine extracts data static tools cannot see.</p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {intelCards.map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/10 p-8 transition hover:bg-white/5">
                  <h3 className="text-xl font-black uppercase italic tracking-tight text-primary">{item.title}</h3>
                  <p className="mt-3 text-sm text-neutral-content/70">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-base-300 bg-base-200 py-24">
          <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
            <h2 className="text-3xl font-black uppercase italic">Built for the Modern Outreach Stack</h2>
            <div className="mt-10 grid grid-cols-2 gap-4 opacity-70 md:grid-cols-4">
              <div className="rounded-xl bg-base-100 p-4 font-black italic shadow-sm">CLAY.COM</div>
              <div className="rounded-xl bg-base-100 p-4 font-black italic shadow-sm">INSTANTLY.AI</div>
              <div className="rounded-xl bg-base-100 p-4 font-black italic shadow-sm">SMARTLEAD</div>
              <div className="rounded-xl bg-base-100 p-4 font-black italic shadow-sm">APOLLO.IO</div>
            </div>
            <p className="mt-10 font-bold text-base-content/60">14,000,000+ Emails Probed. 850,000+ Bounces Blocked.</p>
          </div>
        </section>

        <section id="pricing" className="bg-base-100 py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-start lg:px-8">
            <div>
              <h2 className="text-4xl font-black uppercase italic leading-none">Choose Your Arsenal</h2>
              <div className="mt-8 space-y-4">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`rounded-2xl p-6 ${
                      plan.featured
                        ? "relative border-4 border-neutral bg-neutral text-neutral-content shadow-2xl"
                        : "cursor-pointer border-2 border-base-300 transition hover:border-primary"
                    }`}
                  >
                    {plan.featured && (
                      <div className="badge badge-primary absolute -top-3 left-6 font-black italic">MOST POPULAR</div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`text-xl font-black uppercase italic ${plan.featured ? "text-primary" : ""}`}>
                          {plan.name}
                        </h3>
                        <p className="text-sm opacity-60">{plan.probes}</p>
                      </div>
                      <div className="text-2xl font-black">{plan.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card bg-base-200 p-8">
              <h3 className="text-2xl font-black uppercase italic">ROI Calculator</h3>
              <div className="mt-6 space-y-6">
                <div>
                  <label className="label text-xs font-black uppercase">Your Catch-all Leads / Mo</label>
                  <input type="range" min="500" max="10000" defaultValue="3000" className="range range-primary" />
                </div>

                <div className="stats w-full bg-base-100 shadow">
                  <div className="stat">
                    <div className="stat-title text-xs font-black uppercase">Leads Saved</div>
                    <div className="stat-value tracking-tighter text-primary">~1,200</div>
                    <div className="stat-desc">40% Recovery Rate</div>
                  </div>
                </div>

                <div className="rounded-xl bg-neutral p-4 text-neutral-content">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold opacity-60">Estimated Revenue Unlocked</span>
                    <span className="text-2xl font-black text-primary">$4,800+</span>
                  </div>
                  <p className="mt-2 text-[10px] opacity-40">Based on $4 average lead value.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-base-200 py-24">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <h2 className="mb-10 text-center text-3xl font-black uppercase italic">Technical Intelligence</h2>
            <div className="join join-vertical w-full overflow-hidden rounded-3xl bg-base-100 shadow-lg">
              {faqItems.map((item, index) => (
                <div key={item.question} className="collapse collapse-arrow join-item border border-base-300">
                  <input type="radio" name="faq-acc" defaultChecked={index === 0} />
                  <div className="collapse-title text-xl font-bold uppercase italic tracking-tight">{item.question}</div>
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
          <h2 className="text-4xl font-black uppercase italic leading-none md:text-6xl">
            Stop guessing.
            <br />
            <span className="text-primary">Start scaling.</span>
          </h2>
          <p className="mt-6 text-neutral-content/65">
            Try Reeverify with 50 credits and no credit card. Experience zero-bounce verification directly.
          </p>
          <a href="/signin" className="btn btn-primary btn-lg mt-8 rounded-full px-14 font-black uppercase italic text-neutral">
            Create Free Account
          </a>

          <div className="divider my-12 text-xs font-black uppercase tracking-[0.2em] opacity-30 before:bg-white/10 after:bg-white/10">
            Reeverify Dashboard
          </div>

          <BrandLogo size="md" dark className="justify-center" />
          <p className="mt-4 text-xs opacity-50">The Ultimate Catch-all Verification Logic. Built for Growth Teams.</p>

          <nav className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-content/70">
            <Link href="/tos" className="link link-hover">
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className="link link-hover">
              Privacy Policy
            </Link>
            <Link href="/docs" className="link link-hover">
              Docs
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
