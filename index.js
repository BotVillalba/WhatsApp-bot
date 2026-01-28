import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
import Pino from "pino";

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger: Pino({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      console.log("📱 ESCANEÁ ESTE QR CON WHATSAPP:");
      console.log(qr);
    }

    if (connection === "open") {
      console.log("✅ BOT CONECTADO A WHATSAPP");
    }

    if (connection === "close") {
      const reason =
        lastDisconnect?.error?.output?.statusCode;

      console.log("❌ CONEXIÓN CERRADA, REINICIANDO...", reason);

      if (reason !== DisconnectReason.loggedOut) {
        iniciarBot();
      }
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
