# La Hoja de Ayer

Sitio estático. No hay que compilar nada: GitHub Pages sirve los archivos tal cual.

- `index.html` y `app.js`: la página.
- `data/index.json`: lista de ediciones (`dias`), con el total de notas y la cantidad por rubro, más la configuración (`config.eslogan`, `config.redes`).
- `data/ediciones/AAAA-MM-DD.json`: las notas de cada día (la fecha es la de las noticias, no la de la edición).

## Formato de una nota

```json
{"id":"2026-11-12-politica-1","fecha":"2026-11-12","rubro":"politica","orden":1,"destacada":true,
 "titulo":"...","resena":"...","fuente":"La Nación","url":"https://...","publicada":"2026-11-10"}
```

`rubro`: politica, economia, espectaculos, entretenimiento, deporte o falopas. `publicada` solo en falopas, cuando difiere de `fecha`. Una sola nota por día con `destacada: true`.

## Actualizar

1. Agregar o reemplazar `data/ediciones/AAAA-MM-DD.json`.
2. En `data/index.json`, actualizar `dias["AAAA-MM-DD"]` con `total` y `rubros`, y el campo `actualizado`.
3. Commit y push a `main`.

Las redes se cargan en `data/index.json` → `config.redes` (`instagram`, `x`, `tiktok`, `facebook`): un @usuario o un enlace completo.
