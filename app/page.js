import Image from "next/image";
import Link from "next/link";
import { Space_Grotesk, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import ButtonSignin from "@/components/ButtonSignin";
import BrandLogo from "@/components/BrandLogo";
import Reveal from "@/components/landing/Reveal";
import FaqList from "@/components/landing/FaqList";
import config from "@/config";
import "./landing.css";

// Fonts for the landing page, exposed to landing.css as CSS variables.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

/* ─── DATA ─── */
const STATS = [
  { num: "10min", label: "to deliver first results", accent: true },
  { num: "24h", label: "continuous monitoring & updates" },
  { num: "0", label: "risk to your domain reputation" },
];

const STEPS = [
  {
    n: "1",
    t: "Upload your catch-all list",
    d: "Export the “catch-all / unknown” rows from ZeroBounce, Hunter, or Apollo. Drop the CSV in — that’s the whole setup.",
  },
  {
    n: "2",
    t: "We send real test emails",
    d: "Isolated probing infrastructure — fully separate from your domain — delivers to each address and watches for bounces over 24 hours.",
  },
  {
    n: "3",
    t: "Get a clean Safe / Bounce list",
    d: "Download a verified CSV and push the safe contacts straight into your sequences. No bounce risk to your sender reputation.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "$49",
    per: "/mo",
    credits: "500 credits",
    unit: "$0.098 / verification",
    feats: ["Catch-all recovery", "Real-send probing", "24h bounce monitoring", "CSV upload & export"],
    featured: false,
    cta: "Start recovering",
  },
  {
    name: "Growth",
    price: "$149",
    per: "/mo",
    credits: "3,000 credits",
    unit: "$0.050 / verification",
    feats: ["Everything in Starter", "API access", "Priority processing", "Webhook results"],
    featured: true,
    cta: "Start recovering",
  },
  {
    name: "Scale",
    price: "$399",
    per: "/mo",
    credits: "12,000 credits",
    unit: "$0.033 / verification",
    feats: ["Everything in Growth", "Volume discounts", "Dedicated support", "SLA guarantee"],
    featured: false,
    cta: "Start recovering",
  },
  {
    name: "Enterprise",
    price: "Custom",
    per: "",
    credits: "Custom volume",
    unit: "Volume pricing",
    feats: ["Custom integrations", "Dedicated strategist", "Security review", "All Scale features"],
    featured: false,
    cta: "Contact sales",
  },
];

const FAQS = [
  {
    q: "What exactly is a catch-all email?",
    a: "A catch-all domain accepts mail to any address — even ones that don't exist. Standard verifiers can't tell a real inbox from a fake one, so they mark the whole domain as risky and tell you not to send. Reeverify sidesteps the guesswork by actually delivering a test message and watching the result for a full 24 hours.",
  },
  {
    q: "Does this put my sending domain at risk?",
    a: "No. We send from our own isolated probing infrastructure — completely separate from your domain, IPs, and sender identity. Your reputation is never touched. You only ever receive back a clean list of Safe or Bounce results.",
  },
  {
    q: "Why does verification take 24 hours?",
    a: "Many bounces are asynchronous: the receiving server accepts the message at first, then returns a bounce notification hours later. We monitor a full 24-hour cycle to catch those delayed signals that instant SMTP checks miss entirely.",
  },
  {
    q: "How do credits work?",
    a: "1 credit = 1 email verified, whatever the result. Credits refresh monthly with your plan. Since every recovered catch-all is a contact you already paid to acquire, the credit cost typically pays for itself on the first send.",
  },
  {
    q: "How is this different from ZeroBounce or Hunter?",
    a: "Those tools use static SMTP handshakes and simply can't confirm catch-all domains. Reeverify uses real-send probing with 24-hour monitoring and is built to run after your first verification pass — recovering the leads static tools are forced to discard.",
  },
];

const compatibleLogos = [
  { name: "Clay", src: "/compatible/clay.png", width: 126, height: 40 },
  { name: "Instantly", src: "/compatible/instantly.svg", width: 143, height: 32 },
  { name: "Smartlead", src: "/compatible/smartlead.svg", width: 189, height: 41 },
  { name: "Apollo", src: "/compatible/apollo.png", width: 202, height: 52, tall: true },
];

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: config.appName,
  alternateName: config.siteAlternateName,
  url: `https://${config.domainName}/`,
};

