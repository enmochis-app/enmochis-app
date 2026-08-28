import type { Addon, Negocio } from "./negocios";
import type { MenuItem } from "./menuItems";

/** Espejo del catálogo inicial que se siembra en la base real (scripts/migrar-addons.mts). */
const CATALOGO_ADDONS_DEMO = {
  whatsapp: { id: "demo-addon-whatsapp", clave: "whatsapp", nombre: "WhatsApp", descripcion: "Botón directo de WhatsApp en vez de solo llamada.", icono: "💬", precio: 100, comportamiento: "especial", activo: true, orden: 1 },
  mapas: { id: "demo-addon-mapas", clave: "mapas", nombre: "Mapas", descripcion: "Botón \"Cómo llegar\" con Google/Apple Maps.", icono: "📍", precio: 100, comportamiento: "especial", activo: true, orden: 2 },
  galeria: { id: "demo-addon-galeria", clave: "galeria", nombre: "Galería", descripcion: "Carrusel de fotos de producto en el minisitio.", icono: "🖼️", precio: 100, comportamiento: "especial", activo: true, orden: 3 },
  pedidos: { id: "demo-addon-pedidos", clave: "pedidos", nombre: "Pedidos por WhatsApp", descripcion: "Permite a los clientes ordenar directo por WhatsApp.", icono: "🛍️", precio: 100, comportamiento: "especial", activo: true, orden: 4 },
  citas: { id: "demo-addon-citas", clave: "citas", nombre: "Citas por WhatsApp", descripcion: "Botón para agendar cita por WhatsApp con mensaje prellenado.", icono: "📅", precio: 100, comportamiento: "especial", activo: true, orden: 5 },
  qrMesa: { id: "demo-addon-qr-mesa", clave: "qr_mesa", nombre: "Pide desde tu mesa (QR)", descripcion: "Código QR en mesa para pedir sin esperar mesero.", icono: "📱", precio: 100, comportamiento: "chip", activo: true, orden: 5 },
  lealtad: { id: "demo-addon-lealtad", clave: "lealtad", nombre: "Programa de lealtad", descripcion: "Programa de puntos o visitas para clientes frecuentes.", icono: "⭐", precio: 100, comportamiento: "chip", activo: true, orden: 6 },
  multiSucursal: { id: "demo-addon-multi-sucursal", clave: "multi_sucursal", nombre: "Varias sucursales", descripcion: "Indica que el negocio tiene más de una ubicación.", icono: "🏬", precio: 100, comportamiento: "chip", activo: true, orden: 7 },
} satisfies Record<string, Addon>;

/**
 * Datos de ejemplo, solo para fines ilustrativos mientras la base de datos
 * no está conectada (o mientras todavía no tiene negocios reales). En cuanto
 * POSTGRES_URL esté configurado y la consulta funcione, estos datos dejan
 * de usarse automáticamente — ver el try/catch en cada función de
 * lib/negocios.ts.
 */
