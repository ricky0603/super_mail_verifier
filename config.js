const config = {
  // REQUIRED
  appName: "ShipFast Supabase",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "The NextJS boilerplate with all you need to build your SaaS, AI tool, or any other web app.",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "reeverify.com",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    plans: [
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1Sy6ZFB27fwLi0YrmkLj144i"
            : "price_1Szr3KBGytd3Tykemu94SxJG",
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: "Starter",
        // A friendly description of the plan, displayed on the pricing page.
        description: "For getting started with small lists.",
        // The price you want to display, the one user will be charged on Stripe.
        price: 49,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: null,
        // Credits reset on every successful subscription payment (invoice.paid).
        creditsPerCycle: 500,
        features: [
          {
            name: "500 credits / month",
          },
          { name: "CSV upload + export" },
          { name: "Email verification" },
        ],
      },
      {
        // This plan will look different on the pricing page, it will be highlighted.
        isFeatured: true,
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1Sy6aqB27fwLi0Yr8zEpnQaE"
            : "price_1Szr3MBGytd3Tykex4qjYgnn",
        name: "Growth",
        description: "For growing teams and bigger lists.",
        price: 149,
        priceAnchor: null,
        creditsPerCycle: 3000,
        features: [
          {
            name: "3,000 credits / month",
          },
          { name: "CSV upload + export" },
          { name: "Email verification" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1Sy6bJB27fwLi0YrTxXKT4yj"
            : "price_1Szr3OBGytd3TykeVqNkNFLv",
        name: "Scale",
        description: "For high-volume verification.",
        price: 399,
        priceAnchor: null,
        creditsPerCycle: 12000,
        features: [
          {
            name: "12,000 credits / month",
          },
          { name: "CSV upload + export" },
          { name: "Email verification" },
        ],
      },
    ],
    // One-time (Pay as you go) credits price.
    creditTopupPriceId:
      process.env.NODE_ENV === "development"
        ? "price_1Sy2ZnB27fwLi0YrROxkvXKh"
        : "price_1Szr3FBGytd3Tyke6zxgqfva",
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `ReeVerify <noreply@mail.reeverify.com>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `ReeVerify Support <support@reeverify.com>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "support@reeverify.com",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode).
    theme: "bumblebee",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..).
    // For DaisyUI v5, we use a standard primary color
    main: "#ffd900",
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
};

export default config;
