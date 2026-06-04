import { useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../lib/supabaseClient";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        router.replace("/hub");
      } else {
        router.replace("/login");
      }
    };
    check();
  }, [router]);

  return null;
}
