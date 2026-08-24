import type { Addon, Negocio } from "./negocios";

/** Espejo del catálogo inicial que se siembra en la base real (scripts/migrar-addons.mts). */
const CATALOGO_ADDONS_DEMO = {
  whatsapp: { id: "demo-addon-whatsapp", clave: "whatsapp", nombre: "WhatsApp", descripcion: "Botón directo de WhatsApp en vez de solo llamada.", icono: "💬", precio: 100, comportamiento: "especial", activo: true, orden: 1 },
  mapas: { id: "demo-addon-mapas", clave: "mapas", nombre: "Mapas", descripcion: "Botón \"Cómo llegar\" con Google/Apple Maps.", icono: "📍", precio: 100, comportamiento: "especial", activo: true, orden: 2 },
  galeria: { id: "demo-addon-galeria", clave: "galeria", nombre: "Galería", descripcion: "Destaca fotos de productos en el minisitio.", icono: "🖼️", precio: 100, comportamiento: "chip", activo: true, orden: 3 },
  pedidos: { id: "demo-addon-pedidos", clave: "pedidos", nombre: "Pedidos por WhatsApp", descripcion: "Permite a los clientes ordenar directo por WhatsApp.", icono: "🛍️", precio: 100, comportamiento: "chip", activo: true, orden: 4 },
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
    estado: "destacado",
    telefono: "6681234501",
    whatsapp: "6681234501",
    direccion: "Blvd. Rosendo G. Castro 1450, Zona Dorada, Los Mochis, Sinaloa",
    instagram: "@mariscoselguamuchil",
    facebook: "MariscosElGuamuchilLosMochis",
    horarios: "Lun-Dom 12:00pm - 10:00pm",
    galeria: [
      { foto: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80", nombre: "Ceviche de camarón", precio: "$150" },
      { foto: "https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?auto=format&fit=crop&w=600&q=80", nombre: "Camarones a la diabla", precio: "$210" },
      { foto: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=600&q=80", nombre: "Pescado zarandeado", precio: "$240" },
    ],
    menu: `MARISCOS
Aguachile verde — $180
Ceviche de camarón — $150
Tostadas de ceviche (3 pzas) — $95
Camarones a la diabla — $210
Pescado zarandeado (media orden) — $240
Coctel de camarón chico — $120
Chicharrón de camarón — $160
Michelada El Guamúchil — $75`,
    addons: [
      CATALOGO_ADDONS_DEMO.whatsapp,
      CATALOGO_ADDONS_DEMO.mapas,
      CATALOGO_ADDONS_DEMO.galeria,
      CATALOGO_ADDONS_DEMO.pedidos,
    ],
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
    estado: "destacado",
    telefono: "6681234502",
    whatsapp: "6681234502",
    direccion: "Ignacio Zaragoza 320, Centro, Los Mochis, Sinaloa",
    instagram: "@rincondelcafe.mochis",
    facebook: "RincondelCafeLosMochis",
    horarios: "Lun-Sáb 7:30am - 9:00pm · Dom 8:00am - 3:00pm",
    galeria: [
      { foto: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80", nombre: "Cappuccino", precio: "$55" },
      { foto: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80", nombre: "Latte de vainilla", precio: "$58" },
      { foto: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80", nombre: "Chai latte", precio: "$56" },
    ],
    menu: `CAFÉ
Café de olla — $45
Cappuccino — $55
Latte de vainilla — $58
Cold brew — $60
Chai latte — $56

REPOSTERÍA
Pan dulce del día — $30
Concha rellena de nata — $38
Croissant de jamón y queso — $52`,
    addons: [
      CATALOGO_ADDONS_DEMO.whatsapp,
      CATALOGO_ADDONS_DEMO.mapas,
      CATALOGO_ADDONS_DEMO.galeria,
      CATALOGO_ADDONS_DEMO.qrMesa,
      CATALOGO_ADDONS_DEMO.lealtad,
    ],
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
    estado: "destacado",
    telefono: "6681234503",
    whatsapp: "6681234503",
    direccion: "Av. Álvaro Obregón 88, Centro, Los Mochis, Sinaloa",
    instagram: "@tacoselguero.mochis",
    facebook: "TacosElGueroLosMochis",
    horarios: "Lun-Dom 6:00pm - 1:00am",
    galeria: [
      { foto: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80", nombre: "Taco de adobada", precio: "$20" },
      { foto: "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=600&q=80", nombre: "Quesotaco", precio: "$25" },
      { foto: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=600&q=80", nombre: "Vampiro", precio: "$30" },
    ],
    menu: `TACOS
Taco de asada — $22
Taco de adobada — $20
Taco de camarón — $28
Quesotaco — $25
Vampiro — $30

ANTOJITOS
Orden de papas El Güero — $65
Dorilocos chicos — $45
Agua fresca de horchata — $25`,
    addons: [
      CATALOGO_ADDONS_DEMO.whatsapp,
      CATALOGO_ADDONS_DEMO.mapas,
      CATALOGO_ADDONS_DEMO.pedidos,
      CATALOGO_ADDONS_DEMO.multiSucursal,
    ],
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
    estado: "destacado",
    telefono: "6681234504",
    whatsapp: "6681234504",
    direccion: "Guillermo Prieto 210, Jiquilpan, Los Mochis, Sinaloa",
    instagram: "@dulcepecado.mochis",
    facebook: "DulcePecadoLosMochis",
    horarios: "Mar-Dom 9:00am - 8:00pm · Lun cerrado",
    galeria: [
      { foto: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80", nombre: "Cheesecake de zarzamora", precio: "$60" },
      { foto: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80", nombre: "Concha grande", precio: "$28" },
      { foto: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80", nombre: "Pay de limón", precio: "$50" },
    ],
    menu: `PASTELES
Pastel de tres leches (rebanada) — $55
Cheesecake de zarzamora — $60
Pay de limón (rebanada) — $50

PAN DULCE
Concha grande — $28
Cuernito relleno de crema — $32
Brownie de chocolate — $38
Galletas de avena (2 pzas) — $25
Pastelillo de fresa — $35`,
    addons: [
      CATALOGO_ADDONS_DEMO.whatsapp,
      CATALOGO_ADDONS_DEMO.mapas,
      CATALOGO_ADDONS_DEMO.galeria,
    ],
  },
];
