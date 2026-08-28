/** Constructores de enlaces que usan los addons — compartidos entre el minisitio real y el laboratorio de pruebas. */

export function telHref(numero: string): string {
  return `tel:${numero.replace(/[^\d+]/g, "")}`;
}

export function waHref(numero: string, slug: string, mensajeBase?: string): string {
  const base = mensajeBase?.trim() || "Hola 👋, quiero hacer un pedido.";
  const mensaje = `${base} Vengo de ${slug}.enmochis.app`;
  return `https://wa.me/${numero.replace(/[^\d]/g, "")}?text=${encodeURIComponent(mensaje)}`;
}

export function urlGoogleMaps(lat: number, lng: number, nombre: string): string {
  return `https://maps.google.com/maps?q=${lat},${lng}(${encodeURIComponent(nombre)})`;
}

export function urlAppleMaps(lat: number, lng: number, nombre: string): string {
  return `https://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(nombre)}`;
}
