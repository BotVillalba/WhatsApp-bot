import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";

import P from "pino";

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false
  });

  // Código de vinculación (solo la primera vez)
  if (!state.creds.registered) {
    const phoneNumber = process.env.PHONE_NUMBER; // ej: 5959XXXXXXXX
    const code = await sock.requestPairingCode(phoneNumber);
    console.log("🔑 CÓDIGO DE VINCULACIÓN:", code);
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
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
}

startBot();
