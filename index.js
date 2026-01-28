const express = require("express");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");
const pino = require("pino");

const app = express();
const PORT = process.env.PORT || 8080;

// Mantener Railway vivo
app.get("/", (_, res) => res.send("WhatsApp bot activo"));
app.listen(PORT, () =>
  console.log("🌐 Servidor web activo en puerto", PORT)
);

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ WhatsApp conectado correctamente");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log("⚠️ Conexión cerrada. Razón:", reason);

      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔄 Esperando vinculación manual...");
      }
    }
  });

  // 🔐 GENERAR UN SOLO CÓDIGO
  if (!state.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode("595993633752"); // TU NÚMERO
        console.log("📱 CÓDIGO DE VINCULACIÓN:", code);
        console.log("👉 WhatsApp > Dispositivos vinculados");
      } catch (e) {
        console.log("❌ Error al generar código:", e.message);
      }
    }, 3000);
  }
}

iniciarBot();
