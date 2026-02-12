"use client";

import Footer from "../components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-6 text-center">Contactez-nous</h1>
        <p className="text-gray-700 text-lg mb-6 text-center">
          Une question, un problème ou besoin d’une démo ? Remplissez le formulaire ci-dessous.
        </p>

        <form className="max-w-xl mx-auto flex flex-col gap-4">
          <input type="text" placeholder="Nom" className="border rounded-xl px-4 py-2" required />
          <input type="email" placeholder="Email" className="border rounded-xl px-4 py-2" required />
          <textarea placeholder="Message" className="border rounded-xl px-4 py-2 h-32" required />
          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-2xl shadow-md">
            Envoyer
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}
