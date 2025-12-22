import { MembersProvider } from "../context/MembersContext";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <MembersProvider>
          {children}
        </MembersProvider>
      </body>
    </html>
  );
}
