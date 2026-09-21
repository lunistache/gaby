/* =========================================================
   Maestra Gaby Mora · alfabetización inicial
   Carrito, pagos con Stripe, filtros, modal de detalle y menú.
   La configuración (WhatsApp, correo, links de Stripe) vive en config.js
   ========================================================= */

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const mxn = n => "$" + n.toLocaleString("es-MX");

/* ---------------- Año del footer ---------------- */
$("#year").textContent = new Date().getFullYear();

/* ---------------- Enlaces de contacto ---------------- */
const waLink = (texto) =>
  `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;

$("#wa-directo").href = waLink("¡Hola Gaby! Tengo una duda sobre tus materiales ✏️");
$("#mail-directo").href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Consulta sobre materiales")}`;

/* ---------------- Menú móvil ---------------- */
const navToggle = $("#nav-toggle");
const navLinks  = $("#nav-links");

navToggle.addEventListener("click", () => {
  const abierto = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!abierto));
  navLinks.classList.toggle("is-open", !abierto);
});

navLinks.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    navToggle.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("is-open");
  }
});

/* ---------------- Filtros de materiales ---------------- */
const chips = $$(".chip");
const cards = $$("#grid-materiales .card");

chips.forEach(chip => {
  chip.addEventListener("click", () => {
    const filtro = chip.dataset.filtro;
    chips.forEach(c => c.classList.toggle("is-active", c === chip));
    cards.forEach(card => {
      card.hidden = filtro !== "todos" && card.dataset.cat !== filtro;
    });
  });
});

/* ---------------- Carrito ---------------- */
const CLAVE = "gaby-pedido-v1";

let pedido = [];
try {
  pedido = JSON.parse(localStorage.getItem(CLAVE)) || [];
} catch (_) {
  pedido = [];
}

const guardar = () => {
  try { localStorage.setItem(CLAVE, JSON.stringify(pedido)); } catch (_) {}
};

const total = () => pedido.reduce((s, it) => s + it.precio * it.cant, 0);
const piezas = () => pedido.reduce((s, it) => s + it.cant, 0);

function agregar({ id, nombre, precio, img }) {
  const existente = pedido.find(it => it.id === id);
  if (existente) {
    existente.cant += 1;
  } else {
    pedido.push({ id, nombre, precio, img, cant: 1 });
  }
  guardar();
  pintarCarrito();
  avisar(`${nombre} · agregado ✨`);
}

function cambiarCantidad(id, delta) {
  const it = pedido.find(x => x.id === id);
  if (!it) return;
  it.cant += delta;
  if (it.cant <= 0) pedido = pedido.filter(x => x.id !== id);
  guardar();
  pintarCarrito();
}

function pintarCarrito() {
  const contenedor = $("#cart-items");
  contenedor.innerHTML = "";

  if (pedido.length === 0) {
    contenedor.innerHTML = '<p class="cart-empty">Todavía no agregas nada ✏️</p>';
  } else {
    pedido.forEach(it => {
      const linea = document.createElement("div");
      linea.className = "cart-line";
      linea.innerHTML = `
        <img src="${it.img}" alt="">
        <div>
          <div class="cart-line-name"></div>
          <div class="cart-line-price">${mxn(it.precio)} c/u</div>
        </div>
        <div class="qty">
          <button type="button" data-menos aria-label="Quitar uno">−</button>
          <span>${it.cant}</span>
          <button type="button" data-mas aria-label="Agregar uno">+</button>
        </div>`;
      linea.querySelector(".cart-line-name").textContent = it.nombre;
      linea.querySelector("[data-menos]").addEventListener("click", () => cambiarCantidad(it.id, -1));
      linea.querySelector("[data-mas]").addEventListener("click", () => cambiarCantidad(it.id, +1));
      contenedor.appendChild(linea);
    });
  }

  const n = piezas();
  $("#cart-total").textContent = `${mxn(total())} MXN`;
  $("#cart-count").textContent = n;
  $("#cart-fab-count").textContent = n;
  $("#cart-fab").hidden = n === 0;
}

/* ---------------- Abrir / cerrar carrito ---------------- */
const drawer  = $("#drawer");
const overlay = $("#overlay");

function abrirCarrito() {
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function cerrarCarrito() {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
  document.body.style.overflow = "";
}

$("#cart-open").addEventListener("click", abrirCarrito);
$("#cart-fab").addEventListener("click", abrirCarrito);
$("#cart-close").addEventListener("click", cerrarCarrito);
overlay.addEventListener("click", cerrarCarrito);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && drawer.classList.contains("is-open")) cerrarCarrito();
});

/* ---------------- Pedido por WhatsApp ---------------- */
$("#cart-checkout").addEventListener("click", () => {
  if (pedido.length === 0) {
    avisar("Agrega algo a tu pedido primero 🙂");
    return;
  }
  const lineas = pedido.map(it => `• ${it.nombre} x${it.cant} — ${mxn(it.precio * it.cant)}`);
  const texto = [
    CONFIG.saludo,
    "",
    ...lineas,
    "",
    `Total: ${mxn(total())} MXN`
  ].join("\n");

  window.open(waLink(texto), "_blank", "noopener");
});

