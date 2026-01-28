global.crypto = require("crypto");

const express = require("express");
const {
  default: makeWASocket,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys");
const pino = require("pino");

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (_, res) => res.send("WhatsApp bot activo"));
app.listen(PORT, () =>
  console.log("🌐 Servidor web activo en puerto", PORT)
);

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true // 👈 IMPORTANTE
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection }) => {
    if (connection === "open") {
      console.log("✅ WhatsApp conectado correctamente");
    }
    if (connection === "close") {
      console.log("⚠️ Conexión cerrada, esperando QR...");
    }
  });
}

iniciarBot();
