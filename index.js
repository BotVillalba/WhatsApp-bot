import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

import Pino from "pino";
import crypto from "crypto";

// 🔑 Necesario para evitar el error: crypto is not defined
global.crypto = crypto;

// 🔒 Control para pedir el código SOLO UNA VEZ
global.pairingRequested = false;

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: Pino({ level: "silent" }),
    browser: ["Railway", "Chrome", "1.0.0"]
  });

  // 💾 Guardar sesión
  sock.ev.on("creds.update", saveCreds);

  // 📲 PEDIR CÓDIGO SOLO UNA VEZ
  if (!state.creds.registered && !global.pairingRequested) {
    global.pairingRequested = true;

    const numero = "595993633752"; // 👈 TU NÚMERO SIN +
    try {
      const code = await sock.requestPairingCode(numero);
      console.log("📲 CÓDIGO DE VINCULACIÓN:", code);
      console.log("⏳ Tenés ~60 segundos para ingresarlo en WhatsApp");
    } catch (err) {
      console.log("❌ Error al generar código:", err.message);
    }
  }

  // 🔌 ESTADO DE CONEXIÓN
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ BOT CONECTADO A WHATSAPP");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔄 Conexión cerrada, reintentando...");
        iniciarBot();
      } else {
        console.log("❌ Sesión cerrada. Debés volver a vincular el número.");
        global.pairingRequested = false;
      }
    }
  });

  // 💬 RESPUESTA SIMPLE DE PRUEBA
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    await sock.sendMessage(msg.key.remoteJid, {
      text: "🤖 Bot activo correctamente"
    });
  });
}

iniciarBot();
