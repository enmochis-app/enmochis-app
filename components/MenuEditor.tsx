"use client";

import type { MenuItemInput } from "@/lib/menuItems";

let contadorTemporal = 0;
function idTemporal(): string {
  contadorTemporal += 1;
  return `nuevo-${contadorTemporal}`;
}

export default function MenuEditor({
  items,
  onChange,
}: {
  items: MenuItemInput[];
  onChange: (items: MenuItemInput[]) => void;
}) {
  function actualizar(index: number, cambios: Partial<MenuItemInput>) {
    const copia = items.slice();
    copia[index] = { ...copia[index], ...cambios };
    onChange(copia);
  }

  function agregar() {
    onChange([...items, { id: idTemporal(), categoria: "Menú", nombre: "", precio: "", ordenable: false }]);
  }

  function quitar(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="menu-editor">
      {items.length === 0 && <p className="admin-small" style={{ fontSize: 12, color: "#666" }}>Todavía no hay productos.</p>}
      {items.map((item, i) => (
        <div key={item.id ?? i} className="admin-menu-item">
          <div className="admin-grid-2">
            <div className="admin-field">
              <label>Categoría</label>
              <input value={item.categoria} onChange={(e) => actualizar(i, { categoria: e.target.value })} placeholder="Ej. TACOS" />
            </div>
            <div className="admin-field">
              <label>Nombre</label>
              <input value={item.nombre} onChange={(e) => actualizar(i, { nombre: e.target.value })} placeholder="Nombre del producto" />
            </div>
          </div>
          <div className="admin-grid-2">
            <div className="admin-field">
              <label>Precio</label>
              <input value={item.precio} onChange={(e) => actualizar(i, { precio: e.target.value })} placeholder="Ej. 45" inputMode="decimal" />
            </div>
            <div className="admin-field" style={{ display: "flex", alignItems: "flex-end" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="checkbox"
                  checked={item.ordenable}
                  onChange={(e) => actualizar(i, { ordenable: e.target.checked })}
                />
                Se puede pedir por WhatsApp
              </label>
            </div>
          </div>
          <button type="button" className="admin-link" onClick={() => quitar(i)}>
            Quitar producto
          </button>
        </div>
      ))}
      <button type="button" className="admin-btn admin-btn-secondary" onClick={agregar}>
        + Agregar producto
      </button>
    </div>
  );
}
