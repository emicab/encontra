# Encontrá - La Guía de Locales y Servicios `v1.2.0`

> **Nota sobre Versionado**: A partir de la versión `v0.4.0`, este proyecto adhiere a [Semantic Versioning (SemVer)](https://semver.org/lang/es/).

Este proyecto es una plataforma web moderna diseñada para conectar a la comunidad con el mercado local. Su objetivo es dar visibilidad tanto a comercios establecidos como a pequeños emprendimientos y servicios, priorizando la experiencia local.

## 📋 Registro de Cambios (Changelog)

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
