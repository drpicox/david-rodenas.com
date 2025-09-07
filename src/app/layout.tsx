import type { Metadata } from "next";
import "./globals.css";
import { LinkCmd } from "@/features/shell/components/LinkCmd";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "David Rodenas | @drpicox",
  description: "Personal website of David Rodenas, Software Developer and PhD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();

  return (
    <html lang="en">
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            (function() {
              // Read the saved theme from localStorage
              const savedTheme = localStorage.getItem('theme');

              // Apply the theme class
              if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark-theme');
              } else if (savedTheme === 'light') {
                document.documentElement.classList.add('light-theme');
              }
              // If no saved theme, system preference will be used automatically via CSS media query
            })();
          `}
        </Script>
        <Script
          data-goatcounter="https://drpicox.goatcounter.com/count"
          src="//gc.zgo.at/count.js"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <div className="max-w-4xl mx-auto p-4">
          {/* Header styled as terminal UI */}
          <header className="mb-6 border-b border-gray-400 pb-4 font-mono">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">@drpicox</div>
              <div className="text-sm opacity-70">
                <span>Type </span>
                <LinkCmd command="theme">theme</LinkCmd>
                <span> to toggle dark/light mode</span>
              </div>
            </div>
            <div className="mt-2 font-mono">
              <Link href="/" className="mr-4 hover:underline terminal-link">
                HOME
              </Link>
              <Link href="/book" className="mr-4 hover:underline terminal-link">
                BOOK
              </Link>
              <Link href="/blog" className="mr-4 hover:underline terminal-link">
                BLOG
              </Link>
              <Link
                href="/testing"
                className="mr-4 hover:underline terminal-link"
              >
                TESTING
              </Link>
              <Link
                href="/teaching"
                className="mr-4 hover:underline terminal-link"
              >
                TEACHING
              </Link>
            </div>
          </header>

          {/* Main content */}
          {children}

          {/* Footer styled as terminal UI */}
          <footer className="mt-12 pt-4 border-t border-gray-400 text-gray-500 font-mono text-sm">
            <div className="flex justify-between items-center">
              <div>Copyright © {currentYear} David Rodenas</div>
              <div className="flex gap-3">
                <a
                  href="http://linkedin.com/in/davidrodenas/"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="hover:text-gray-300"
                >
                  L
                </a>
                <a
                  href="https://github.com/drpicox"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="hover:text-gray-300"
                >
                  G
                </a>
                <a
                  href="https://twitter.com/drpicox"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="hover:text-gray-300"
                >
                  T
                </a>
                <a
                  href="https://medium.com/@drpicox"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="hover:text-gray-300"
                >
                  M
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
