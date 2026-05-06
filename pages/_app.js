import "../styles/globals.css";
import { MembersProvider } from "../context/MembersContext";
import { FeaturesProvider } from "../context/FeaturesContext";

function MyApp({ Component, pageProps }) {
  return (
    <FeaturesProvider>
      <MembersProvider>
        <Component {...pageProps} />
      </MembersProvider>
    </FeaturesProvider>
  );
}

export default MyApp;
