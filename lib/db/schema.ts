import { pgTable, text, boolean, date, timestamp } from "drizzle-orm/pg-core";

export const negocios = pgTable("negocios", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  nombre: text("nombre").notNull(),
  slug: text("slug").notNull().unique(),
  categoria: text("categoria").notNull().default("Restaurantes"),
  descripcionCorta: text("descripcion_corta").default(""),
  descripcionLarga: text("descripcion_larga").default(""),

  logoUrl: text("logo_url"),
  logoForma: text("logo_forma").notNull().default("circular"),
  fotoPortada: text("foto_portada"),
  colorAcento: text("color_acento").notNull().default("#C8FF3D"),

  estado: text("estado").notNull().default("solicitud"),
  plan: text("plan"),
  fechaProximaRenovacion: date("fecha_proxima_renovacion", { mode: "string" }),
  fechaAfiliacion: date("fecha_afiliacion", { mode: "string" }),

  contactoNombre: text("contacto_nombre"),
  telefono: text("telefono"),
  whatsapp: text("whatsapp"),
  direccion: text("direccion"),
  googleMapsUrl: text("google_maps_url"),
  appleMapsUrl: text("apple_maps_url"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  horarios: text("horarios"),

  galeria1Foto: text("galeria_1_foto"),
  galeria1Nombre: text("galeria_1_nombre"),
  galeria1Precio: text("galeria_1_precio"),
  galeria2Foto: text("galeria_2_foto"),
  galeria2Nombre: text("galeria_2_nombre"),
  galeria2Precio: text("galeria_2_precio"),
  galeria3Foto: text("galeria_3_foto"),
  galeria3Nombre: text("galeria_3_nombre"),
  galeria3Precio: text("galeria_3_precio"),

  menu: text("menu").notNull().default(""),

  addonWhatsapp: boolean("addon_whatsapp").notNull().default(false),
  addonMapas: boolean("addon_mapas").notNull().default(false),
  addonGaleria: boolean("addon_galeria").notNull().default(false),
  addonPedidos: boolean("addon_pedidos").notNull().default(false),
  addonQrMesa: boolean("addon_qr_mesa").notNull().default(false),
  addonLealtad: boolean("addon_lealtad").notNull().default(false),
  addonMultiSucursal: boolean("addon_multi_sucursal").notNull().default(false),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type NegocioRow = typeof negocios.$inferSelect;
export type NuevoNegocioRow = typeof negocios.$inferInsert;