export const SAMPLE_NEGOCIOS: Negocio[] = [
  {
    id: "sample-mariscos-el-guamuchil",
    nombre: "Mariscos El Guamúchil",
    slug: "mariscos-el-guamuchil",
    categoria: "Restaurantes",
    descripcionCorta: "Mariscos frescos estilo Sinaloa",
    descripcionLarga:
      "Desde 2015 servimos mariscos frescos de la costa de Sinaloa: aguachiles, ceviches y pescado zarandeado preparado al carbón todos los días. Ambiente familiar, ideal para comer en grupo.",
    logoUrl:
      "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=300&q=80",
    logoForma: "circular",
    fotoPortada:
      "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1000&q=85",
    colorAcento: "#C8FF3D",
    degradadoInferior: "negro",
    estado: "destacado",
    telefono: "6681234501",
    whatsapp: "6681234501",
    mensajeWhatsapp: "Hola 👋, quiero hacer un pedido.",
    mensajeCitas: "Hola 👋, quiero agendar una mesa para un evento.",
    direccion: "Blvd. Rosendo G. Castro 1450, Zona Dorada, Los Mochis, Sinaloa",
    lat: 25.7912,
    lng: -108.9908,
    instagram: "@mariscoselguamuchil",
    facebook: "MariscosElGuamuchilLosMochis",
    horarios: "Lun-Dom 12:00pm - 10:00pm",
    galeria: [
      { foto: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80", nombre: "Ceviche de camarón", precio: "$150", unidad: "orden", descripcion: "Camarón fresco, limón y salsa de la casa." },
      { foto: "https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?auto=format&fit=crop&w=600&q=80", nombre: "Camarones a la diabla", precio: "$210", unidad: "orden" },
      { foto: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=600&q=80", nombre: "Pescado zarandeado", precio: "$240", unidad: "media orden" },
    ],
    addons: [
      CATALOGO_ADDONS_DEMO.whatsapp,
      CATALOGO_ADDONS_DEMO.mapas,
      CATALOGO_ADDONS_DEMO.galeria,
      CATALOGO_ADDONS_DEMO.pedidos,
      CATALOGO_ADDONS_DEMO.citas,
    ],
    lealtadModo: "visitas",
    lealtadPorcentaje: 0,
    lealtadMeta: 10,
    tienePortal: false,
  },
  {
    id: "sample-rincon-del-cafe",
    nombre: "Rincón del Café",
    slug: "rincon-del-cafe",
    categoria: "Cafeterías",
    descripcionCorta: "Café de especialidad · Centro",
    descripcionLarga:
      "Café de especialidad tostado localmente, repostería casera y un rincón tranquilo en pleno Centro de Los Mochis para trabajar, leer o platicar con calma.",
    logoUrl:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=300&q=80",
    logoForma: "circular",
    fotoPortada:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=85",
    colorAcento: "#E8B84B",
    degradadoInferior: "negro",
    estado: "destacado",
    telefono: "6681234502",
    whatsapp: "6681234502",
    mensajeWhatsapp: "Hola 👋, quiero hacer un pedido.",
    direccion: "Ignacio Zaragoza 320, Centro, Los Mochis, Sinaloa",
    lat: 25.7935,
    lng: -108.9947,
    instagram: "@rincondelcafe.mochis",
    facebook: "RincondelCafeLosMochis",
    horarios: "Lun-Sáb 7:30am - 9:00pm · Dom 8:00am - 3:00pm",
    galeria: [
      { foto: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80", nombre: "Cappuccino", precio: "$55", unidad: "c/u", descripcion: "Espresso doble con leche vaporizada." },
      { foto: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80", nombre: "Latte de vainilla", precio: "$58", unidad: "c/u" },
      { foto: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80", nombre: "Chai latte", precio: "$56", unidad: "c/u" },
    ],
    addons: [
      CATALOGO_ADDONS_DEMO.whatsapp,
      CATALOGO_ADDONS_DEMO.mapas,
      CATALOGO_ADDONS_DEMO.galeria,
      CATALOGO_ADDONS_DEMO.qrMesa,
      CATALOGO_ADDONS_DEMO.lealtad,
    ],
    lealtadModo: "visitas",
    lealtadPorcentaje: 0,
    lealtadMeta: 8,
    tienePortal: false,
  },
  {
    id: "sample-tacos-el-guero",
    nombre: "Tacos El Güero",
    slug: "tacos-el-guero",
    categoria: "Snacks",
    descripcionCorta: "Antojitos · Centro",
    descripcionLarga:
      "Tacos de asada y adobada al estilo Sinaloa desde hace más de 10 años. Ya somos 3 sucursales en Los Mochis por la demanda de nuestros clientes.",
    logoUrl:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=300&q=80",
    logoForma: "rectangular",
    fotoPortada:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1000&q=85",
    colorAcento: "#FF5A3C",
    degradadoInferior: "negro",
    estado: "destacado",
    telefono: "6681234503",
    whatsapp: "6681234503",
    mensajeWhatsapp: "Hola 👋, quiero hacer un pedido.",
    direccion: "Av. Álvaro Obregón 88, Centro, Los Mochis, Sinaloa",
    lat: 25.7898,
    lng: -108.9962,
    instagram: "@tacoselguero.mochis",
    facebook: "TacosElGueroLosMochis",
    horarios: "Lun-Dom 6:00pm - 1:00am",
    galeria: [
      { foto: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80", nombre: "Taco de adobada", precio: "$20", unidad: "c/u" },
      { foto: "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=600&q=80", nombre: "Quesotaco", precio: "$25", unidad: "c/u" },
      { foto: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=600&q=80", nombre: "Vampiro", precio: "$30", unidad: "c/u" },
    ],
    addons: [
      CATALOGO_ADDONS_DEMO.whatsapp,
      CATALOGO_ADDONS_DEMO.mapas,
      CATALOGO_ADDONS_DEMO.pedidos,
      CATALOGO_ADDONS_DEMO.multiSucursal,
    ],
    lealtadModo: "visitas",
    lealtadPorcentaje: 0,
    lealtadMeta: 10,
    tienePortal: false,
  },
  {
    id: "sample-dulce-pecado",
    nombre: "Dulce Pecado",
    slug: "dulce-pecado",
    categoria: "Panaderías",
    descripcionCorta: "Repostería · Centro",
    descripcionLarga:
      "Repostería artesanal: pasteles, cheesecakes y pan dulce horneados diario. También hacemos pasteles personalizados para cumpleaños y eventos — escríbenos con tiempo.",
    logoUrl:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80",
    logoForma: "cuadrada",
    fotoPortada:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85",
    colorAcento: "#FF7BAC",
    degradadoInferior: "negro",
    estado: "destacado",
    telefono: "6681234504",
    whatsapp: "6681234504",
    mensajeWhatsapp: "Hola 👋, quiero hacer un pedido.",
    direccion: "Guillermo Prieto 210, Jiquilpan, Los Mochis, Sinaloa",
    lat: 25.7856,
    lng: -108.9875,
    instagram: "@dulcepecado.mochis",
    facebook: "DulcePecadoLosMochis",
    horarios: "Mar-Dom 9:00am - 8:00pm · Lun cerrado",
    galeria: [
      { foto: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80", nombre: "Cheesecake de zarzamora", precio: "$60", unidad: "rebanada", descripcion: "Horneado diario con zarzamora fresca." },
      { foto: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80", nombre: "Concha grande", precio: "$28", unidad: "c/u" },
      { foto: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80", nombre: "Pay de limón", precio: "$50", unidad: "rebanada" },
    ],
    addons: [
      CATALOGO_ADDONS_DEMO.whatsapp,
      CATALOGO_ADDONS_DEMO.mapas,
      CATALOGO_ADDONS_DEMO.galeria,
    ],
    lealtadModo: "visitas",
    lealtadPorcentaje: 0,
    lealtadMeta: 10,
    tienePortal: false,
  },
  {
    id: "sample-tacos-el-compa",
    nombre: "Tacos El Compa",
    slug: "tacos-el-compa",
    categoria: "Restaurantes",
    descripcionCorta: "Tacos de asada · Centro",
    descripcionLarga:
      "Minisitio de prueba creado desde el laboratorio de addons — mismos datos genéricos, pero aquí puedes ver el minisitio real completo: portada, menú, pedidos por WhatsApp, mapa, cita y tarjeta de lealtad juntos.",
    logoUrl:
      "https://images.unsplash.com/photo-1517244683847-7456b63c5969?auto=format&fit=crop&w=300&q=80",
    logoForma: "circular",
    fotoPortada:
      "https://images.unsplash.com/photo-1613514785940-daed07799d9b?auto=format&fit=crop&w=1000&q=85",
    colorAcento: "#3DD9FF",
    degradadoInferior: "negro",
    estado: "destacado",
    telefono: "6681234567",
    whatsapp: "6681234567",
    mensajeWhatsapp: "Hola 👋, quiero hacer este pedido:",
    mensajeCitas: "Hola 👋, quiero agendar una cita.",
    direccion: "Blvd. Antonio Rosales 123, Centro, Los Mochis, Sinaloa",
    lat: 25.7953,
    lng: -108.9994,
    instagram: "@tacoselcompa",
    facebook: "TacosElCompaLosMochis",
    horarios: "Lun-Dom 6:00pm - 1:00am",
    galeria: [
      { foto: "https://images.unsplash.com/photo-1613514785940-daed07799d9b?auto=format&fit=crop&w=600&q=80", nombre: "Tacos de asada", precio: "$65", unidad: "orden" },
      { foto: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=600&q=80", nombre: "Volcán especial", precio: "$85", unidad: "c/u", descripcion: "Tortilla crujiente con queso gratinado y carne asada." },
      { foto: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80", nombre: "Agua fresca del día", precio: "$20", unidad: "c/u" },
    ],
    addons: [
      CATALOGO_ADDONS_DEMO.whatsapp,
      CATALOGO_ADDONS_DEMO.mapas,
      CATALOGO_ADDONS_DEMO.galeria,
      CATALOGO_ADDONS_DEMO.pedidos,
      CATALOGO_ADDONS_DEMO.citas,
      CATALOGO_ADDONS_DEMO.lealtad,
      CATALOGO_ADDONS_DEMO.qrMesa,
    ],
    lealtadModo: "visitas",
    lealtadPorcentaje: 0,
    lealtadMeta: 10,
    tienePortal: false,
  },
];

function itemsDemo(items: { categoria: string; nombre: string; precio: string; ordenable?: boolean }[]): MenuItem[] {
  return items.map((it, i) => ({
    id: `demo-item-${i}`,
    categoria: it.categoria,
    nombre: it.nombre,
    precio: it.precio,
    ordenable: it.ordenable ?? false,
    orden: i,
  }));
}

/** Menú de respaldo por negocio de ejemplo, usado si la base de datos no responde. */
export const SAMPLE_MENU_ITEMS: Record<string, MenuItem[]> = {
  "sample-mariscos-el-guamuchil": itemsDemo([
    { categoria: "MARISCOS", nombre: "Aguachile verde", precio: "180", ordenable: true },
    { categoria: "MARISCOS", nombre: "Ceviche de camarón", precio: "150", ordenable: true },
    { categoria: "MARISCOS", nombre: "Tostadas de ceviche (3 pzas)", precio: "95" },
    { categoria: "MARISCOS", nombre: "Camarones a la diabla", precio: "210", ordenable: true },
    { categoria: "MARISCOS", nombre: "Pescado zarandeado (media orden)", precio: "240" },
    { categoria: "MARISCOS", nombre: "Coctel de camarón chico", precio: "120" },
    { categoria: "MARISCOS", nombre: "Chicharrón de camarón", precio: "160" },
    { categoria: "MARISCOS", nombre: "Michelada El Guamúchil", precio: "75" },
  ]),
  "sample-rincon-del-cafe": itemsDemo([
    { categoria: "CAFÉ", nombre: "Café de olla", precio: "45", ordenable: true },
    { categoria: "CAFÉ", nombre: "Cappuccino", precio: "55", ordenable: true },
    { categoria: "CAFÉ", nombre: "Latte de vainilla", precio: "58", ordenable: true },
    { categoria: "CAFÉ", nombre: "Cold brew", precio: "60" },
    { categoria: "CAFÉ", nombre: "Chai latte", precio: "56" },
    { categoria: "REPOSTERÍA", nombre: "Pan dulce del día", precio: "30" },
    { categoria: "REPOSTERÍA", nombre: "Concha rellena de nata", precio: "38" },
    { categoria: "REPOSTERÍA", nombre: "Croissant de jamón y queso", precio: "52" },
  ]),
  "sample-tacos-el-guero": itemsDemo([
    { categoria: "TACOS", nombre: "Taco de asada", precio: "22", ordenable: true },
    { categoria: "TACOS", nombre: "Taco de adobada", precio: "20", ordenable: true },
    { categoria: "TACOS", nombre: "Taco de camarón", precio: "28" },
    { categoria: "TACOS", nombre: "Quesotaco", precio: "25", ordenable: true },
    { categoria: "TACOS", nombre: "Vampiro", precio: "30" },
    { categoria: "ANTOJITOS", nombre: "Orden de papas El Güero", precio: "65" },
    { categoria: "ANTOJITOS", nombre: "Dorilocos chicos", precio: "45" },
    { categoria: "ANTOJITOS", nombre: "Agua fresca de horchata", precio: "25" },
  ]),
  "sample-dulce-pecado": itemsDemo([
    { categoria: "PASTELES", nombre: "Pastel de tres leches (rebanada)", precio: "55" },
    { categoria: "PASTELES", nombre: "Cheesecake de zarzamora", precio: "60", ordenable: true },
    { categoria: "PASTELES", nombre: "Pay de limón (rebanada)", precio: "50" },
    { categoria: "PAN DULCE", nombre: "Concha grande", precio: "28", ordenable: true },
    { categoria: "PAN DULCE", nombre: "Cuernito relleno de crema", precio: "32" },
    { categoria: "PAN DULCE", nombre: "Brownie de chocolate", precio: "38", ordenable: true },
    { categoria: "PAN DULCE", nombre: "Galletas de avena (2 pzas)", precio: "25" },
    { categoria: "PAN DULCE", nombre: "Pastelillo de fresa", precio: "35" },
  ]),
  "sample-tacos-el-compa": itemsDemo([
    { categoria: "TACOS", nombre: "Taco de asada", precio: "22", ordenable: true },
    { categoria: "TACOS", nombre: "Taco de adobada", precio: "20", ordenable: true },
    { categoria: "TACOS", nombre: "Quesotaco", precio: "25", ordenable: true },
    { categoria: "TACOS", nombre: "Volcán especial", precio: "85" },
    { categoria: "ANTOJITOS", nombre: "Orden de papas", precio: "35", ordenable: true },
    { categoria: "ANTOJITOS", nombre: "Agua fresca del día", precio: "20", ordenable: true },
    { categoria: "ANTOJITOS", nombre: "Refresco de lata", precio: "18" },
  ]),
};
