// ===== FIX CRYPTO (UNA SOLA VEZ) =====
const crypto = require("crypto");
global.crypto = crypto;

// ===== DEPENDENCIAS =====
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const Pino = require("pino");
const express = require("express");

// ===== SERVIDOR WEB (Railway necesita esto) =====
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
    auth: state,
    logger: Pino({ level: "silent" }),
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      console.log("⚠️ Conexión cerrada", shouldReconnect ? "reconectando..." : "no se reconectará");

      if (shouldReconnect) iniciarBot();
    }

    if (connection === "open") {
      console.log("✅ WhatsApp conectado correctamente");
    }
  });

  // 👉 GENERA UN SOLO CÓDIGO
  setTimeout(async () => {
    try {
      const code = await sock.requestPairingCode("595993633752"); // 👈 tu número con país
      console.log("📱 CÓDIGO DE VINCULACIÓN:", code);
    } catch (err) {
      console.error("❌ Error al generar código:", err.message);
    }
  }, 3000);
}

iniciarBot();
