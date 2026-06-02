import { Great_Vibes } from "next/font/google";
import { MembersProvider } from "../context/MembersContext";
import { FeaturesProvider } from "../components/FeaturesContext";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={greatVibes.variable}>
      <body>
        <MembersProvider>
          <FeaturesProvider>
            {children}
          </FeaturesProvider>
        </MembersProvider>
      </body>
    </html>
  );
}
