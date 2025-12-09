# Próximas Implementaciones y Mejoras para Encontrá

Este documento analiza las oportunidades de mejora y nuevas funcionalidades para el proyecto, clasificadas por impacto y complejidad. Basado en el estado actual (`v1.6.0`).

## 1. Experiencia de Usuario (Core UX)

### 🌟 Marcadores y Favoritos (Quick Win)
*   **Estado Actual**: No existe forma de guardar locales.
*   **Propuesta**: Implementar un sistema de "Favoritos".
    *   **MVP (Sin Login)**: Guardar IDs en `localStorage` del navegador.
    *   **Fase 2 (Con Login)**: Guardar en tabla `user_favorites` en Supabase.
*   **Valor**: Aumenta la retención y utilidad para el usuario recurrente.

### 🔍 Filtros Avanzados
*   **Estado Actual**: Búsqueda por texto y botones de acceso rápido por rubro.
*   **Propuesta**:
    *   Filtro "Abierto Ahora" (usando la lógica de horarios ya existente).
    *   Filtro por Servicios (Delivery, WiFi, Pet Friendly - requiere agregar tags a la DB).
    *   Ordenamiento por: Mejor Calificados, Más Cercanos (GeoDistance).

### 💬 Reseñas y Calificaciones 2.0
*   **Estado Actual**: Campo `rating` y `reviewCount` estáticos o editables manualmente por admin.
*   **Propuesta**: Permitir que usuarios logueados dejen reseñas reales.
    *   Requiere tabla `reviews`, moderación en panel admin y recálculo de promedios.

## 2. Monetización y Negocio

### 💳 Integración Pasarela de Pagos (MercadoPago)
*   **Importancia**: **CRÍTICA** para escalar.
*   **Implementación**:
    *   Checkout Pro de MercadoPago para cobrar suscripciones (Planes Emprendedor/Full).
    *   Webhooks para activar automáticamente el `subscription_status` a `active` cuando se confirma el pago.
    *   Manejo de estados: `pending`, `approved`, `rejected`.

### 🛍️ "WhatsApp Cart" (Pedidos Online Simple)
*   **Concepto**: Permitir armar un pedido desde el catálogo de productos y enviarlo como texto formateado a WhatsApp.
*   **Flujo**:
    1.  Usuario agrega items (+) a una canasta local.
    2.  Botón flotante "Ver Pedido".
    3.  Click "Pedir por WhatsApp" -> Abre URL `wa.me` con mensaje "Hola, quisiera pedir: 2x Pizza Muzza, 1x Coca Cola. Total: $XX".
*   **Valor**: Transforma el directorio en una herramienta de ventas directa sin comisiones.

## 3. Optimización Técnica y SEO

### 🕷️ Datos Estructurados (JSON-LD)
*   **Objetivo**: Mejorar visibilidad en Google (Rich Snippets).
*   **Implementación**: Agregar script `LocalBusiness` en el `<head>` de la página de detalle (`[slug]`).
    *   Incluir: Nombre, Descripción, Rango de Precios, Dirección, Geo, Teléfono, Horarios.

### ⚡ Optimización de Imágenes (Cloudinary + Next/Image)
*   **Mejora**: Asegurar que todas las imágenes usen formatos modernos (WebP/AVIF) y tamaños responsivos automáticamente.
    *   Revisar componente `ImageUpload` para forzar transformaciones (f_auto, q_auto) en las URLs guardadas o al renderizar.

## 4. Panel de Administración (Backoffice)

### 📊 Dashboard de Métricas (Analytics)
*   **Propuesta**: Mostrar al dueño métricas reales de su ficha.
    *   *Visualizaciones de perfil* (contador simple al cargar la página).
    *   *Clicks en WhatsApp* (evento onClick).
    *   *Clicks en Sitio Web*.
*   **Implementación**: Tabla `analytics_events` en Supabase y gráficas simples con Recharts en el panel de admin.

### 📥 Importación Masiva (Bulk Import)
*   **Problema**: Cargar 50 locales uno por uno es lento.
*   **Solución**: Script o interfaz para subir un CSV/Excel y crear borradores de locales masivamente.

## 5. Roadmap Sugerido (Prioridad)

| Prioridad | Feature | Complejidad | Impacto |
| :--- | :--- | :---: | :---: |
| **1 (Alta)** | **JSON-LD (SEO Local)** (✅ Implementado v1.6.0) | Baja | Alto 🚀 |
| **2 (Alta)** | **Filtro "Abierto Ahora"** | Media | Alto ✨ |
| **3 (Media)** | **WhatsApp Cart** | Media | Muy Alto 💰 |
| **4 (Media)** | **Favoritos (LocalStorage)** | Baja | Medio 👍 |
| **5 (Alta)** | **Integración MercadoPago** | Alta | Negocio 💵 |
| **6 (Baja)** | **Analíticas para Dueños** | Media | Fidelización 🤝 |
