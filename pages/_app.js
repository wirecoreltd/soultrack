import "../styles/globals.css";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { MembersProvider } from "../context/MembersContext";
import { FeaturesProvider } from "../components/FeaturesContext";
import { NotificationsProvider } from "../context/NotificationsContext";
import { Great_Vibes } from "next/font/google";
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});
function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Ne s'exécute que dans l'app native Android/iOS (Capacitor), pas sur le web
    if (typeof window === "undefined" || !window.Capacitor) return;

    let listenerHandle;

    const setupListener = async () => {
      const { App } = await import("@capacitor/app");

      listenerHandle = await App.addListener("appUrlOpen", (data) => {
        // data.url est du type "https://www.soultrack.org/accept-invitation?token=..."
        try {
          const url = new URL(data.url);
          const path = url.pathname + url.search; // "/accept-invitation?token=..."
          router.push(path);
        } catch (err) {
          console.error("Erreur appUrlOpen :", err);
        }
      });
    };

    setupListener();

    return () => {
      listenerHandle?.remove();
    };
  }, [router]);

  return (
    <div className={greatVibes.variable}>
      <FeaturesProvider>
        <MembersProvider>
          <NotificationsProvider>
            <Component {...pageProps} />
          </NotificationsProvider>
        </MembersProvider>
      </FeaturesProvider>
    </div>
  );
}
export default MyApp;
