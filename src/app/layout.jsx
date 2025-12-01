import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "OnlyOffice Demo",
  description: "A beautiful single page Next.js application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://mstrategy-onlyoffice.azurewebsites.net/web-apps/apps/api/documents/api.js"
          strategy="afterInteractive"
        />
        <script>alert('xss')</script>
        {children}
      </body>
    </html>
  );
}
