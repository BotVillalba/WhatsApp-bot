const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const express = require("express");
const Pino = require("pino");

const app = express();
const PORT = process.env.PORT || 3000;

// Servidor web (Railway necesita esto)
app.get("/", (req, res) => {
  res.send("🤖 Bot de WhatsApp activo");
});

app.listen(PORT, () => {
  console.log("🌐 Servidor web activo en puerto", PORT);
});

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    logger: Pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: false // USAMOS CÓDIGO, NO QR
  });

  // 👇 CAMBIÁ ESTE NÚMERO POR EL TUYO (con código país, sin + ni espacios)
const numero = "595993633752";

setTimeout(async () => {
  try {
    const code = await sock.requestPairingCode(numero);
    console.log("📲 CÓDIGO DE VINCULACIÓN:", code);
  } catch (e) {
    console.log("❌ Error al generar código:", e);
  }
}, 3000);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, pairingCode } = update;

    if (pairingCode) {
      console.log("📲 CÓDIGO DE VINCULACIÓN:", pairingCode);
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        iniciarBot();
      }
    }

    if (connection === "open") {
      console.log("✅ Bot conectado a WhatsApp");
    }
  });
}

iniciarBot();
