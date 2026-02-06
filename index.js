import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
import P from "pino";

async function startBot() {
  // Carpeta de sesión
  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false
  });

  // Guardar sesión
  sock.ev.on("creds.update", saveCreds);

  // Estado de conexión
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, pairingCode } = update;

    if (pairingCode) {
      console.log("\n==============================");
      console.log("🔑 CÓDIGO DE VINCULACIÓN:");
      console.log("👉", pairingCode);
      console.log("==============================\n");
      console.log("📱 WhatsApp > Dispositivos vinculados > Vincular con número");
    }

    if (connection === "open") {
      console.log("✅ BOT CONECTADO CORRECTAMENTE");
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        console.log("🔄 Reconectando...");
        startBot();
      } else {
        console.log("❌ Sesión cerrada. Borra la carpeta auth y vuelve a vincular.");
      }
    }
  });

  // Mensaje de prueba
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (text === "hola") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "👋 Hola, el bot está funcionando correctamente."
      });
    }
  });
}

startBot();
