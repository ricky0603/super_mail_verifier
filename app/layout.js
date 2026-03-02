import { RootProvider } from "fumadocs-ui/provider/next";
import Script from "next/script";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import "./globals.css";

const GA_MEASUREMENT_ID = "G-ZQP0K724BY";
const CLARITY_PROJECT_ID = "vpeaxdsgye";

export const viewport = {
	// Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
	themeColor: config.colors.main,
	width: "device-width",
	initialScale: 1,
};

// This adds default SEO tags to all pages in our app.
// You can override them in each page passing params to getSEOTags() function.
export const metadata = getSEOTags({
  canonicalUrlRelative: "/",
});

export default function RootLayout({ children }) {
  const isProduction = process.env.NODE_ENV === "production";

	return (
		<html
			lang="en"
			data-theme={config.colors.theme}
			suppressHydrationWarning
		>
			<body className="flex min-h-screen flex-col">
        {isProduction ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
            <Script id="clarity-init" strategy="afterInteractive">
              {`
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
              `}
            </Script>
          </>
        ) : null}
				<RootProvider>
					{/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
					<ClientLayout>{children}</ClientLayout>
				</RootProvider>
			</body>
		</html>
	);
}
