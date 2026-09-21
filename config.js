/* =========================================================
   ⚙️  CONFIGURACIÓN DEL SITIO
   Este es el ÚNICO archivo que hay que editar para cambiar
   el WhatsApp, el correo o los links de pago de Stripe.
   ========================================================= */

const CONFIG = {
  // Número de WhatsApp con código de país, SIN +, espacios ni guiones.
  // México: 52 + 10 dígitos.  Ejemplo: "5214421234567"
  whatsapp: "5210000000000",

  // Correo de contacto
  email: "hola@maestragabymora.com",

  // Texto con el que empieza el mensaje de WhatsApp del pedido
  saludo: "¡Hola Gaby! Quiero hacer este pedido:",

  /* -------------------------------------------------------
     💳 LINKS DE PAGO DE STRIPE (Payment Links)
     Pega entre las comillas el link de cada producto.
     Se ven así:  https://buy.stripe.com/abc123XYZ
     - Si un producto queda vacío "", su botón "Comprar con
       tarjeta" simplemente no aparece (se puede pedir por WhatsApp).
     - Cómo crear los links: ver README.md → "Pagos con Stripe".
     ------------------------------------------------------- */
  stripe: {
    // Cursos
    "curso-niveles":        "",   // ¿Qué onda con los niveles de escritura? · $650
    "curso-avanzar":        "",   // Ya sé qué onda… ¿cómo le hago para que avancen? · $1,500

    // Materiales
    "kit-rincon":           "",   // Kit de Rincón Escolar · $600
    "mini-poster-animales": "",   // Mini póster individual versión ANIMALES · $150
    "mini-poster-mesa":     "",   // Mini póster individual y para mesa de equipo · $150
    "abecedario":           "",   // Abecedario para tu aula · $150
    "tabla-registro":       "",   // Tabla de registro de niveles de escritura · $80
    "tabla-100":            "",   // Tabla y tarjetas de 1 a 100 · $80
    "memorama":             "",   // Memorama de animales · $80
    "tabla-colores":        "",   // Tabla de colores · $60
    "registro-lecturas":    "",   // Nuestro registro de lecturas · $50
    "tarjetas-meses":       ""    // Tarjetas de meses y días · $50
  }
};
