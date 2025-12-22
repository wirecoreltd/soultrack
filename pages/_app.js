import "../styles/globals.css";
import { MembersProvider } from "../context/MembersContext";

function MyApp({ Component, pageProps }) {
  return (
    <MembersProvider>
      <Component {...pageProps} />
    </MembersProvider>
  );
}

export default MyApp;
