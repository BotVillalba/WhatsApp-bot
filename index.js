import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import Pino from "pino";

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true, // 👈 ESTO ES CLAVE
    logger: Pino({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection } = update;

    if (connection === "open") {
      console.log("✅ BOT CONECTADO A WHATSAPP");
    }

    if (connection === "close") {
      console.log("❌ CONEXIÓN CERRADA, REINICIANDO...");
      iniciarBot();
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    await sock.sendMessage(msg.key.remoteJid, {
      text: "🤖 Bot activo"
    });
  });
}

iniciarBot();
