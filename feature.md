# Encontrá - La Guía de Locales y Servicios `v1.14.0`

> **Nota sobre Versionado**: A partir de la versión `v0.4.0`, este proyecto adhiere a [Semantic Versioning (SemVer)](https://semver.org/lang/es/).

Este proyecto es una plataforma web moderna diseñada para conectar a la comunidad con el mercado local. Su objetivo es dar visibilidad tanto a comercios establecidos como a pequeños emprendimientos y servicios, priorizando la experiencia local.

## 📋 Registro de Cambios (Changelog)

### `v1.14.0` - Estadísticas de Empleos y URLs Amigables
*   **Métricas de Empleo**:
    *   **Contadores en Tiempo Real**: Visualización de **Vistas** (tráfico) y **Postulados** (conversión) en el panel de administrador y dashboards de usuario.
    *   **Sincronización Admin/User**: Consistencia total de datos entre "Mis Empleos" y el panel general de Admin.
*   **Optimización de URLs (SEO)**:
    *   **Slugs Dinámicos**: Migración de rutas de empleo a formato amigable `/jobs/[título-del-puesto]` (ej: `/jobs/vendedor-full-time`) manteniendo compatibilidad retroactiva con IDs antiguos.
    *   **Mejora de Click-Through**: URLs más limpias y descriptivas para compartir en redes.
*   **Experiencia de Usuario (UX)**:
    *   **Diseño de Tarjetas Compacto**: Rediseño del listado "Mis Empleos" para maximizar la información en pantalla, utilizando filas responsive en lugar de tarjetas voluminosas.
    *   **Validación Inteligente**: Corrección de lógica en formularios "Simple Mode" para evitar bloqueos por campos avanzados vacíos.
    *   **Persistencia de Propiedad**: Garantía de que la edición de un admin no sobrescribe el `owner_id` original del usuario.

### `v1.13.0` - Seguridad Admin y Navegación
*   **Seguridad del Panel Administrativo**:
    *   **Protección de Rutas Globales**: Bloqueo estricto de rutas de "Super Admin" (`/admin/venues`, `/admin/users`, `/admin/requests`) para dueños de locales, redirigiendo automáticamente a "Mi Negocio".
    *   **Aislamiento de Datos**: Garantía de que cada dueño solo pueda ver y editar su propio local.
*   **Mejoras de Navegación**:
    *   **Botones "Volver" Inteligentes**: Lógica condicional en formularios de edición y productos.
        *   Si es **Admin** -> Vuelve al listado general.
        *   Si es **Dueño** -> Vuelve a su panel principal (`/admin/my-venue`).
*   **Configuración de Usuario**:
    *   **Perfil Editable**: Nueva funcionalidad en `/admin/settings` que permite ver y modificar el nombre del usuario.
    *   **Persistencia Dual**: Actualización sincronizada en `auth.users` (metadata) y tabla `profiles`.
*   **Optimización de Registro (`/sumate`)**:
    *   **Ubicación Detallada**: Nuevos selectores de Provincia y Ciudad en el formulario de registro.
    *   **Generación de Slug**: Creación automática de URLs amigables (`nombre-del-local`) al registrarse.
    *   **Autenticación**: Solución a errores de "Anonymous sign-ins" asegurando el flujo correcto de email y contraseña.

### `v1.12.0` - Sistema de Analíticas y Tracking
*   **Inteligencia de Datos**:
    *   **Dashboard Analítico**: Nueva sección "Analíticas" en el panel de administración con métricas clave.
    *   **Tracking Híbrido**: Rastreo de escaneos QR (`?source=qr-card`) y vistas de página (`page_view`).
    *   **Ranking de Popularidad**: Tablas de "Top Locales" y "Top Ciudades" para identificar tendencias de tráfico.
    *   **Historial Detallado**: Registro cronológico de cada interacción (scan, visit) con fuente y ruta.
*   **Tracking Universal**:
    *   Implementación de `PageViewTracker` en todas las páginas clave (Región, Ciudad, Local) para medir el impacto real de cada sección de la plataforma.
    *   Deduplicación automática de eventos en desarrollo (Strict Mode safe).

### `v1.11.0` - Landing de Venta: "Propuesta"
*   **Marketing & Conversión**:
    *   **Landing Page Dedicada**: Nueva ruta `/propuesta` diseñada como "Carta de Venta" para comerciantes.
    *   **Diseño Premium**: Estética diferenciada (Dark Mode, Glassmorphism) enfocada en transmitir alta calidad y profesionalismo.
    *   **Contenido Persuasivo**: Secciones visuales de "Problema vs Solución", "Flujo de RRHH" y Comparativa de Planes con precios actualizados.
    *   **Call-To-Action (CTA)**: Integración directa con flujos de registro (`/sumate`) y contacto vía WhatsApp.
*   **Assets Visuales**:
    *   Generación de mockups 3D personalizados mostrando la app en uso real.
    *   Gráficos explicativos para simplificar la propuesta de valor.

### `v1.10.2` - UX de Empleos y Refactorización
*   **Bio Encontrá**:
    *   **Acceso Optimizado**: Reorganización de botones en `/bio-encontra`. Acceso prioritario a "Ver Empleos" y reubicación del "Login Admin" al footer para mejorar la experiencia de usuario final.
*   **Experiencia de Candidato**:
    *   **Ubicación Precisa**: Las tarjetas de empleo ahora muestran explícitamente **Ciudad, Provincia** (ej: "Ushuaia, Tierra del Fuego") en lugar de regiones genéricas.
    *   **Filtrado Híbrido**: Corrección en la lógica de filtrado por URL (`/region/city/jobs`) para incluir correctamente tanto empleos vinculados a locales (Venues) como ofertas públicas (Job Board).
*   **Calidad de Código y Accesibilidad**:
    *   **Refactorización Modular**: Desacoplamiento del formulario de carga de empleos (`Admin Job Form`) en componentes reutilizables y extracción de herramientas compartidas (`MarkdownToolbar`).
    *   **Accesibilidad Móvil**: Corrección de etiquetas de diálogo (`SheetTitle`) en el menú de navegación móvil para cumplir con estándares de lectores de pantalla.
### `v1.10.1` - FIX ERRORES
### `v1.10.0` - Bio Institucional y Gestión Avanzada de Empleos
*   **Bio Encontrá**:
    *   **Landing Institucional**: Nueva vista `/bio-encontra` diseñada como "Link in Bio" oficial de la plataforma.
    *   **Acceso Centralizado**: Botones rápidos para "Ir al Sitio", "Sumar Negocio", "Acceso Admin" y "Publicar Empleo".
    *   **Social & Share**: Integración directa con redes de Encontrá y botón nativo de compartir.
*   **Publicación de Empleos (Self-Service)**:
    *   **Formulario Público**: Nueva página `/publicar-empleo` para que empresas y reclutadores envíen ofertas sin registro previo.
    *   **Modos de Carga**: Opción "Simple" (descripción libre) o "Detallada" (roles, requisitos, beneficios, logo, etc.).
    *   **Geolocalización**: Selección de Provincia y Ciudad obligatoria para mejorar el filtrado.
*   **Dashboard de Empleos (Admin)**:
    *   **Gestión por Pestañas**: Separación visual entre "Solicitudes Pendientes" y "Empleos Activos".
    *   **Indicadores de Estado**: Badges con contadores para identificar rápidamente nuevas solicitudes que requieren aprobación.
    *   **Inbox UI**: Diseño estilo bandeja de entrada para moderar eficazmente las postulaciones entrantes.

### `v1.9.3` - Legales y Mejoras de Navegación
*   **Páginas Institucionales**:
    *   **Términos y Condiciones**: Nueva página `/terms` con marco legal estándar.
    *   **Preguntas Frecuentes**: Sección `/faq` con acordeón interactivo y detalles de planes/precios.
*   **Navegación Unificada**:
    *   **Footer Global**: Implementación de un pie de página consistente en todas las rutas (Home, Región, Ciudad), unificando enlaces institucionales y de negocio ("Sumá tu Negocio").
    *   **Navegación Fluida**: Incorporación de cabeceras "Sticky" con botón "Volver" en páginas legales para no romper el flujo del usuario.
*   **Mejoras Admin**:
    *   **Seguridad en Borrado**: Modal de confirmación (`AlertDialog`) al eliminar empleos para prevenir acciones accidentales.

### `v1.9.0` - Bolsa de Trabajo y Empleos
*   **Nueva Sección: Bolsa de Trabajo**:
    *   **Listados Públicos**: Visualización de ofertas laborales activas con filtrado por Ciudad y Región.
    *   **Postulación Directa**: Envío de CV (PDF) directamente al email del empleador sin intermediarios.
    *   **Seguridad**: Protección Anti-Spam (Cloudflare Turnstile) en formularios de contacto.
*   **Gestión de Empleos**:
    *   **Multi-Origen**: Soporte para empleos vinculados a "Locales" existentes o "Independientes" (con nombre y logo custom).
    *   **Límites por Plan**: Cupos de publicación activos según el plan del local (Gratis: 0, Emprendedor: 1, Full: 10).
    *   **Badge de Personal**: Indicador visual "Busca Personal" en las tarjetas de locales que están contratando.
*   **Navegación Mejorada**:
    *   **Routing Inteligente**: `/region/city/jobs` para exploración local precisa.
    *   **Lógica de Ciudad**: Agrupación correcta de barrios (zonas) bajo su ciudad principal en los listados.

### `v1.8.1` - Precisión Geográfica y Administración
*   **Gestión de Ubicación Robusta**:
    *   **Selector de Provincia Manual**: Nuevo control en el panel de administración que permite forzar la provincia del local, eliminando la dependencia de la detección automática (geocoding) que fallaba en ciertas zonas.
    *   **Sincronización de Zona**: Corrección crítica donde locales con "Dirección Exacta" no aparecían en los listados de ciudad. Ahora la zona se sincroniza estrictamente con la ciudad seleccionada.
    *   **Simplificación**: Eliminación del campo "País" (Argentina por defecto) para agilizar la carga de datos.

### `v1.8.0` - Experiencia Móvil y Priorización
*   **Prioridad de Negocio Full (Premium)**:
    *   **Algoritmo de Ordenamiento**: Los locales con plan "Negocio Full" aparecen ahora **primeros** en todos los listados (Inicio, Región y Ciudad), garantizando la visibilidad prometida.
    *   Orden de prioridad: Premium > Emprendedor > Vecino.
*   **Rediseño de Tarjetas de Local (UI)**:
    *   **Estética Compacta**: Nuevo formato visual que maximiza la información en menos espacio (pantallas de 16:9).
    *   **Botón Flotante de Acción**: Acceso directo a WhatsApp ubicado estratégicamente en la parte inferior de la tarjeta ("mitad adentro") para evitar toques accidentales y mejorar la conversión.
    *   **Layout Optimizado**: Fusión de ubicación y horario en una sola línea informativa.
*   **Navegación Móvil Mejorada**:
    *   **Header de 2 Filas**: Reestructuración completa de la cabecera en móviles para garantizar que el botón "Sumate" y el menú sean siempre accesibles.
    *   **Búsqueda Dedicada**: Barra de búsqueda reubicada en una segunda línea para mayor comodidad táctil.
    *   **Locaciones Largas**: Manejo inteligente de nombres de ciudad largos con truncamiento visual para mantener la estética.

### `v1.7.0` - Bio Inteligente (Smart Link-in-Bio)
*   **Funcionalidad Estrella**:
    *   **Página `/bio`**: Nueva vista ultra-simplificada para usar como enlace en redes sociales (Instagram/TikTok).
    *   **URLs Cortas**: Acceso directo mediante `encontra.com.ar/bio-nombrenegocio` para compartir fácilmente.
    *   **Diseño para Conversión**: Botones grandes para WhatsApp, Mapa y Llamada. Muestra estado de apertura en tiempo real.
    *   **Exclusividad**: Funcionalidad restringida a usuarios **Plan Negocio Full**.
    *   **Upsell Automático**: Los locales Free/Basic ven una pantalla de "Bloqueo" invitándolos a mejorar su plan para desbloquear la Bio.

### `v1.6.0` - Refinamiento de Administración y Estabilidad
*   **Mejoras en Panel de Administración**:
    *   **Edición Robusta**: Solución definitiva a errores de validación al editar locales provenientes de `/sumate` (manejo de datos nulos y normalización de esquemas).
    *   **UX de Seguridad**: Implementación de **Modal de Confirmación** (Shadcn Alert) para la eliminación de locales, reemplazando alertas nativas.
    *   **Organización Visual**: Reordenamiento del formulario de edición, ubicando los horarios en la columna principal para mejor legibilidad.
*   **Automatización de Flujos**:
    *   **Horarios por Defecto**: Inyección automática de un esquema de horarios estándar (Lun-Vie 9-17) al aprobar solicitudes sin horarios detallados, facilitando la gestión posterior.
    *   **Validación de Slugs**: Sistema de autoincremento para garantizar slugs únicos en aprobaciones (ej: `local-1`, `local-2`).
*   **SEO Local (JSON-LD)**:
    *   Implementación de datos estructurados `LocalBusiness` en páginas de detalle.
    *   Soporte para horarios semanales complejos, geolocalización y contacto.

### `v1.5.0` - Routing Local y Automatización
*   **Routing por Ciudad**:
    *   Estructura Jerárquica: `/[provincia]/[ciudad]` para listados locales y `/[provincia]/[ciudad]/[local]` para detalles.
    *   **Contexto de Navegación**: El Navbar ahora muestra y permite cambiar la ciudad actual.
*   **Inteligencia de Ubicación (OSM)**:
    *   **Extracción de Zona**: Al ingresar una dirección en formularios ("/sumate" o Admin), se detecta automáticamente el barrio o ciudad y se asigna al campo `zone`.
    *   **Autocompletado**: Integración con Nominatim para rellenar datos geográficos sin intervención manual.

### `v1.4.0` - Gestión de Planes y Flexibilidad
*   **Página de Planes y Upgrades**:
    *   **Vista Dedicada**: Nueva página `/planes` para cada local (ej: `.../sakura-sushi/planes`).
    *   **Diseño Comparativo**: Visualización clara de beneficios (Vecino vs Emprendedor vs Full).
    *   **Seguridad**: Acceso restringido únicamente a locales con dueño asignado (*Claimed*).
*   **Panel de Administración (Dueños)**:
    *   **Gestión de Suscripción**: La sección de plan ahora es de **solo lectura** para garantizar la integridad.
    *   **Flujo de Mejora**: Botón directo "Ver Planes y Mejoras" que redirige a la comparativa y contacto comercial.
    *   **Flexibilidad de Categorías**:
        *   Soporte para categorías dinámicas personalizadas ("Otras").
        *   Expansión de lista de rubros predefinidos (Salud, Hogar, Mercado, etc.).

### `v1.3.0` - Autonomía y Persistencia
*   **Persistencia de Región**:
    *   **Recordatorio Inteligente**: Al visitar `encontra.com.ar`, el sistema redirige automáticamente a la última provincia visitada.
    *   **Reseteo Manual**: Opción "Todas las Provincias" en el selector para volver a la vista global.
*   **Detección Automática de Ubicación**:
    *   **Formularios Inteligentes**: En "Sumate" y "Panel Admin", al ingresar una dirección, el sistema detecta automáticamente la provincia mediante Geocoding (Nominatim) y la asigna.
*   **UX Renaming**:
    *   **Selector Modal**: Nuevo selector de provincias tipo "Command Palette" accesible desde el título "Encontra en [Provincia]".

### `v1.2.0` - Soporte Multi-Región (Franquicia Digital)
*   **Arquitectura Multi-Tenant**:
    *   Implementación de soporte para regiones mediante rutas (ej: `encontra.com.ar/tdf`, `encontra.com.ar/cba`).
    *   **Gateway Inteligente**: Página de inicio (`/`) que detecta o permite seleccionar la región y redirige a la ruta correspondiente.
    *   **Filtrado Global**: Datos filtrados automáticamente por el segmento de región en la URL.
*   **Identidad Localizada**:
    *   Cabecera dinámica que muestra la provincia activa con su nombre completo (ej: "ENCONTRA Tierra del Fuego") en lugar de códigos.
    *   Adaptación de la interfaz para sentirse nativa de cada región.
*   **Base de Datos**:
    *   Nueva tabla `regions` y columna `region_code` en locales.

### `v1.1.2` - Mejoras de UX y Localización
*   **Página 404 (Not Found)**:
    *   Traducción completa al español.
    *   Mensaje personalizado con identidad de marca ("Encontrá").
*   **Estados de Carga**:
    *   Implementación de `loading.tsx` global con animación de lupa (identidad de marca).

### `v1.1.1` - Correcciones de Backend
*   **Corrección de Variables de Entorno**:
    *   Reemplazo de variable inexistente `NEXT_PUBLIC_SUPABASE_ANON_KEY` por `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` en la página dinámica de locales (`[slug]`).
    *   Restauración de la conexión correcta con Supabase para la obtención de datos del local.

### `v1.1.0` - SEO y Rendimiento
*   **Optimización para Buscadores (SEO)**:
    *   Migración de la página de detalle de local a **Server Components**.
    *   Generación dinámica de **Metadatos** y etiquetas **Open Graph** (título, descripción e imagen previa para redes sociales).
    *   Mejora en la indexación de contenido por parte de Google y otros buscadores.
*   **Arquitectura**:
    *   Separación de lógica de cliente (`VenueDetailView`) y servidor para mejorar el tiempo de carga inicial (FCP).

### `v1.0.0` - Lanzamiento Oficial "Encontrá"
*   **Rebranding Completo**:
    *   Cambio de nombre del proyecto a **Encontrá**.
    *   Nuevo tagline: "La Guía de Locales y Servicios".
    *   Actualización de logo (icono de lupa) y metadatos.
*   **Refinamiento de UI/UX**:
    *   Nuevas tarjetas de locales más compactas y eficientes.
    *   Rediseño de cupones a formato "mini-card".
    *   Mejoras en la vista móvil del carrusel destacado.
    *   Reubicación estratégica del botón de reclamo.
*   **Funcionalidades Estabilizadas**:
    *   Galería de imágenes funcional y limitada por plan.
    *   Sistema de reclamos de propiedad vía admin.
    *   Estructura de planes V3 consolidada.

### `v0.5.0` - Nueva Estructura de Planes
*   **Implementación de Restricciones por Plan**:
    *   **Plan Vecino (Gratis)**:
        *   Teléfono visible solo como texto (sin enlaces ni botones de llamada).
        *   Sin acceso a redes sociales (Instagram/Web ocultos).
        *   Sin catálogo de productos.
    *   **Plan Emprendedor (Básico)**:
        *   Botones de acción directa (WhatsApp, Llamada, Redes).
        *   Catálogo limitado a 10 productos.
        *   Insignia de "Verificado".
    *   **Plan Negocio Full (Premium)**:
        *   Catálogo ilimitado.
        *   Prioridad visual.

### `v0.4.0` - Sistema de Reclamos y Roles
*   **Sistema de Reclamo de Locales**:
    *   Implementación de flujo "Solicitar Reclamo" en la página pública del local para usuarios logueados.
    *   Nueva tabla `claim_requests` para gestionar solicitudes.
    *   Eliminación del sistema de códigos manuales en favor de aprobación directa por admin.
*   **Panel de Administración**:
    *   Nueva sección **Reclamos** (`/admin/claims`) para gestionar solicitudes de propiedad.
    *   Acciones de **Aprobar** (asigna dueño automáticamente) y **Rechazar**.
    *   Navegación condicional basada en roles (Admin vs Dueño).
*   **Autenticación y Roles**:
    *   Redirección inteligente: Login/Registro -> Home.
    *   Menú de usuario en cabecera pública con acceso a "Mi Negocio" o "Panel Admin".
    *   Middleware protegido por roles.
*   **Captación de Leads**:
    *   Actualización del formulario "Sumate" para capturar Nombre y Email del dueño.
    *   Nuevas columnas `owner_name` y `owner_email` en `venue_requests`.

---

## 🌟 Características Principales

### 1. Interfaz Pública (Vista del Usuario)
*   **Enfoque Local**: Idioma español único.
*   **Página de Inicio**:
    *   **Carrusel Destacado**: Muestra locales y emprendimientos premium.
    *   **Búsqueda y Filtros**: Encuentra por nombre, categoría (Restaurante, Café, Tienda, Entretenimiento, Servicios) o estado.
    *   **Recomendaciones**: Sugerencias basadas en valoraciones.
*   **Página de Detalle del Negocio**:
    *   **URLs Amigables**: Enlaces limpios y compartibles.
    *   **Información Flexible**: Adaptada al tipo de negocio (Local Físico, Emprendimiento Online, Servicio).
    *   **Catálogo de Productos**: Sección dedicada ("Menú" o "Productos") donde cada negocio muestra sus artículos con foto, descripción y precio.
    *   **Ubicación Inteligente**:
        *   **Dirección Exacta**: Para locales físicos, con mapa interactivo y botón "Cómo Llegar".
        *   **Zona Aproximada**: Para emprendimientos que requieren privacidad (ej: "Palermo Soho"), sin mapa exacto.
    *   **Horarios Flexibles**: Visualización clara de si está "Abierto" o "Cerrado" ahora, con soporte para horarios cortados (ej: 9-13 y 17-20).
    *   **Opciones de Entrega**: Badges claros para "Delivery", "Retiro en Local" o "A Convenir".
    *   **Contacto Directo**: Botones destacados de WhatsApp, Redes Sociales (Instagram, Facebook, Web) y Llamada.
    *   **Cupones (Opcional)**: Sección secundaria para promociones especiales.
    *   **Sistema de Reclamo**: Botón "¿Sos el dueño?" para iniciar el proceso de verificación.

### 2. Panel de Administración (Gestión del Negocio)
*   **Roles de Usuario**:
    *   **Super Admin**: Acceso total a Locales, Solicitudes, Reclamos y Configuración.
    *   **Dueño de Local**: Acceso restringido a "Mi Negocio" y configuración básica.
*   **Gestión de Negocios**:
    *   **Tipos de Negocio**: Soporte para "Local Físico", "Emprendimiento (Sin Local)" y "Servicios".
    *   **Privacidad de Ubicación**: Opción para mostrar "Dirección Exacta" o solo "Zona".
    *   **Horarios Avanzados**: Configuración de horarios de apertura y cierre por día, incluyendo turnos cortados (mañana/tarde).
    *   **Opciones de Servicio**: Configuración de disponibilidad de Delivery, Retiro en Local o A Convenir.
    *   **Redes Sociales**: Integración completa de canales de contacto.
*   **Gestión de Productos**:
    *   ABM (Alta, Baja, Modificación) de productos propios para cada negocio.
    *   Campos: Nombre, Descripción, Precio e Imagen.
*   **Gestión de Cupones**: Funcionalidad complementaria para ofertas puntuales.

### 3. Lógica de Negocio y Monetización
Nueva estructura de planes (V3) diseñada para maximizar el volumen de usuarios gratuitos y convertir mediante funcionalidades de comodidad y visibilidad.

| Característica | Plan Vecino (Gratis) | Plan Emprendedor (Sugerido $6k-8k) | Plan Negocio Full (Sugerido $15k-20k) |
| :--- | :---: | :---: | :---: |
| **Objetivo** | Volumen Masivo | El "Standard" (Comodidad) | Visibilidad y Destaque |
| **Listado en Directorio** | ✅ (Categoría + Zona) | ✅ | ✅ (Prioridad en Búsquedas) |
| **Teléfono** | Texto Plano (Sin link) | ✅ Botón WhatsApp Directo | ✅ Botón WhatsApp Directo |
| **Redes Sociales** | ❌ | ✅ Link a Instagram/Web | ✅ Link a Instagram/Web |
| **Catálogo/Menú** | ❌ | 10 Productos | Ilimitado (o 50) |
| **Fotos** | 1 (Perfil/Logo) | ✅ | ✅ |
| **Gestión de Estado** | ❌ | ✅ (Abierto/Cerrado) | ✅ (Abierto/Cerrado) |
| **Insignia Verificado** | ❌ | ✅ | ✅ |
| **Carrusel Destacado** | ❌ | ❌ | ✅ |
| **Ofertas Semanales** | ❌ | ❌ | ✅ |

## 🛠 Stack Tecnológico
*   **Framework**: Next.js 16 (App Router)
*   **Lenguaje**: TypeScript
*   **Estilos**: Tailwind CSS 4 + tailwindcss-animate
*   **Base de Datos**: Supabase (PostgreSQL)
*   **Autenticación**: Supabase Auth (Email/Password)
*   **Almacenamiento**: Cloudinary (Imágenes)
*   **Mapas**: React Leaflet + OpenStreetMap (Nominatim API)
*   **Iconos**: Lucide React
*   **Formularios**: React Hook Form + Zod Validation

## 🚀 Hoja de Ruta Futura (Roadmap)
*   **Perfil de Usuario Final**: Guardar favoritos y reseñas (en progreso).
*   **Pasarela de Pagos**: Cobro automático de suscripciones.
*   **Pedidos Online**: Integración de carrito de compras simple vía WhatsApp.
*   **Notificaciones**: Email transaccionales para aprobaciones de reclamos.
