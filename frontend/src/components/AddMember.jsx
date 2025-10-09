// frontend/src/components/AddMember.jsx
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

export default function AddMember() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneE164, setPhoneE164] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('Enregistrement en cours...');
    const { data, error } = await supabase.from('members').insert([{
      first_name: firstName,
      last_name: lastName,
      phone_e164: phoneE164,
      email,
      date_premiere_visite: new Date().toISOString()
    }]);
    if (error) setMsg('Erreur: ' + error.message);
    else setMsg('Enregistré. Merci !');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Prénom" required />
      <input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Nom" />
      <input value={phoneE164} onChange={e=>setPhoneE164(e.target.value)} placeholder="+230XXXXXXXX" required />
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email (optionnel)" />
      <button type="submit">Enregistrer</button>
      <div>{msg}</div>
    </form>
  );
}
