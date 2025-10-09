// pages/admin/access-tokens.js
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import SendWhatsappButtons from "../../components/SendWhatsappButtons";

export default function AccessTokens() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role, username, responsable, phone_number");
    if (!error) setUsers(data);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Gestion des Access Tokens</h1>

      <h2 className="text-2xl font-semibold mb-4">Envoyer le lien via WhatsApp :</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map((user) => (
          <div
            key={user.id}
            className="p-4 bg-white rounded-xl shadow-md flex flex-col gap-2"
          >
            <p>
              <strong>{user.role}</strong> {user.username || ""}{" "}
              {user.responsable ? `(${user.responsable})` : ""}
            </p>

            <SendWhatsappButtons userId={user.id} phoneNumber={user.phone_number} />
          </div>
        ))}
      </div>
    </div>
  );
}
