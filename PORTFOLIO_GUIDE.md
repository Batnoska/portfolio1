# Portfolio de Santiago Batnoska — guía rápida

Sitio estático (HTML + CSS + JS, sin frameworks ni build) con dos partes: el portfolio profesional (`index.html`) y la
página de parches (`parches.html`), con una pantalla de arranque al entrar que deja elegir entre las dos. Se publica
tal cual con GitHub Pages (repo `Batnoska/portfolio1`). Para verlo localmente basta abrir `index.html` o servir la
carpeta (`python -m http.server`).

## Archivos

- `gate.css` y `gate.js`: la pantalla de arranque (ver "Pantalla de arranque").
- `parches.html`, `parches.css` y `parches.js`: la página de parches (ver "Parches y mods"). No comparte estilos con el resto.
- `images/parches/`: una carpeta por juego con parches, `lomos/` para el resto del estante y `cuarto/` para la tele, las
  figuras, los posters y la pared.
- `index.html`: todo el contenido y la estructura del portfolio.
- `index.css`: estilos. Los colores y las fuentes están en variables en `:root` (`--bg`, `--text`, `--ember` = naranja de
  acento, `--unity`, `--unreal`). Fuentes de Google Fonts: Syne (títulos), Manrope (texto), JetBrains Mono (etiquetas).
- `index.js`: traducciones e interacciones (no hace falta tocarlo para agregar contenido, salvo los textos traducidos).
- `images/`: `work/` (capturas de proyectos, .webp ~1600 px de ancho), `tools/` (comparador del conversor),
  `portrait.webp` (foto). Las imágenes viejas del template original no se usan.
- `brand/`: logo y banner de marca (HTML fuente + PNG exportados).

## Secciones (en orden)

1. **Preloader**: pantalla de "arranque" con contador 0–100 %. En la misma sesión se saltea rápido.
2. **Hero**: nombre, frase, rotador de "Enfoque" (lista `roles` en `index.js`), partículas de brasas en canvas y HUD.
3. **Marquee**: cinta de skills (texto duplicado dos veces para el loop).
4. **Proyectos** `#work`: cada proyecto es un `<article class="project" data-engine="unity|unreal">` con imagen,
   etiqueta de motor, género, título, descripción, tags y links. Alternan lado con la clase `project--flip`.
   Los botones de filtro (Todos/Unity/Unreal) usan `data-engine`; los números junto a cada filtro son fijos en el HTML.
5. **Herramientas & extras** `#tools`: tarjeta del conversor UGUI → UI Toolkit (badge "Próximamente en Asset Store",
   features, stats animadas y comparador antes/después arrastrable) + tarjetas chicas (`.extra`).
6. **Sobre mí** `#about`: foto, bio, stats (`data-count` = número final animado), skills, formación y botón al CV.
7. **Contacto** `#contact`: email que se copia con un click, LinkedIn, GitHub, email y CV.
8. **Footer**: hora de Buenos Aires en vivo y nombre gigante.

## Idiomas (ES/EN)

Todo texto traducible tiene `data-i18n="clave"` en el HTML, y la clave existe en los dos diccionarios `I18N.es` e
`I18N.en` al principio de `index.js`. El texto escrito en el HTML es solo el valor inicial: **el que manda es el del
diccionario**. Al agregar texto nuevo: poné `data-i18n="miClave"` y agregá `miClave` en `es` y en `en`.
Los nombres propios (títulos de juegos, "Lead Programmer") van sin `data-i18n`.

## Cómo agregar un proyecto

1. Exportar una captura a `images/work/<nombre>.webp` (16:9 o 16:10, ~1600 px de ancho).
2. Copiar un `<article class="project" ...>` existente dentro de `.projects`, cambiar `data-engine`, la imagen, el
   número `LVL 0X`, links, `data-cursor` del link de la imagen (`play` o `watch`) y alternar `project--flip`.
3. Usar claves nuevas (`genre5`, `desc5`, `t5a`…) y agregarlas en ES y EN en `index.js`.
4. Actualizar los contadores de los filtros (`<sup>`) y el stat "juegos desarrollados" en Sobre mí si corresponde.

Herramientas nuevas: agregar una tarjeta `.extra` (o una `.tool` completa si merece destacarse) en `#tools`.

## Efectos (en `index.js`)

Preloader, partículas del hero, cursor personalizado (muestra la etiqueta de `data-cursor`), botones magnéticos
(`data-magnetic`), tilt 3D (`data-tilt`), letras que aparecen (`data-split`), aparición al hacer scroll
(`data-reveal`), títulos que se ajustan al ancho (`data-fit`), contadores, filtros, comparador, reloj y copiar email.
Respeta "reducir movimiento" del sistema y es responsive (probado a 375 px).