/* ─── ICONS ─── */
function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

/* ─── HERO DEMO (catch-all flows through Reeverify, splits Safe / Bounce) ─── */
function HeroDemo() {
  const safeSet = new Set([0, 3, 5, 8]);
  const dots = [];
  for (let i = 0; i < 10; i++) {
    const safe = safeSet.has(i);
    const pathId = safe ? "#v4-safe" : "#v4-bounce";
    const endColor = safe ? "#16a34a" : "#e2433b";
    const delay = `${(i * 0.44).toFixed(2)}s`;
    dots.push(
      <circle key={i} r="5.5" fill="#FFD400" opacity="0">
        <animateMotion dur="4.2s" repeatCount="indefinite" begin={delay}>
          <mpath href={pathId} />
        </animateMotion>
        <animate
          attributeName="opacity"
          values="0;1;1;1;0"
          keyTimes="0;0.07;0.5;0.9;1"
          dur="4.2s"
          repeatCount="indefinite"
          begin={delay}
        />
        <animate
          attributeName="fill"
          values={`#FFD400;#FFD400;${endColor};${endColor}`}
          keyTimes="0;0.44;0.58;1"
          dur="4.2s"
          repeatCount="indefinite"
          begin={delay}
        />
      </circle>
    );
  }

  return (
    <div className="demo-frame">
      <div className="demo-bar">
        <span className="d r"></span>
        <span className="d y"></span>
        <span className="d g"></span>
        <span className="t">app.reeverify.com — Recovery</span>
        <span className="live">
          <span className="pulse"></span>verifying
        </span>
      </div>
      <div className="demo-body">
        <svg viewBox="0 0 500 230" className="pf-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="5,000 addresses marked catch-all flow through Reeverify and split into 2,100 safe-to-send and 2,900 bounce-risk.">
          <defs>
            <path id="v4-safe" d="M 110 115 L 276 115 C 312 100 352 40 400 31" />
            <path id="v4-bounce" d="M 110 115 L 276 115 C 312 130 352 190 400 199" />
            <pattern id="v4-grid" width="22" height="22" patternUnits="userSpaceOnUse">
              <path d="M 22 0 L 0 0 0 22" fill="none" stroke="rgba(20,20,20,0.04)" strokeWidth="1" />
            </pattern>
          </defs>

          <rect width="500" height="230" fill="url(#v4-grid)" />

          {/* connectors — one uniform dotted line, stopping at each module's edge */}
          <g stroke="rgba(20,20,20,0.12)" strokeWidth="1.5" strokeDasharray="1 5" strokeLinecap="round" fill="none">
            <path d="M 110 115 L 196 115" />
            <path d="M 276 115 C 312 100 352 40 400 31" />
            <path d="M 276 115 C 312 130 352 190 400 199" />
          </g>

          {/* input card */}
          <g>
            <rect x="10" y="89" width="96" height="52" rx="11" fill="#fff" stroke="rgba(20,20,20,0.1)" strokeWidth="1" />
            <text x="58" y="112" textAnchor="middle" className="pf-mono" fontWeight="700" fontSize="17" fill="#18181b">5,000</text>
            <text x="58" y="129" textAnchor="middle" fontSize="9" fill="#9a9a9a">marked catch-all</text>
          </g>

          {/* safe output */}
          <g>
            <rect x="400" y="8" width="92" height="46" rx="11" fill="#16a34a" fillOpacity="0.08" stroke="#16a34a" strokeOpacity="0.3" strokeWidth="1" />
            <text x="446" y="30" textAnchor="middle" className="pf-mono" fontWeight="700" fontSize="16" fill="#16a34a">2,100</text>
            <text x="446" y="45" textAnchor="middle" fontSize="9.5" fill="#16a34a" opacity="0.85">Safe to send ✓</text>
          </g>

          {/* bounce output */}
          <g>
            <rect x="400" y="176" width="92" height="46" rx="11" fill="#e2433b" fillOpacity="0.06" stroke="#e2433b" strokeOpacity="0.28" strokeWidth="1" />
            <text x="446" y="198" textAnchor="middle" className="pf-mono" fontWeight="700" fontSize="16" fill="#e2433b">2,900</text>
            <text x="446" y="213" textAnchor="middle" fontSize="9.5" fill="#e2433b" opacity="0.8">Confirmed bounce</text>
          </g>

          {dots}

          {/* gate — drawn last so dots pass behind it */}
          <g>
            <rect x="196" y="96" width="80" height="38" rx="11" fill="#FFD400" />
            <text x="236" y="120" textAnchor="middle" className="pf-display" fill="#1a1600" fontSize="9.5" fontWeight="700" letterSpacing="0.5">REEVERIFY</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

/* ─── SECTIONS ─── */
function Header() {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="brand-mark" aria-label="Reeverify home">
          <BrandLogo size="sm" />
        </Link>
        <nav className="header-nav">
          <a href="#how">How it works</a>
          <a href="#proof">Why it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>
        <ButtonSignin text="Get started" extraStyle="btn-brand btn-sm" />
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap hero-inner">
        <div className="hero-stagger">
          <div className="hero-badge">
            <span className="dot"></span> Built for cold-outreach agencies &amp; growth teams
          </div>
          <h1 className="dsp">
            Send to <span className="kw">50% more contacts</span> from the list you already paid for.
          </h1>
          <p className="hero-sub">
            Other verifiers flag <span className="kw">catch-all</span> addresses as unsendable.
            Reeverify proves which ones are actually safe — without ever touching your domain.
          </p>
          <div className="hero-cta">
            <ButtonSignin
              text="Recover my leads →"
              authenticatedText="Recover my leads →"
              showAccountInfoWhenAuthenticated={false}
              extraStyle="btn-brand btn-lg"
            />
            <a href="#how" className="btn btn-ghost-line btn-lg">
              See how it works
            </a>
          </div>
          <div className="hero-trust">
            <span>
              <Check /> Zero risk to your sending domain
            </span>
            <span>
              <Check /> Results in 10 min, monitored 24 h
            </span>
            <span>
              <Check /> Recover ~50% of catch-alls
            </span>
          </div>
        </div>

        <div className="hero-demo-wrap">
          <HeroDemo />
        </div>

        <div className="logos">
          <div className="logos-label">Slots into the stack you already run</div>
          <div className="logos-row">
            {compatibleLogos.map((logo) => (
              <Image
                key={logo.name}
                src={logo.src}
                alt={logo.name}
                width={logo.width}
                height={logo.height}
                className={logo.tall ? "tall" : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatBand() {
  return (
    <section className="section-sm">
      <div className="wrap">
        <Reveal>
          <div className="statband">
            {STATS.map((s) => (
              <div className="stat" key={s.num}>
                <div className="stat-num">{s.accent ? <span className="accent">{s.num}</span> : s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function How() {
  return (
    <section className="section" id="how">
      <div className="wrap">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2 className="dsp section-title">Three steps. Zero risk to your domain.</h2>
            <p className="section-sub">
              Reeverify runs after your normal verification pass and recovers the leads it had to throw away.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className="how-steps">
            {STEPS.map((s) => (
              <div className="how-step" key={s.n}>
                <div className="how-step-num">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Proof() {
  return (
    <section className="section bg-alt" id="proof">
      <div className="wrap">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">Why it works</span>
            <h2 className="dsp section-title">Static checks guess. We actually deliver.</h2>
            <p className="section-sub">
              A real send tells you the truth a handshake never can — and that truth is worth about 42% of
              every catch-all batch.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className="compare">
            <div className="cmp old">
              <div className="cmp-tag">ZeroBounce · Hunter · static verifiers</div>
              <h4>Static SMTP handshake</h4>
              <p>Can&apos;t distinguish a real inbox from a catch-all, so it flags the whole batch “do not send.”</p>
              <div className="cmp-bignum">0% recovered</div>
              <div className="cmp-bar">
                <i></i>
              </div>
            </div>
            <div className="cmp new">
              <div className="cmp-tag">Reeverify · real-send probing</div>
              <h4>Real delivery + 24h monitoring</h4>
              <p>Sends an isolated test to each address and watches for delayed bounces — confirming which ones are genuinely safe.</p>
              <div className="cmp-bignum">~42% recovered</div>
              <div className="cmp-bar">
                <i></i>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Testimonial() {
  return (
    <section className="section">
      <div className="wrap">
        <Reveal>
          <div className="quote-card">
            <div className="quote-mark">“</div>
            <p className="quote-text">
              After ZeroBounce, 40–50% of our list came back catch-all — leads we&apos;d already paid for.
              Since adding Reeverify we recover nearly half of them as verified-safe. More volume, fewer
              bounces, far less wasted spend.
            </p>
            <div className="quote-author">
              <div className="quote-avatar">RC</div>
              <div>
                <div className="quote-name">Founder, Refund Cat</div>
                <div className="quote-role">Cold outreach &amp; lead generation</div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="section bg-alt" id="pricing">
      <div className="wrap">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">Pricing</span>
            <h2 className="dsp section-title">Credit-based. Every recovered lead pays for itself.</h2>
            <p className="section-sub">1 credit = 1 email verified. No seats, no setup fees, cancel anytime.</p>
          </div>
        </Reveal>
        <Reveal>
          <div className="pricing">
            {PLANS.map((p) => (
              <div className={`plan ${p.featured ? "feat" : ""}`} key={p.name}>
                {p.featured && <div className="plan-pop">Most popular</div>}
                <div className="plan-name">{p.name}</div>
                <div className="plan-price">
                  {p.price}
                  <span className="per">{p.per}</span>
                </div>
                <div className="plan-credits">{p.credits}</div>
                <div className="plan-unit">{p.unit}</div>
                <ul className="plan-feats">
                  {p.feats.map((f) => (
                    <li key={f}>
                      <Check />
                      {f}
                    </li>
                  ))}
                </ul>
                {p.name === "Enterprise" ? (
                  <a href="mailto:support@reeverify.com" className="btn btn-ghost-line">
                    {p.cta}
                  </a>
                ) : (
                  <ButtonSignin
                    text={p.cta}
                    showAccountInfoWhenAuthenticated={false}
                    extraStyle={p.featured ? "btn-brand" : "btn-ghost-line"}
                  />
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="section" id="faq">
      <div className="wrap">
        <Reveal>
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2 className="dsp section-title">Questions, answered.</h2>
          </div>
        </Reveal>
        <Reveal>
          <FaqList items={FAQS} />
        </Reveal>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="section-sm">
      <div className="wrap">
        <Reveal>
          <div className="cta-band">
            <h2>
              Stop deleting leads you already paid for. <span className="kw">Recover them today.</span>
            </h2>
            <p>Upload a catch-all list and see your recovery rate within 24 hours.</p>
            <ButtonSignin
              text="Get started →"
              authenticatedText="Get started →"
              showAccountInfoWhenAuthenticated={false}
              extraStyle="btn-brand btn-lg"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <Link href="/" className="brand-mark" aria-label="Reeverify home">
          <BrandLogo size="sm" />
        </Link>
        <nav className="footer-links">
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
          <Link href="/tos">Terms</Link>
          <Link href="/privacy-policy">Privacy</Link>
          <a href="mailto:support@reeverify.com">Support</a>
        </nav>
        <div className="footer-copy">© {new Date().getFullYear()} Reeverify</div>
      </div>
    </footer>
  );
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <div className={`site ${spaceGrotesk.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}>
        <Header />
        <main>
          <Hero />
          <StatBand />
          <How />
          <Proof />
          <Testimonial />
          <Pricing />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </>
  );
}
