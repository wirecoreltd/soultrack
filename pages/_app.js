import "../styles/globals.css";
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
