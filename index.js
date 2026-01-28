import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
import express from "express";
import pino from "pino";

const app = express();
const PORT = process.env.PORT || 8080;

// ===== SERVIDOR WEB (Railway necesita esto) =====
app.get("/", (req, res) => {
  res.send("🤖 Bot de WhatsApp activo");
});

app.listen(PORT, () => {
  console.log("🌐 Servidor web activo en puerto", PORT);
});

// ===== BOT =====
async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: false
  });

  // 🔒 TU NÚMERO (solo uno)
  const NUMERO = "595XXXXXXXXX"; // <-- poné tu número con código país

  let codigoGenerado = false; // 🔑 clave para evitar múltiples códigos

  sock.ev.on("connection.update", async (update) => {
    const { connection } = update;

    if (connection === "open") {
      console.log("✅ WhatsApp conectado correctamente");
    }

    if (connection === "close") {
      console.log("⚠️ Conexión cerrada. NO se reintentará.");
    }
  });

  // 👉 GENERAR SOLO UN CÓDIGO
  setTimeout(async () => {
    if (codigoGenerado) return;

    try {
      codigoGenerado = true;

      const code = await sock.requestPairingCode(NUMERO);
      console.log("📱 CÓDIGO DE VINCULACIÓN:", code);
      console.log("👉 Ingrésalo en WhatsApp > Dispositivos vinculados");

    } catch (err) {
      console.log("❌ Error al generar código:", err.message);
    }
  }, 3000);

  sock.ev.on("creds.update", saveCreds);
}

iniciarBot();import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
import express from "express";
import pino from "pino";

const app = express();
const PORT = process.env.PORT || 8080;

// ===== SERVIDOR WEB (Railway necesita esto) =====
app.get("/", (req, res) => {
  res.send("🤖 Bot de WhatsApp activo");
});

app.listen(PORT, () => {
  console.log("🌐 Servidor web activo en puerto", PORT);
});

// ===== BOT =====
async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: false
  });

  // 🔒 TU NÚMERO (solo uno)
  const NUMERO = "595993633752"; // <-- poné tu número con código país

  let codigoGenerado = false; // 🔑 clave para evitar múltiples códigos

  sock.ev.on("connection.update", async (update) => {
    const { connection } = update;

    if (connection === "open") {
      console.log("✅ WhatsApp conectado correctamente");
    }

    if (connection === "close") {
      console.log("⚠️ Conexión cerrada. NO se reintentará.");
    }
  });

  // 👉 GENERAR SOLO UN CÓDIGO
  setTimeout(async () => {
    if (codigoGenerado) return;

    try {
      codigoGenerado = true;

      const code = await sock.requestPairingCode(NUMERO);
      console.log("📱 CÓDIGO DE VINCULACIÓN:", code);
      console.log("👉 Ingrésalo en WhatsApp > Dispositivos vinculados");

    } catch (err) {
      console.log("❌ Error al generar código:", err.message);
    }
  }, 3000);

  sock.ev.on("creds.update", saveCreds);
}

iniciarBot();
