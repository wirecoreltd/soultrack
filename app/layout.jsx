import { MembersProvider } from "../context/MembersContext";
import { FeaturesProvider } from "../components/FeaturesContext";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
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
