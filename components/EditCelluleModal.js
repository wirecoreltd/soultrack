"use client";

import { useState, useEffect, useRef } from "react";
import supabase from "../lib/supabaseClient";

export default function EditCelluleModal({ cellule, onClose, onUpdated }) {
  const [celluleName, setCelluleName] = useState(cellule?.cellule || "");
  const [ville, setVille] = useState(cellule?.ville || "");
  const [responsable, setResponsable] = useState(cellule?.responsable || "");
  const [telephone, setTelephone] = useState(cellule?.telephone || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSave = async () => {
    setMessage("");
    if (!celluleName.trim()) return setMessage("❌ Le nom de la cellule est obligatoire.");
    if (!ville.trim()) return setMessage("❌ La ville est obligatoire.");

    setLoading(true);
    const { data, error } = await supabase
      .from("cellules")
      .update({ cellule: celluleName, ville, responsable, telephone })
      .eq("id", cellule.id)
      .select()
      .single();

    setLoading(false);

    if (!error) {
      onUpdated(data);
      onClose();
    } else {
      console.error("❌ UPDATE ERROR:", error);
      setMessage("❌ Une erreur est survenue lors de l'enregistrement.");
    }
  };

  if (!cellule) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        background: "rgba(30,35,90,0.35)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        style={{ background: "#ffffff", border: "1px solid #e2e8f0" }}
      >
        {/* ── Header ── */}
        <div
          className="px-6 pt-6 pb-4"
          style={{
            background: "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)",
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-white font-bold text-sm transition-all"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            ✕
          </button>
          <h2 className="text-xl font-bold text-white pr-10">
            🏠 {cellule.cellule_full || cellule.cellule}
          </h2>
          <p className="text-blue-100 text-sm mt-1 opacity-80">
            Modifier la cellule
          </p>
        </div>

        {/* ── Body ── */}
        <div
          className="overflow-y-auto px-6 py-5 flex flex-col gap-5"
          style={{ maxHeight: "68vh" }}
        >
          <SectionTitle>📋 Informations générales</SectionTitle>

          <Field label="Nom de la cellule">
            <input
              className="inp"
              value={celluleName}
              onChange={(e) => setCelluleName(e.target.value)}
              placeholder="Ex : Cellule Espoir"
            />
          </Field>

          <Field label="Ville">
            <input
              className="inp"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder="Ex : Paris"
            />
          </Field>

          <SectionTitle>👤 Responsable</SectionTitle>

          <Field label="Nom du responsable">
            <input
              className="inp"
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
              placeholder="Prénom Nom"
            />
          </Field>

          <Field label="Téléphone">
            <input
              className="inp"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+33 6 00 00 00 00"
            />
          </Field>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-all"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60"
            style={{
              background: loading
                ? "#a0a0c0"
                : "linear-gradient(135deg, #2E3192 0%, #4f54c9 100%)",
            }}
          >
            {loading ? "Enregistrement..." : "💾 Sauvegarder"}
          </button>
        </div>

        {message && (
          <p
            className="text-center text-sm font-semibold px-6 pb-4"
            style={{ color: message.includes("❌") ? "#dc2626" : "#2E3192" }}
          >
            {message}
          </p>
        )}

        <style jsx>{`
          .inp {
            width: 100%;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 10px 12px;
            background: #f8fafc;
            color: #1e293b;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
          }
          .inp:focus {
            border-color: #2E3192;
            background: #fff;
          }
        `}</style>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span
        className="text-xs font-bold uppercase tracking-widest"
        style={{ color: "#2E3192" }}
      >
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: "#e2e8f0" }} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: "#64748b" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
