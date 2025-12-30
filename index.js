// ==========================================
// 0. IMPORTS & CONFIGURATION
// ==========================================
const http = require('http');
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  Events
} = require('discord.js');
require('dotenv').config();

// Node-fetch workaround for CommonJS
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// ==========================================
// 1. ENV VARIABLES
// ==========================================
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const SHEETDB_API = 'https://sheetdb.io/api/v1/wsen6e04jyn0l';
const PORT = process.env.PORT || 5000;

if (!TOKEN || !CLIENT_ID) {
  console.error('❌ Missing DISCORD_TOKEN or CLIENT_ID in environment variables!');
  process.exit(1);
}

console.log('DISCORD_TOKEN exists?', !!TOKEN);
console.log('CLIENT_ID exists?', !!CLIENT_ID);

// ==========================================
// 2. KEEP-ALIVE WEB SERVER
// ==========================================
http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running!');
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// ==========================================
// 3. DISCORD CLIENT
// ==========================================
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ==========================================
// 4. SLASH COMMANDS
// ==========================================
const commands = [
  new SlashCommandBuilder()
    .setName('dkp')
    .setDescription('Check your DKP points privately'),
].map(cmd => cmd.toJSON());

// ==========================================
// 5. LOGIN & REGISTER COMMANDS
// ==========================================
console.log('🔑 Attempting to log in...');
client.login(TOKEN)
  .then(() => {
    console.log(`✅ Bot logged in as ${client.user.tag}`);

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    (async () => {
      try {
        console.log('🔄 Refreshing slash commands...');
        await rest.put(
          Routes.applicationCommands(CLIENT_ID),
          { body: commands }
        );
        console.log('✅ Slash commands registered successfully');
      } catch (err) {
        console.error('❌ Slash command registration error:', err);
      }
    })();
  })
  .catch(err => {
    console.error('❌ Bot login failed! Check your DISCORD_TOKEN and CLIENT_ID.', err);
  });

// ==========================================
// 6. BOT EVENTS
// ==========================================
client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot is ready: ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'dkp') return;

  await interaction.deferReply({ ephemeral: true });
  const ign = interaction.member?.nickname || interaction.user.username;

  try {
    const response = await fetch(
      `${SHEETDB_API}/search?sheet=DKP System&IGN=${encodeURIComponent(ign)}&ignore_cache=1`
    );
    const text = await response.text();

    if (!response.ok || text.startsWith('<')) {
      console.error('❌ SheetDB error:', text);
      return interaction.editReply('⚠️ SheetDB error: Could not reach the DKP database.');
    }

    const data = JSON.parse(text);

    if (!Array.isArray(data) || data.length === 0) {
      return interaction.editReply(`❌ No DKP record found for **${ign}**. Make sure your Discord nickname matches the IGN in the sheet.`);
    }

    const biddingDKP = data[0]['Bidding_dkp'] || data[0]['Bidding DKP'] || "0";
    await interaction.editReply(`🤫 **${ign}**\nYour current **Bidding DKP** is: **${biddingDKP}**`);

  } catch (err) {
    console.error('❌ Fetch error:', err);
    await interaction.editReply('⚠️ Unexpected error fetching your DKP data.');
  }
});
