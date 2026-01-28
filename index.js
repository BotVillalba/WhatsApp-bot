const express = require("express");
const pino = require("pino");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
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

  const NUMERO = "595993633752"; // 👈 TU NÚMERO
  let codigoGenerado = false;

  sock.ev.on("connection.update", (update) => {
    const { connection } = update;

    if (connection === "open") {
      console.log("✅ WhatsApp conectado correctamente");
    }

    if (connection === "close") {
      console.log("⚠️ Conexión cerrada (no se reintentará)");
    }
  });

  setTimeout(async () => {
    if (codigoGenerado) return;

    try {
      codigoGenerado = true;
      const code = await sock.requestPairingCode(NUMERO);

      console.log("📱 CÓDIGO DE VINCULACIÓN:", code);
      console.log("👉 WhatsApp > Dispositivos vinculados");

    } catch (err) {
      console.log("❌ Error al generar código:", err.message);
    }
  }, 4000);

  sock.ev.on("creds.update", saveCreds);
}

iniciarBot();
