RECARGAS LX — GitHub + Netlify SIN Cloudflare

1. Haz copia de seguridad de tu repositorio actual.
2. Sube index.html, app.js, config.js, catalog-seed.json, admin.html, admin.js, style.css y assets/zinli.webp a la raíz del repositorio GitHub.
3. CONSERVA los archivos assets/freefire.webp, assets/bloodstrike.webp, assets/roblox.webp, assets/banner.webp y demás imágenes que ya tenías. No se incluyen en este ZIP porque no se suministraron.
4. Si Netlify publica desde una carpeta (por ejemplo public/), coloca estos archivos allí, NO en la raíz del repositorio. La carpeta de publicación debe contener index.html y catalog-seed.json juntos.
5. Espera al despliegue de Netlify y recarga con Ctrl+F5.
6. Para editar precios, abre https://recargas-lx.netlify.app/admin.html, cambia precios y pulsa Descargar catalog-seed.json actualizado.
7. En GitHub reemplaza catalog-seed.json por el descargado y confirma los cambios. Netlify desplegará los nuevos precios si está vinculado al repositorio.
8. Zinli viene con precios null (no disponibles) hasta que los configures. Nunca se muestra $0.00 ni se permite pedir paquetes sin precio.
9. El editor admin.html NO tiene autenticación. Cualquier visitante puede preparar/descargar su propia copia, pero NO puede cambiar los precios publicados sin acceso de escritura a GitHub. Para administración privada real hace falta autenticación en servidor o usar GitHub directamente.
10. Los pedidos se envían a WhatsApp; NO hay pago verificado, pedidos persistentes ni recargas automáticas.
11. Cloudflare y D1 ya no se consultan desde esta versión. No borres el Worker ni la base de datos hasta confirmar el despliegue y guardar respaldo.
12. Si deseas agregar imágenes a Mobile Legends, PUBG o COD, súbelas a assets/ con los nombres definidos en config.js.
