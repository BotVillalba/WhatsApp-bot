import crypto from "crypto";
global.crypto = crypto.webcrypto;

import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

import Pino from "pino";
import { Boom } from "@hapi/boom";

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: Pino({ level: "silent" }),
    browser: ["Railway", "Chrome", "1.0.0"]
  });

  // 🔑 CÓDIGO DE VINCULACIÓN (SIN QR)
  if (!state.creds.registered) {
    const numero = "595993633752"; // 👈 TU NÚMERO con código país, SIN +
    const code = await sock.requestPairingCode(numero);
    console.log("📲 Código de vinculación:", code);
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ BOT CONECTADO A WHATSAPP");
    }

    if (connection === "close") {
      const statusCode =
        lastDisconnect?.error instanceof Boom
          ? lastDisconnect.error.output.statusCode
          : null;

      if (statusCode !== DisconnectReason.loggedOut) {
        console.log("🔄 Conexión cerrada, reconectando...");
        setTimeout(iniciarBot, 3000);
      } else {
        console.log("❌ Sesión cerrada. Debes volver a vincular el número.");
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    await sock.sendMessage(msg.key.remoteJid, {
      text: "🤖 Bot activo *★VĮŁŁĄŁƁĄ★*"
    });
  });
}

iniciarBot();
