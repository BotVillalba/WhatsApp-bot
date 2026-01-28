import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
import P from "pino";

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false
  });

  // 🔢 Generar código de 8 dígitos
  if (!sock.authState.creds.registered) {
    const phoneNumber = "595993633752"; // ← TU NÚMERO CON CÓDIGO PAÍS
    const code = await sock.requestPairingCode(phoneNumber);
    console.log("📲 Código de vinculación:", code);
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ WhatsApp vinculado correctamente");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        startBot();
      }
    }
  });

  // 🤖 Bot básico (responde hola)
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation;
    if (text?.toLowerCase() === "hola") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "👋 Hola, soy un bot simple"
      });
    }
  });
}

startBot();