Para capturas: `index.html?static` muestra todo sin preloader ni animaciones de entrada.

## Pantalla de arranque

Sigue la composición del arranque real de PS2: torres de luz con el logo, y después un menú negro con un anillo de luces
azules y dos opciones apiladas (Portfolio y Parches y mods). Se elige con flechas y Enter o con el mouse, cualquier tecla
saltea el arranque y arranca seleccionado Portfolio.

- Solo aparece en la primera visita de la sesión (`sessionStorage` `sb-gate`). No aparece con un enlace directo
  (`index.html#work`) ni con `?static`. `index.html?gate` la fuerza: es el link "Cambiar de disco" del footer.
- `gate.js` deja la promesa `window.sbGate`, e `index.js` la espera antes de arrancar su preloader.
- Sus textos están en `TEXT`, al principio de `gate.js`. El idioma se comparte con el resto del sitio (`sb-lang`).

## Parches y mods

Un cuarto de 2005 visto por una cámara digital chica: pared de casa, mueble de madera, tele de tubo, posters, figuras y
un estante de lomos reales de PS2. Muy poco texto y pocos objetos: el material real es el protagonista.

La luz cuenta una sola historia y conviene respetarla al cambiar colores: flash de frente que cae hacia las esquinas
(`.ph-falloff`), negros levantados a marrón (`.ph-blacks`), ruido de sensor (`.ph-noise`) y la tele como único color frío.
Encima de toda la página va `.lens`, con la viñeta y las scanlines de una digital vieja: la intensidad de cada una se
cambia ahí. Las imágenes de `images/parches/cuarto/` ya vienen procesadas (papel con pliegues y cinta, luz del cuarto,
ruido y algo de JPEG), así que una imagen nueva necesita el mismo tratamiento para no parecer pegada. Todo lo que se apoya
en el estante lleva su sombra de contacto, y su sombra en la pared es más larga cuanto más lejos está de ella.

- **El estante:** los juegos con parches resaltan y son los únicos que se abren; el resto es decorado. Los lomos se
  levantan y se inclinan al pasar el mouse (`livingRoom()`). `fitShelf()` muestra solo los que entran a la derecha, para que
  el juego siempre quede a la vista, y el último visible se apoya en la figura. En celular queda Xenosaga II al centro y la
  tele va en otro estante.
- **La tele:** se prende con la línea blanca clásica. Muestra el mismo menú de la pantalla de arranque y, al pasar por un
  juego, cambia de canal con estática a sus pantallas reales (`screens` en `GAMES`).
- **La caja:** sale del estante, gira hasta mostrar la tapa y se abre: a la izquierda la pantalla de título del juego, con
  los parches como opciones de su menú, y a la derecha los discos originales. Con un click afuera o Esc vuelve.
- **La fecha** de la esquina es `STAMP` en `parches.js`: el día que Xenosaga II salió en América.
- **El sonido** es sintetizado, suena después del primer gesto y se apaga con ♪.

Para sumar un juego con parches:

1. Crear `images/parches/<juego>/` con `tapa.webp` (940 × 1324), `lomo.webp` (106 × 1324), `logo.webp`, `portada.webp`
   (arte de la pantalla de título, 920 × 1296), un `disco1.webp` por cada disco original y unas capturas `tv-*.webp`
   (560 × 420). The Cover Project tiene la caja entera en
   `https://coverproject.sfo2.cdn.digitaloceanspaces.com/playstation_2/ps2_<nombre>.jpg`: en esas imágenes, la tapa ocupa
   el 70,8 % del alto y el lomo queda en el centro.
2. Agregar el juego a `GAMES`, al principio de `parches.js`, y su clave a `SHELF`. En celular se ocultan los primeros 13
   lomos para centrar el juego, así que si cambia la posición de Xenosaga II hay que ajustar `.spine:nth-child(-n+13)` en
   `parches.css`.

Los juegos de decorado solo necesitan `images/parches/lomos/<clave>.webp` (60 × 720) y su clave en `SHELF`.

Los textos están en `TEXT` y en `GAMES`, en español e inglés. También responde a `?static` y a "reducir movimiento".

## Datos útiles

- Email: batnoskasantiago@gmail.com · LinkedIn: linkedin.com/in/santiago-batnoska · GitHub: github.com/Batnoska
- El conversor se publica en el Asset Store; link futuro del producto: https://u3d.as/4ent (reemplazar el badge
  "Próximamente" cuando esté publicado).
