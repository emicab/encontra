# Configuración DNS para Multi-Tenant (Vercel + Cloudflare)

Para que la aplicación soporte subdominios dinámicos (ej: `tdf.encontra.com.ar`) en producción, es necesario configurar correctamente los registros DNS en Cloudflare y los dominios en Vercel.

## 1. Configuración en Vercel

1.  Ve a tu **Dashboard de Vercel** > Selecciona el proyecto **Encontrá**.
2.  Ve a **Settings** > **Domains**.
3.  Asegúrate de que tu dominio principal esté agregado (ej: `encontra.com.ar`).
4.  **Agrega el dominio Wildcard**:
    *   Ingresa `*.encontra.com.ar` en el campo de entrada.
    *   Vercel te pedirá que configures un registro CNAME o Nameservers.
    *   Elige la opción recomendada (generalmente CNAME si usas Cloudflare).

## 2. Configuración en Cloudflare

1.  Inicia sesión en **Cloudflare** y selecciona tu dominio.
2.  Ve a la sección **DNS** > **Records**.
3.  **Registro A (Raíz)**:
    *   **Type**: `A`
    *   **Name**: `@` (o `encontra.com.ar`)
    *   **Content**: `76.76.21.21` (IP estándar de Vercel)
    *   **Proxy Status**: ☁️ **Proxied** (Naranja) - *Opcional: Si tienes problemas con SSL, prueba DNS Only (Gris) inicialmente.*
4.  **Registro CNAME (Wildcard)**:
    *   **Type**: `CNAME`
    *   **Name**: `*` (asterisco)
    *   **Content**: `cname.vercel-dns.com`
    *   **Proxy Status**: ☁️ **DNS Only** (Gris).
        *   **IMPORTANTE**: Para que Vercel pueda generar certificados SSL para tus subdominios automáticamente, es crucial que este registro esté en **DNS Only (Gris)** al principio.
        *   Si lo pones en "Proxied" (Naranja), Cloudflare intentará manejar el SSL y puede haber conflictos de "Redirect Loop" o errores de certificado de Vercel.

5.  **Registro CNAME (WWW)**:
    *   **Type**: `CNAME`
    *   **Name**: `www`
    *   **Content**: `cname.vercel-dns.com`
    *   **Proxy Status**: ☁️ **Proxied** (Naranja) o Gris, según prefieras.

## 3. Verificación

1.  Espera unos minutos a que se propague el DNS.
2.  En el Dashboard de Vercel, deberías ver un "Check" verde ✅ al lado de `*.encontra.com.ar`.
3.  Intenta acceder a `tdf.encontra.com.ar` en tu navegador. Debería cargar la aplicación y mostrar "ENCONTRA TDF" en la cabecera.

## Solución de Problemas Comunes

*   **Error 522 / Timed Out**: Generalmente significa que Cloudflare no puede conectar con Vercel. Verifica la IP `76.76.21.21`.
*   **Too Many Redirects**:
    *   En Cloudflare > **SSL/TLS**: Asegúrate de que el modo de encriptación esté en **Full (Strict)**. Si está en "Flexible", puede causar bucles infinitos con la redirección HTTPS forzada de Vercel.
*   **Certificado Inválido**: Si Vercel no puede generar el certificado, asegúrate de que el registro `*` CNAME en Cloudflare esté en estado "DNS Only" (Nube Gris).
