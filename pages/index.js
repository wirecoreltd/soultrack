import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <>
      <Head>
        <title>SoulTrack</title>
        <meta name="description" content="Pilotez votre église avec clarté et précision." />

        <meta property="og:title" content="SoulTrack" />
        <meta property="og:description" content="Pilotez votre église avec clarté et précision." />
        <meta property="og:image" content="https://soultrack.org/logo.png" />
        <meta property="og:url" content="https://soultrack.org" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="SoulTrack" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="SoulTrack" />
        <meta name="twitter:description" content="Pilotez votre église avec clarté et précision." />
        <meta name="twitter:image" content="https://soultrack.org/logo.png" />
      </Head>
      <noscript>
        {/* Filet de sécurité si JS ne s'exécute pas tout de suite */}
      </noscript>
    </>
  );
}
