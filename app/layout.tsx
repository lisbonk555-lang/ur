import React from 'react';
import '../src/index.css';

export const metadata = {
  title: 'UpFrica Bot Network - The Router to Global Capital',
  description: 'Unlimited API for $660T Markets. 2% Bot-to-Bot Fee.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-emerald-500 selection:text-zinc-950">
        {children}
      </body>
    </html>
  );
}
