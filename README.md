# MotivaDay — PWA (prototipo mejorado)

Este proyecto incluye una PWA de frases motivacionales con:
- Interfaz mejorada con Tailwind CSS (CDN) y modo oscuro/tema.
- Animaciones simples (fade-in) para las frases.
- CRUD con LocalStorage, búsqueda y dictado por voz (si el navegador lo soporta).
- Compartir (Web Share API) y cache offline con Service Worker.
- Manifest para instalación como app nativa.

## Archivos principales
- index.html
- styles.css
- app.js
- sw.js
- manifest.json
- icons/icon-192.png, icon-512.png

## Ejecutar localmente
1. Servir por HTTP (necesario, no usar file://):

```bash
# en la carpeta motivaday
python -m http.server 8080
# o
npx http-server -c-1 .
```
2. Abrir http://localhost:8080

## Crear un repositorio en GitHub y subir (pasos)
```bash
git init
git add .
git commit -m "Initial MotivaDay PWA"
# crear un repo en GitHub (en la web) y luego:
git remote add origin https://github.com/tu-usuario/motivaday.git
git push -u origin main
```

> Si necesitas, te doy el comando `gh` (GitHub CLI) para crear el repo desde terminal.

## Despliegue (Netlify)
1. Subir a GitHub.
2. Conectar el repo en Netlify (drag & drop o CI).
3. Asegurarse de servir la app desde la rama `main` y que `index.html` esté en la raíz.

## Notas
- Tailwind está incluido vía CDN para prototipado. Para producción, compilar Tailwind con PostCSS.
- SpeechRecognition funciona mejor en Chrome/Edge.
