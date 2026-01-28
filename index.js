const crypto = require("crypto");
global.crypto = crypto;

const express = require("express");
const pino = require("pino");
const crypto = require("crypto"); // ✅ SOLUCIÓN AL ERROR

global.crypto = crypto; // ✅ Baileys lo necesita así

const {
  default: makeWASocket,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys");

// ===== SERVIDOR WEB =====
const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("🤖 Bot de WhatsApp activo");
});

app.listen(PORT, () => {
  console.log("🌐 Servidor web activo en puerto", PORT);
});

// ===== BOT =====
async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: false
  });

  const NUMERO = "595993633752"; // 👈 TU NÚMERO (sin + ni espacios)
  let codigoGenerado = false;

  setTimeout(async () => {
    if (codigoGenerado) return;

    try {
      codigoGenerado = true;
      const code = await sock.requestPairingCode(NUMERO);
      console.log("📱 CÓDIGO DE VINCULACIÓN:", code);
      console.log("👉 WhatsApp > Dispositivos vinculados > Vincular con código");
    } catch (err) {
      console.log("❌ Error al generar código:", err.message);
    }
  }, 5000);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    if (update.connection === "open") {
      console.log("✅ WhatsApp conectado correctamente");
    }
    if (update.connection === "close") {
      console.log("⚠️ Conexión cerrada (esperando acción manual)");
    }
  });
}

iniciarBot();
