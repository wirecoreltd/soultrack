"use client";

import PublicHeader from "../components/PublicHeader";
import Footer from "../components/Footer";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ nom: "", email: "", message: "" });
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess("✅ Message envoyé ! Nous vous répondrons bientôt.");
    setFormData({ nom: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicHeader />

      <main className="flex-grow max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center">Contactez-nous</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="nom"
            placeholder="Votre nom"
            value={formData.nom}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Votre email"
            value={formData.email}
            onChange={handleChange}
            className="input"
            required
          />
          <textarea
            name="message"
            placeholder="Votre message"
            value={formData.message}
            onChange={handleChange}
            className="input h-32 resize-none"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition font-semibold"
          >
            Envoyer
          </button>
        </form>

        {success && <p className="mt-4 text-green-600 font-semibold">{success}</p>}
      </main>

      <Footer />

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
