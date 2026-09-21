# Maestra Gaby Mora · sitio web

Sitio estático (HTML + CSS + JS, sin plataforma ni mensualidad) que reemplaza la tienda de
TiendUp `maestra-gaby-mora-alfabetizacion.tiendup.com`.

```
gaby/
├── config.js       ← ⚙️ CONFIGURACIÓN: WhatsApp, correo y links de Stripe
├── index.html      ← todo el contenido de la página
├── gracias.html    ← página a la que Stripe regresa después de pagar
├── styles.css      ← diseño y colores
├── script.js       ← carrito, pagos, filtros, modal (no hace falta tocarlo)
├── favicon.svg     ← ícono de la pestaña
└── images/         ← fotos de los productos (copiadas del sitio anterior)
```

---

## ⚠️ Antes de publicar: datos por completar

Todo está en **`config.js`**, el único archivo de configuración:

```js
const CONFIG = {
  whatsapp: "5210000000000",              // ← número real, con 52 al inicio, sin + ni espacios
  email:    "hola@maestragabymora.com",   // ← correo real
  saludo:   "¡Hola Gaby! Quiero hacer este pedido:",
  stripe: {
    "curso-niveles": "",                  // ← un link de Stripe por producto (ver abajo)
    ...
  }
};
```

El número de WhatsApp y el correo no aparecían en el sitio de TiendUp, por eso quedaron
como marcadores de posición. **Mientras no se cambien, el botón de WhatsApp no llega a nadie.**

---

## Cómo funciona la venta

Hay dos formas de comprar, y conviven:

**💳 Pago directo con tarjeta (Stripe)** — para comprar un producto.
1. La maestra presiona **Comprar con tarjeta** en el producto.
2. Paga en la página segura de Stripe (Gaby nunca ve los datos de la tarjeta).
3. Stripe le manda su recibo por correo y la regresa a `gracias.html`.
4. Gaby recibe el aviso del pago de Stripe (correo / app) y le envía los PDF al correo del pago.

**💬 Pedido por WhatsApp** — para pedir varios productos juntos o pagar por transferencia.
1. La maestra agrega productos a "Mi pedido" y presiona **Enviar pedido por WhatsApp**.
2. Se abre WhatsApp con la lista y el total ya escritos.
3. Gaby responde con los datos de pago y, al confirmarse, envía los PDF.

---

## 💳 Pagos con Stripe

El sitio usa **Stripe Payment Links**: un link de pago por producto, creado desde el panel
de Stripe. No necesita servidor ni claves secretas, así que funciona en cualquier hosting gratuito.

Mientras un producto no tenga link, su botón "Comprar con tarjeta" **no aparece** y ese producto
solo se puede pedir por WhatsApp. Se pueden ir agregando los links de uno en uno.

### Crear un link (repetir para cada producto)

1. Entrar a <https://dashboard.stripe.com> → **Payment Links** → **+ New** (Crear link de pago).
2. **Producto**: nombre exacto (ej. *Abecedario para tu aula*), precio en **MXN**, pago **único**
   (no suscripción). Se puede subir la foto del producto.
3. Pestaña **After payment / Después del pago** → elegir
   **Don't show confirmation page / Redirigir a tu sitio web** y poner:
   `https://SU-DOMINIO/gracias.html`
   (la dirección real se conoce hasta publicar el sitio, ver más abajo).
4. Opcional: activar **Allow promotion codes** para usar cupones de descuento.
5. **Create link** → copiar el link (`https://buy.stripe.com/…`).
6. Pegarlo en `config.js`, en la línea del producto correspondiente:
   ```js
   "abecedario": "https://buy.stripe.com/abc123XYZ",
   ```

Los nombres de la izquierda (`"abecedario"`, `"kit-rincon"`, …) no se cambian: son los que
conectan cada link con su producto en la página. Cada línea trae un comentario con el nombre
y precio del producto para no confundirse.

### Probar antes de cobrar de verdad

