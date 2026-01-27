const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const P = require("pino");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (text === "/menu") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "★VĮŁŁĄŁƁĄ★ bot 🤖\n\nMenú general activo",
      });
    }
  });

  console.log("🤖 Bot iniciado correctamente");
}

startBot();
