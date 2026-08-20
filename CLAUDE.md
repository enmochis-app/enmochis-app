# EnMochis — Contexto del Proyecto

Directorio local de restaurantes/cafeterías para Los Mochis, Sinaloa, con minisitios
por afiliado. Modelo de afiliación: $50 USD / 6 meses (primer mes gratis), Top 20
fundadores con acceso gratuito extendido. Ver detalles completos de fases y pendientes
en el documento "Hoja De Ruta" del proyecto de Claude (Sabor Local / EnMochis).

## Estructura de navegación (decidida)
- Nivel 1: enmochis.app — bienvenida + selector de categorías
- Nivel 2: cafeterias.enmochis.app (y similares) — destacados + directorio de esa categoría
- Nivel 3: nombre-negocio.enmochis.app — minisitio individual
- Categorías de lanzamiento: Restaurantes, Cafeterías, Snacks/Antojitos, Panaderías/Repostería
- Look & feel: inspirado en Uber Eats/Rappi, con toque regional de Los Mochis/Sinaloa

## Infraestructura
- Repositorio y hosting (Vercel) en cuentas 100% separadas de Casa del Pollo — nunca mezclar
- Deploy: push a main → Vercel redespliega automático → https://enmochis-app.vercel.app/
- Dominio enmochis.app: comprado hasta el momento de la publicación (aún no comprado)

## Estado actual
- index.html es un prototipo estático de un solo archivo (HTML/CSS/JS inline)
- Pendiente: motor de plantilla real, addons modulares, admin de datos, sistema de
  subdominios wildcard

## Reglas para trabajar aquí
- El dueño del proyecto (Castell) no programa — explica cualquier cambio técnico en
  términos simples antes de aplicarlo
- Nunca tocar ni referenciar el repositorio de Casa del Pollo desde aquí
