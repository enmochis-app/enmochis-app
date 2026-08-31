"use client";

import { use, useEffect, useState, useCallback } from "react";
import type { Addon, Negocio } from "@/lib/negocios";
import NegocioForm from "@/components/admin/NegocioForm";

export default function EditarNegocioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [catalogoAddons, setCatalogoAddons] = useState<Addon[]>([]);
  const [categorias, setCategorias] = useState<{ slug: string; nombre: string; emoji: string; color: string }[]>([]);
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
    fetch("/api/admin/addons")
      .then((r) => r.json())
      .then((body) => setCatalogoAddons(body.addons ?? []));
    fetch("/api/admin/categorias")
      .then((r) => r.json())
      .then((body) => setCategorias(body.categorias ?? []));
  }, [cargar]);

  if (cargando) return <p>Cargando...</p>;
  if (noEncontrado || !negocio) return <p>No se encontró ese negocio.</p>;

  return <NegocioForm negocio={negocio} catalogoAddons={catalogoAddons} categorias={categorias} onRecargar={cargar} />;
}
