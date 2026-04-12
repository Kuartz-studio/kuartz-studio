import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Kuartz Admin",
  description: "Kuartz administration platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('kuartz-theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})()` }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            className: "bg-[var(--color-card)] text-[var(--color-foreground)] border border-[var(--color-border)] shadow-md font-sans text-sm",
          }}
        />
      </body>
    </html>
  );
}
