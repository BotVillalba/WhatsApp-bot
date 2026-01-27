const express = require("express");
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");

const app = express();
const PORT = process.env.PORT || 3000;

// servidor keep-alive
app.get("/", (req, res) => {
  res.send("🤖 ★VĮŁŁĄŁƁĄ★ BOT activo");
});

app.listen(PORT, () => {
  console.log("🌐 Servidor activo en puerto", PORT);
});

// WhatsApp bot
async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const texto = msg.message.conversation;
    const from = msg.key.remoteJid;

    if (texto === "menu") {
      await sock.sendMessage(from, {
        text: "★VĮŁŁĄŁƁĄ★ BOT\n\n1️⃣ Info\n2️⃣ Ayuda\n3️⃣ Comandos"
      });
    }
  });
}

iniciarBot();
