import { Great_Vibes } from "next/font/google";
import { MembersProvider } from "../context/MembersContext";
import { FeaturesProvider } from "../components/FeaturesContext";
import NavigationBarSync from "../components/NavigationBarSync";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});

export const metadata = {
  metadataBase: new URL("https://soultrack.org"),
  title: "SoulTrack",
  description: "Pilotez votre église avec clarté et précision.",
  openGraph: {
    title: "SoulTrack",
    description: "Pilotez votre église avec clarté et précision.",
    url: "https://soultrack.org",
    siteName: "SoulTrack",
    images: [
      {
        url: "/logo.png",
        width: 50,
        height: 50,
        alt: "SoulTrack",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SoulTrack",
    description: "Pilotez votre église avec clarté et précision.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={greatVibes.variable}>
      <body>
        <NavigationBarSync />
        <MembersProvider>
          <FeaturesProvider>
            {children}
          </FeaturesProvider>
        </MembersProvider>
      </body>
    </html>
  );
}