En el panel de Stripe, activar **Test mode**, crear un link de prueba (empieza con
`https://buy.stripe.com/test_…`) y pagar con la tarjeta de prueba `4242 4242 4242 4242`,
cualquier fecha futura y cualquier CVC. Cuando todo funcione, crear los links reales y reemplazarlos.

### Importante

- **Si cambia un precio**, hay que cambiarlo en la página *y* en Stripe (en Stripe se crea un
  nuevo precio o un nuevo link). El monto que se cobra es siempre el de Stripe.
- **La entrega de los PDF no es automática**: Stripe cobra y avisa, pero no manda archivos.
  Gaby los envía al correo que aparece en el pago (Stripe → Payments → ver el cliente).
- **Cursos**: TiendUp alojaba los videos de los módulos. Fuera de TiendUp hay que subirlos a
  otro lugar (Vimeo, YouTube "no listado", Google Drive…) y enviar el acceso tras el pago.
- Si un link está mal pegado (no empieza con `https://buy.stripe.com/`), el sitio lo ignora
  y ese producto se queda sin botón de pago, para no mandar a nadie a una dirección equivocada.

---

## Cómo cambiar precios, textos o productos

Todo vive en `index.html`, no hace falta tocar `script.js`.

**Cambiar un precio** — hay que cambiarlo en dos lugares de la misma tarjeta, y también en Stripe:

```html
<article class="card" data-cat="aula" data-id="abecedario"
         data-nombre="Abecedario para tu aula" data-precio="150">   ← el que usa el carrito
  ...
  <p class="price"><strong>$150</strong></p>                        ← el que se ve en pantalla
```

Si el producto tiene link de Stripe, actualizar el precio también en el panel de Stripe
(el pago con tarjeta cobra lo que diga Stripe, no lo que diga la página).

**Poner un producto en oferta:** `<p class="price"><s>$650</s> <strong>$600</strong></p>`

**Agregar un material nuevo:** copiar un bloque `<article class="card">…</article>` completo,
pegar la copia dentro de `<div class="grid" id="grid-materiales">` y cambiar:

- `data-id` (un nombre corto y único), `data-nombre`, `data-precio`
- para cobrarlo con tarjeta: agregar una línea con ese mismo `data-id` en `config.js` → `stripe`
- `data-cat`: `aula`, `registro`, `numeros`, `juego` o `kit` (son los filtros de arriba)
- la imagen (`images/…`), el título, la frase corta y el texto dentro de `<div class="prod-full">`
  (ese texto es el que aparece en "Ver detalle").

**Agregar una foto:** guardarla en `images/` y usar su nombre en el `<img src="images/…">`.
Conviene que pese menos de 300 KB.

---

## Cómo verlo en la computadora

Abrir `index.html` con doble clic. Para verlo como en un servidor real:

```bash
cd gaby
python -m http.server 8000     # después abrir http://localhost:8000
```

---

## Cómo publicarlo en internet

Cualquiera de estas opciones es gratuita y no requiere servidor propio:

| Opción | Cómo | Dominio |
|---|---|---|
| **Netlify Drop** | arrastrar la carpeta `gaby` a <https://app.netlify.com/drop> | gratis `.netlify.app`, o se conecta uno propio |
| **Cloudflare Pages** | subir la carpeta desde el panel | gratis `.pages.dev` o propio |
| **GitHub Pages** | subir la carpeta a un repositorio y activar Pages | `usuario.github.io/gaby` |

Si quiere conservar una dirección propia (por ejemplo `maestragabymora.com`), se compra el
dominio una vez al año y se apunta al servicio elegido: los tres lo permiten sin costo extra.

---

## Detalles técnicos

- Sin dependencias ni build: solo se cargan las tipografías de Google Fonts.
- El pedido se guarda en el navegador de quien compra (`localStorage`), así no se pierde al recargar.
- Responsive, con menú móvil, filtros por categoría y modal de detalle por producto.
- Accesibilidad: navegación por teclado, `aria-label`, textos alternativos en todas las imágenes.
- Las imágenes se descargaron del sitio anterior y viven en `images/`, así que el sitio
  **no depende de TiendUp** una vez publicado.
