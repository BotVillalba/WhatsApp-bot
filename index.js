// ===== FIX OBLIGATORIO PARA BAILEYS (Railway) =====
import crypto from "crypto";
global.crypto = crypto.webcrypto;

// ===== IMPORTS =====
import express from "express";
import Pino from "pino";
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

// ===== SERVIDOR WEB (Railway lo necesita) =====
const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("🤖 Bot de WhatsApp activo");
});

app.listen(PORT, () => {
  console.log("🌐 Servidor web activo en puerto", PORT);
});

// ===== BOT WHATSAPP =====
async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    logger: Pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: false // NO QR
  });

  // 🔴 CAMBIÁ ESTE NÚMERO POR EL TUYO
  // 👉 Código país + número, SIN + ni espacios
  const numero = "595XXXXXXXXX";

  // Generar código de vinculación
  setTimeout(async () => {
    try {
      const code = await sock.requestPairingCode(numero);
      console.log("📲 CÓDIGO DE VINCULACIÓN:", code);
    } catch (err) {
      console.error("❌ Error al generar código:", err);
    }
  }, 3000);

  // Guardar sesión
  sock.ev.on("creds.update", saveCreds);

  // Estado de conexión
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ BOT CONECTADO A WHATSAPP");
    }

    if (connection === "close") {
      const reason =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log("⚠️ Conexión cerrada, reconectando...");
      if (reason) iniciarBot();
    }
  });

  // ===== EJEMPLO DE MENSAJE =====
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const texto =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (texto?.toLowerCase() === "hola") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "👋 Hola, soy ★VĮŁŁĄŁƁĄ★ bot 🤖"
      });
    }
  });
}

// ===== INICIAR =====
iniciarBot();
