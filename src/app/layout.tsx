import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  <html>
    <body>
   {children}
    </body>
</html>
}
