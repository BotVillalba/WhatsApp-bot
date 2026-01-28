// 🔐 FIX crypto para Node 18+
const crypto = require("crypto");
global.crypto = crypto;

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const express = require("express");
const pino = require("pino");

const PORT = process.env.PORT || 8080;
const NUMERO_WHATSAPP = "595993633752"; // 👉 TU NÚMERO SIN +

let codigoGenerado = false;
let yaConectado = false;

// =======================
// SERVIDOR WEB (Railway)
// =======================
const app = express();
app.get("/", (_, res) => res.send("🤖 Bot activo"));
app.listen(PORT, () => {
  console.log("🌐 Servidor web activo en puerto", PORT);
});

// =======================
// BOT WHATSAPP
// =======================
async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

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
      yaConectado = true;
      console.log("✅ WhatsApp conectado correctamente");
      return;
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log("⚠️ Conexión cerrada. Razón:", reason);

      // 🚫 NO reconectar antes de vincular
      if (!yaConectado && !state.creds.registered) {
        console.log("🛑 Esperando vinculación manual...");
        return;
      }

      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔁 Reintentando conexión...");
        iniciarBot();
      } else {
        console.log("🛑 Sesión cerrada desde WhatsApp");
      }
    }
  });

  // =======================
  // CÓDIGO DE VINCULACIÓN
  // =======================
  if (!state.creds.registered && !codigoGenerado) {
    codigoGenerado = true;

    try {
      const code = await sock.requestPairingCode(NUMERO_WHATSAPP);
      console.log("📱 CÓDIGO DE VINCULACIÓN:", code);
      console.log("👉 WhatsApp > Dispositivos vinculados");
    } catch (err) {
      console.error("❌ Error al generar código:", err.message);
    }
  }
}

iniciarBot();
