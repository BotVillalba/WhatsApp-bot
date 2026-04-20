const express = require('express');
const axios = require('axios');
const { MongoClient } = require('mongodb');
const app = express();
app.use(express.json());

const EVOLUTION_URL = process.env.EVOLUTION_URL;
const EVOLUTION_KEY = process.env.EVOLUTION_KEY;
const INSTANCE = process.env.INSTANCE;
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 8000;
const KOYEB_URL = process.env.KOYEB_URL;

const client = new MongoClient(MONGO_URI);

async function main() {
  await client.connect();
  const db = client.db('rpgdb');
  const players = db.collection('players');
  console.log('Conectado a MongoDB');

  app.post('/webhook', async (req, res) => {
    const data = req.body;
    if (data.event === 'messages.upsert' &&!data.data.key.fromMe) {
      const msg = data.data.message?.conversation?.toLowerCase();
      const from = data.data.key.remoteJid;
      const sender = data.data.pushName || "Aventurero";

      if (msg === '/rpg crear') {
        await players.updateOne(
          { id: from },
          { $setOnInsert: { id: from, nombre: sender, nivel: 1, hp: 30, hpMax: 30, oro: 0, clase: null, xp: 0 } },
          { upsert: true }
        );
        await sendMsg(from, `¡Bienvenido ${sender}!\nUsá /clase guerrero|mago|picaro para elegir`);
      }

      if (msg?.startsWith('/clase ')) {
        const clase = msg.split(' ')[1];
        if (!['guerrero', 'mago', 'picaro'].includes(clase)) return sendMsg(from, 'Clases: guerrero, mago, picaro');
        await players.updateOne({ id: from }, { $set: { clase } });
        await sendMsg(from, `Elegiste ${clase} ⚔️\nUsá /perfil para ver stats`);
      }

      if (msg === '/perfil') {
        const p = await players.findOne({ id: from });
        if (!p) return sendMsg(from, 'Primero usá /rpg crear');
        await sendMsg(from, `*${p.nombre}* - Nv.${p.nivel}\nHP: ${p.hp}/${p.hpMax}\nClase: ${p.clase || 'Sin elegir'}\nOro: ${p.oro}\nXP: ${p.xp}/100`);
      }
    }
    res.sendStatus(200);
  });

  async function sendMsg(to, text) {
    try {
      await axios.post(`${EVOLUTION_URL}/message/sendText/${INSTANCE}`, { number: to, text }, 
      { headers: { apikey: EVOLUTION_KEY } });
    } catch (e) { console.log('Error enviando:', e.message); }
  }

  // Setear webhook cuando inicia
  try {
    await axios.post(`${EVOLUTION_URL}/webhook/set/${INSTANCE}`, {
      url: `${KOYEB_URL}/webhook`,
      webhook_by_events: false,
      events: ['MESSAGES_UPSERT']
    }, { headers: { apikey: EVOLUTION_KEY } });
    console.log('Webhook configurado');
  } catch (e) { console.log('Error webhook:', e.message); }

  app.get('/', (req, res) => res.send('Bot RPG online'));
  app.listen(PORT, () => console.log(`Bot escuchando en ${PORT}`));
}
main();
