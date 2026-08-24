"use client";

import { use, useEffect, useState, useCallback } from "react";
import type { Negocio } from "@/lib/airtable";
import NegocioForm from "@/components/admin/NegocioForm";

export default function EditarNegocioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);

  const cargar = useCallback(async () => {
    const res = await fetch(`/api/admin/negocios/${id}`);
    if (!res.ok) {
      setNoEncontrado(true);
      setCargando(false);
      return;
    }
    const body = await res.json();
    setNegocio(body.negocio);
    setCargando(false);
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar
    cargar();
  }, [cargar]);

  if (cargando) return <p>Cargando...</p>;
  if (noEncontrado || !negocio) return <p>No se encontró ese negocio.</p>;

  return <NegocioForm negocio={negocio} onRecargar={cargar} />;
}
