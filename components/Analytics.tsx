import Script from "next/script";

// Renders nothing at all if NEXT_PUBLIC_GA_MEASUREMENT_ID isn't set — so
// local dev and any deployment that hasn't set up Analytics yet doesn't
// load anything or show a broken/empty tracking call. Must be
// NEXT_PUBLIC_-prefixed since this ID needs to reach the browser bundle.
export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
