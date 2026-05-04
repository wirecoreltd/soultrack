"use client";
import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";

const NotificationContext = createContext({});

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [egliseId, setEgliseId] = useState(null);

  // Chargement initial
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, eglise_id")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      setUserId(user.id);
      setEgliseId(profile.eglise_id);

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("eglise_id", profile.eglise_id)
        .or(`destinataire_id.eq.${user.id},destinataire_id.is.null`)
        .eq("lu", false)
        .order("created_at", { ascending: false })
        .limit(20);

      setNotifications(data || []);
    };

    init();
  }, []);

  // Realtime — écoute les nouvelles notifications
  useEffect(() => {
    if (!egliseId) return;

    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `eglise_id=eq.${egliseId}`,
      }, (payload) => {
        const notif = payload.new;
        if (!notif.destinataire_id || notif.destinataire_id === userId) {
          setNotifications((prev) => [notif, ...prev]);
        }
      })
      .subscribe();

    return () => channel.unsubscribe();
  }, [egliseId, userId]);

  const markAsRead = async (id) => {
    await supabase.from("notifications").update({ lu: true }).eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllAsRead = async () => {
    const ids = notifications.map((n) => n.id);
    if (ids.length === 0) return;
    await supabase.from("notifications").update({ lu: true }).in("id", ids);
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount: notifications.length,
      markAsRead,
      markAllAsRead,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
