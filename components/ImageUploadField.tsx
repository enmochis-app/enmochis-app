"use client";

import { useRef, useState } from "react";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageUploadField({
  label,
  campo,
  uploadUrl,
  existentes,
  multiple,
  onUploaded,
}: {
  label: string;
  campo: string;
  uploadUrl: string;
  existentes: string[];
  multiple?: boolean;
  onUploaded: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);

  async function subirArchivos(files: FileList) {
    setSubiendo(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        const base64 = await fileToBase64(file);
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campo, filename: file.name, contentType: file.type, base64 }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "No se pudo subir la foto.");
        }
      }
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir la foto.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="admin-field">
      <label>{label}</label>
      {existentes.length > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          {existentes.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url + i} src={url} className="admin-thumb" alt="" />
          ))}
        </div>
      )}
      <div
        className={`admin-dropzone${drag ? " drag" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files.length) subirArchivos(e.dataTransfer.files);
        }}
      >
        {subiendo ? "Subiendo..." : "Arrastra una foto aquí o haz clic para elegirla"}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files?.length) subirArchivos(e.target.files);
          e.target.value = "";
        }}
      />
      {error && <div className="admin-error">{error}</div>}
    </div>
  );
}
