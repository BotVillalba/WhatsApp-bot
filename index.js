// ===============================
// IMPORTS (COMMONJS)
// ===============================
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys");

const express = require("express");
const pino = require("pino");
const crypto = require("crypto");

// ===============================
// CONFIG
// ===============================
const PORT = process.env.PORT || 8080;
const NUMERO_WHATSAPP = "595993633752"; // ⬅️ TU NÚMERO SIN +

// generar UN SOLO código
let codigoGenerado = false;

// ===============================
// SERVIDOR WEB (Railway)
// ===============================
const app = express();
app.get("/", (req, res) => {
  res.send("🤖 Bot de WhatsApp activo");
});
app.listen(PORT, () => {
  console.log("🌐 Servidor web activo en puerto", PORT);
});

// ===============================
// BOT
// ===============================
async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["VillalbaBot", "Chrome", "1.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ WhatsApp conectado correctamente");
      return;
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log("⚠️ Conexión cerrada. Razón:", reason);

      if (!codigoGenerado && reason !== DisconnectReason.loggedOut) {
        console.log("🔁 Reintentando conexión...");
        iniciarBot();
      } else {
        console.log("🛑 Esperando acción manual");
      }
    }
  });

  // ===============================
  // CÓDIGO DE VINCULACIÓN (UNA VEZ)
  // ===============================
  setTimeout(async () => {
    if (codigoGenerado) return;

    try {
      const code = await sock.requestPairingCode(NUMERO_WHATSAPP);
      codigoGenerado = true;
      console.log("📱 CÓDIGO DE VINCULACIÓN (ÚNICO):", code);
      console.log("👉 WhatsApp > Dispositivos vinculados");
    } catch (err) {
      console.error("❌ Error al generar código:", err.message);
    }
  }, 5000);
}

// ===============================
// INICIAR
// ===============================
iniciarBot();
