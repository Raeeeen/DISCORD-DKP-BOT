// ==========================================
// 1. RENDER WEB SERVER (Keeps the bot alive)
// ==========================================
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write("Bot is running!");
  res.end();
}).listen(process.env.PORT || 8080);

// ==========================================
// 2. IMPORTS & CONFIGURATION
// ==========================================
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  Events
} = require('discord.js');
require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const SHEETDB_API = 'https://sheetdb.io/api/v1/wsen6e04jyn0l';

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ==========================================
// 3. SLASH COMMAND DEFINITION
// ==========================================
const commands = [
  new SlashCommandBuilder()
    .setName('dkp')
    .setDescription('Check your DKP points privately'),
].map(cmd => cmd.toJSON());

// ==========================================
// 4. LOGIN & COMMAND REGISTRATION
// ==========================================
client.login(TOKEN).then(() => {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  (async () => {
    try {
      console.log('Refreshing slash commands...');
      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        { body: commands }
      );
      console.log('✅ Slash command registered successfully');
    } catch (err) {
      console.error('❌ Registration Error:', err);
    }
  })();
}).catch(err => {
  console.error("❌ Login failed! Double-check your DISCORD_TOKEN on Render.", err);
});

// ==========================================
// 5. BOT EVENTS
// ==========================================
client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'dkp') return;

  // Use flags: 64 to make the reply "Ephemeral" (Only the user sees it)
  await interaction.deferReply({ flags: 64 });

  const ign = interaction.member?.nickname || interaction.user.username;

  try {
    // We add ignore_cache=1 so that updates in Google Sheets show up immediately
    const response = await fetch(
      `${SHEETDB_API}/search?sheet=DKP System&IGN=${encodeURIComponent(ign)}&ignore_cache=1`
    );

    const text = await response.text();

    if (!response.ok || text.startsWith('<')) {
      console.error('SheetDB error:', text);
      return interaction.editReply('⚠️ SheetDB error: Could not reach the DKP database.');
    }

    const data = JSON.parse(text);

    if (!Array.isArray(data) || data.length === 0) {
      return interaction.editReply(`❌ No DKP record found for **${ign}**. Make sure your Discord nickname matches the IGN in the sheet.`);
    }

    // Checking for column names (SheetDB might change spaces to underscores)
    const biddingDKP = data[0]['Bidding_dkp'] || data[0]['Bidding DKP'] || "0";

    await interaction.editReply(`🤫 **${ign}**\nYour current **Bidding DKP** is: **${biddingDKP}**`);

  } catch (err) {
    console.error('Fetch Error:', err);
    await interaction.editReply('⚠️ Unexpected error fetching your DKP data.');
  }
});
