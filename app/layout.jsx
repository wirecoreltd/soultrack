import { Great_Vibes } from "next/font/google";
import { MembersProvider } from "../context/MembersContext";
import { FeaturesProvider } from "../components/FeaturesContext";
import NavigationBarSync from "../components/NavigationBarSync";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});

export const viewport = {
  // Nécessaire pour que le WebView s'étende derrière les barres système
  // (status bar / nav bar transparentes sur Android 15+ et sous le notch iOS)
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

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
      <body
        style={{
          // Empêche le contenu d'être masqué par la status bar / nav bar
          // transparentes maintenant que le WebView s'étend derrière elles
          // (Android 15+ edge-to-edge, notch iOS).
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
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
