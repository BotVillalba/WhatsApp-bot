import baileys from "@whiskeysockets/baileys";
import Pino from "pino";
import crypto from "crypto";

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = baileys;

// Fix crypto en Railway
global.crypto = crypto;

// Evitar loops de código
let pairingRequested = false;

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: Pino({ level: "silent" }),
    browser: ["Railway", "Chrome", "1.0.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  // 📲 Código de vinculación (solo 1 vez)
  if (!state.creds.registered && !pairingRequested) {
    pairingRequested = true;
    const numero = "595993633752"; // TU NÚMERO sin +

    try {
      const code = await sock.requestPairingCode(numero);
      console.log("📲 CÓDIGO DE VINCULACIÓN:", code);
      console.log("⏳ Ingresalo en WhatsApp (tenés ~1 min)");
    } catch (e) {
      console.log("❌ Error generando código:", e.message);
    }
  }

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ BOT CONECTADO A WHATSAPP");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔄 Reconectando...");
        iniciarBot();
      } else {
        console.log("❌ Sesión cerrada, necesitás volver a vincular");
        pairingRequested = false;
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;

    await sock.sendMessage(msg.key.remoteJid, {
      text: "🤖 ★VĮŁŁĄŁƁĄ★ bot activo"
    });
  });
}

iniciarBot();
