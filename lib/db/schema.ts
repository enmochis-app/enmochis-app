import { pgTable, text, boolean, date, timestamp, integer, primaryKey, doublePrecision, index } from "drizzle-orm/pg-core";

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
  mensajeWhatsapp: text("mensaje_whatsapp"),
  direccion: text("direccion"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  horarios: text("horarios"),

  galeria1Foto: text("galeria_1_foto"),
  galeria1Nombre: text("galeria_1_nombre"),
  galeria1Precio: text("galeria_1_precio"),
  galeria1Unidad: text("galeria_1_unidad"),
  galeria1Descripcion: text("galeria_1_descripcion"),
  galeria2Foto: text("galeria_2_foto"),
  galeria2Nombre: text("galeria_2_nombre"),
  galeria2Precio: text("galeria_2_precio"),
  galeria2Unidad: text("galeria_2_unidad"),
  galeria2Descripcion: text("galeria_2_descripcion"),
  galeria3Foto: text("galeria_3_foto"),
  galeria3Nombre: text("galeria_3_nombre"),
  galeria3Precio: text("galeria_3_precio"),
  galeria3Unidad: text("galeria_3_unidad"),
  galeria3Descripcion: text("galeria_3_descripcion"),

  menu: text("menu").notNull().default(""),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type NegocioRow = typeof negocios.$inferSelect;
export type NuevoNegocioRow = typeof negocios.$inferInsert;

export const addons = pgTable("addons", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  clave: text("clave").notNull().unique(),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion").notNull().default(""),
  icono: text("icono").notNull().default("✨"),
  precio: integer("precio").notNull().default(0),
  comportamiento: text("comportamiento").notNull().default("chip"),
  activo: boolean("activo").notNull().default(true),
  orden: integer("orden").notNull().default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AddonRow = typeof addons.$inferSelect;
export type NuevoAddonRow = typeof addons.$inferInsert;

export const negocioAddons = pgTable(
  "negocio_addons",
  {
    negocioId: text("negocio_id")
      .notNull()
      .references(() => negocios.id, { onDelete: "cascade" }),
    addonId: text("addon_id")
      .notNull()
      .references(() => addons.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.negocioId, t.addonId] })]
);

export const eventos = pgTable(
  "eventos",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    negocioId: text("negocio_id")
      .notNull()
      .references(() => negocios.id, { onDelete: "cascade" }),
    tipo: text("tipo").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("eventos_negocio_fecha_idx").on(t.negocioId, t.createdAt)]
);

export type EventoRow = typeof eventos.$inferSelect;
export type NuevoEventoRow = typeof eventos.$inferInsert;