/* ---------------- Botones "Agregar" ---------------- */
function datosDe(boton) {
  // El botón puede traer los datos o heredarlos de su tarjeta / curso.
  const fuente = boton.dataset.id ? boton : boton.closest("[data-id]");
  const img = fuente.querySelector?.("img")?.getAttribute("src") || "images/kit-rincon.jpg";
  return {
    id: fuente.dataset.id,
    nombre: fuente.dataset.nombre,
    precio: Number(fuente.dataset.precio),
    img
  };
}

$$(".add").forEach(btn => {
  btn.addEventListener("click", () => agregar(datosDe(btn)));
});

/* ---------------- Pagos con Stripe (Payment Links) ---------------- */
// Devuelve el link de pago del producto, o null si no hay uno válido.
function linkStripe(id) {
  const url = ((CONFIG.stripe || {})[id] || "").trim();
  if (!url) return null;
  if (!url.startsWith("https://buy.stripe.com/")) {
    console.warn(`config.js: el link de Stripe de "${id}" no parece un Payment Link y se ignoró:`, url);
    return null;
  }
  return url;
}

function botonPagar(url, extra = "") {
  const a = document.createElement("a");
  a.className = `btn btn-primary btn-pay ${extra}`.trim();
  a.href = url;
  a.rel = "noopener";
  a.textContent = "💳 Comprar con tarjeta";
  return a;
}

function notaSegura() {
  const p = document.createElement("p");
  p.className = "secure";
  p.textContent = "🔒 Pago seguro con tarjeta a través de Stripe";
  return p;
}

// Cuando un producto tiene link, "Comprar con tarjeta" pasa a ser el botón
// principal y "Agregar al pedido" (WhatsApp) queda como opción secundaria.
function volverSecundario(btn) {
  btn.classList.remove("btn-primary");
  btn.classList.add("btn-ghost");
}

// Tarjetas de materiales
$$("#grid-materiales .card").forEach(card => {
  const url = linkStripe(card.dataset.id);
  if (!url) return;
  const add = card.querySelector(".add");
  volverSecundario(add);
  card.querySelector(".card-actions").prepend(botonPagar(url, "btn-sm block"));
});

// Cursos
$$(".curso").forEach(curso => {
  const url = linkStripe(curso.dataset.id);
  if (!url) return;
  const buy = curso.querySelector(".buy");
  const add = buy.querySelector(".add");
  volverSecundario(add);
  add.before(botonPagar(url));
  buy.after(notaSegura());
});

// Sección destacada del kit
$$(".kit .add").forEach(btn => {
  const url = linkStripe(btn.dataset.id);
  if (!url) return;
  volverSecundario(btn);
  const acciones = document.createElement("div");
  acciones.className = "kit-actions";
  btn.before(acciones);
  acciones.append(botonPagar(url, "btn-lg"), btn);
});

/* ---------------- Modal de detalle ---------------- */
const modal = $("#modal");

$$(".detail").forEach(btn => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".card");
    const img  = card.querySelector(".card-media img");

    $("#modal-img").src = img.getAttribute("src");
    $("#modal-img").alt = img.getAttribute("alt");
    $("#modal-title").textContent = card.dataset.nombre;
    $("#modal-price").innerHTML = card.querySelector(".price").innerHTML + ' <span>MXN</span>';
    $("#modal-desc").innerHTML = card.querySelector(".prod-full").innerHTML;

    const añadir = $("#modal-add");
    añadir.dataset.id     = card.dataset.id;
    añadir.dataset.nombre = card.dataset.nombre;
    añadir.dataset.precio = card.dataset.precio;
    añadir.dataset.img    = img.getAttribute("src");

    // Botón de pago: visible solo si el producto tiene link de Stripe
    const url   = linkStripe(card.dataset.id);
    const pagar = $("#modal-pay");
    pagar.hidden = !url;
    $("#modal-secure").hidden = !url;
    if (url) pagar.href = url;
    añadir.classList.toggle("btn-primary", !url);
    añadir.classList.toggle("btn-ghost", !!url);

    modal.showModal();
  });
});

$("#modal-add").addEventListener("click", (e) => {
  const d = e.currentTarget.dataset;
  agregar({ id: d.id, nombre: d.nombre, precio: Number(d.precio), img: d.img });
  modal.close();
  abrirCarrito();
});

$("#modal-close").addEventListener("click", () => modal.close());

modal.addEventListener("click", (e) => {
  // Clic fuera del contenido = cerrar
  if (e.target === modal) modal.close();
});

/* ---------------- Avisos ---------------- */
let temporizador;
function avisar(mensaje) {
  const toast = $("#toast");
  toast.textContent = mensaje;
  toast.classList.add("is-visible");
  clearTimeout(temporizador);
  temporizador = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

/* ---------------- Arranque ---------------- */
pintarCarrito();
