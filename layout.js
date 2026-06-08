import "./globals.css";

export const metadata = {
  title: "Sesa Bin",
  description: "Waste Management App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
