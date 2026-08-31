import { getCategorias } from "@/lib/negocios";
import NegocioForm from "@/components/admin/NegocioForm";

export default async function NuevoNegocioPage() {
  const categorias = await getCategorias();
  return <NegocioForm negocio={null} catalogoAddons={[]} categorias={categorias} />;
}
