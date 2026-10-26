# RECARGAS LX — tienda + panel administrador

## Incluye
- Sitio estático Netlify con imágenes locales `assets/`, catálogo y pedidos WhatsApp (+58 412-7946115).
- Panel `admin.html` con inicio de sesión por contraseña y edición de precios USD.
- API Cloudflare Worker y base D1 para publicar precios para todos los clientes.
- **No** incluye verificación real de Player ID, verificación bancaria ni recargas automáticas. Los precios iniciales son ejemplos.

## 1. Publicar tienda
Extrae el ZIP. Sube el **contenido** de `RECARGAS_LX_PANEL_ADMIN` (index.html en la raíz) a GitHub o arrastra esa carpeta a Netlify Drop. La carpeta `cloudflare-worker` no se publica como web, solo contiene backend.

## 2. Configurar Cloudflare (obligatorio para guardar precios)
1. En Cloudflare, crea una base D1 `recargas-lx-db` y copia su ID.
2. Instala Wrangler en tu PC con Node.js: `npm install -g wrangler`, luego `wrangler login`.
3. En `cloudflare-worker/wrangler.toml`, sustituye `REEMPLAZAR_CON_ID_REAL_DE_D1` y ajusta `ALLOWED_ORIGINS` a la URL real de Netlify.
4. Desde la carpeta `cloudflare-worker`, ejecuta `wrangler d1 execute recargas-lx-db --remote --file=./schema.sql`.
5. Configura los secretos (no los escribas en el código ni en GitHub):
   `wrangler secret put ADMIN_PASSWORD`
   `wrangler secret put SESSION_SECRET` (usa un valor aleatorio largo, distinto de la contraseña).
6. Ejecuta `wrangler deploy` y copia la URL HTTPS del Worker.
7. En `config.js` cambia `apiUrl: ""` por la URL del Worker, vuelve a publicar el sitio.
8. Abre `/admin.html`, inicia sesión y guarda un precio. Comprueba el precio en otra ventana de la tienda.

**Importante:** No compartas la contraseña ni el secreto. Usa una contraseña única y fuerte. Protege también tu cuenta Cloudflare con MFA. Este panel es una base funcional, no un sistema de pagos; antes de operar comercialmente, añade protección de intentos de login (Cloudflare WAF/rate limiting), auditoría y copias de seguridad.

## Archivos
- `index.html`, `style.css`, `app.js`: tienda.
- `config.js`: WhatsApp, precios iniciales y URL del Worker.
- `sync.js`: sincroniza precios desde D1.
- `admin.html`, `admin.js`: panel privado (la autorización real se aplica en Worker).
- `cloudflare-worker/`: API y esquema de base de datos.
