import "../styles/globals.css";
import { MembersProvider } from "../context/MembersContext";
import { FeaturesProvider } from "../components/FeaturesContext";
import { NotificationsProvider } from "../context/NotificationsContext";

function MyApp({ Component, pageProps }) {
  return (
    <FeaturesProvider>
      <MembersProvider>
        <NotificationsProvider>
          <Component {...pageProps} />
        </NotificationsProvider>
      </MembersProvider>
    </FeaturesProvider>
  );
}

export default MyApp;
