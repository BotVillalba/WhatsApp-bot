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

  // 🔢 Código de 8 dígitos (solo la primera vez)
  if (!state.creds.registered) {
    const phoneNumber = 595993633752; // 👈 TU NÚMERO CON CÓDIGO PAÍS
    const code = await sock.requestPairingCode(phoneNumber);
    console.log("📲 CÓDIGO DE VINCULACIÓN:", code);
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ WhatsApp conectado correctamente");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        startBot();
      }
    }
  });

  // 🤖 BOT MÁS SIMPLE POSIBLE
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (text?.toLowerCase() === "hola") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "👋 Hola, ya estoy activo y funcionando"
      });
    }
  });
}

startBot();
