// 🔐 FIX CRYPTO (OBLIGATORIO PARA RAILWAY)
import crypto from "crypto";
global.crypto = crypto.webcrypto;

// 📦 IMPORTS
import express from "express";
import Pino from "pino";
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

// 🌐 WEB SERVER (Railway / UptimeRobot)
const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("🤖 Bot de WhatsApp activo");
});

app.listen(PORT, () => {
  console.log("🌍 Servidor web activo en puerto", PORT);
});

// 🚀 INICIAR BOT
async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    logger: Pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: false
  });

  // 💾 GUARDAR SESIÓN
  sock.ev.on("creds.update", saveCreds);

  let codigoGenerado = false;

  // 🔌 CONEXIÓN
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ WhatsApp conectado correctamente");
      codigoGenerado = true; // ya no generar más códigos
    }

    if (connection === "close") {
      const reason =
        lastDisconnect?.error?.output?.statusCode;

      console.log("⚠️ Conexión cerrada. Razón:", reason);

      if (reason !== DisconnectReason.loggedOut) {
        iniciarBot();
      } else {
        console.log("❌ Sesión cerrada. Borra ./session y vuelve a vincular.");
      }
    }
  });

  // 🔐 GENERAR UN SOLO CÓDIGO
  setTimeout(async () => {
    if (codigoGenerado) return;

    try {
      const numero = "595993633752"; // 👈 TU NÚMERO (sin + ni espacios)
      const code = await sock.requestPairingCode(numero);

      console.log("📲 CÓDIGO DE VINCULACIÓN:", code);
      console.log("⏳ Ingrésalo en WhatsApp → Dispositivos vinculados");
    } catch (err) {
      console.error("❌ Error al generar código:", err.message);
    }
  }, 3000);
}

// ▶️ START
iniciarBot();
