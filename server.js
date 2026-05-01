require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────
// GOOGLE SHEETS ADAPTER
// Setup steps:
//  1. Create a Google Sheet with two tabs: "Beta" and "Waitlist"
//  2. Go to console.cloud.google.com → create a project → enable Sheets API
//  3. Create a Service Account → download the JSON key
//  4. Share the spreadsheet with the service account email (Editor)
//  5. Set GOOGLE_SERVICE_ACCOUNT_JSON (the full JSON as a string) and GOOGLE_SPREADSHEET_ID in .env
//  6. Run: npm install googleapis
//  7. Uncomment the block below
// ─────────────────────────────────────────────
/*
const { google } = require('googleapis');

async function appendToGoogleSheet(entry) {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetName = entry.status === 'BETA' ? 'Beta' : 'Waitlist';
  const row = [
    entry.submittedAt, entry.name, entry.email, entry.phone, entry.postcode,
    entry.childCount, entry.childAges, entry.allergy, entry.diet,
    entry.usuallyPacks, entry.dailySpend, entry.canteenFrequency,
    entry.childLikes, entry.weeklyBudget, entry.notes, entry.ineligibleReasons,
  ];
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });
}
*/

// ─────────────────────────────────────────────
// NOTION ADAPTER
// Setup steps:
//  1. Go to notion.so/my-integrations → create an integration → copy the token
//  2. Create a Notion database with these properties:
//     Name (title), Email (email), Phone (phone), Postcode (text),
//     Status (select: Beta / Waitlist), Children (number), Ages (text),
//     Allergies (text), Diet (text), Usually Packs (text), Daily Spend (text),
//     Canteen Frequency (text), Child Likes (text), Weekly Budget (text),
//     Notes (text), Ineligible Reasons (text), Submitted At (date)
//  3. Open the database page → Share → Invite your integration
//  4. Copy the database ID from the URL (the part after notion.so/ before the ?)
//  5. Set NOTION_TOKEN and NOTION_DATABASE_ID in .env
//  6. Run: npm install @notionhq/client
//  7. Uncomment the block below
// ─────────────────────────────────────────────
/*
const { Client } = require('@notionhq/client');

async function addToNotion(entry) {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  await notion.pages.create({
    parent: { database_id: process.env.NOTION_DATABASE_ID },
    properties: {
      'Name':               { title:        [{ text: { content: entry.name } }] },
      'Email':              { email:        entry.email },
      'Phone':              { phone_number: entry.phone },
      'Postcode':           { rich_text:    [{ text: { content: entry.postcode } }] },
      'Status':             { select:       { name: entry.status } },
      'Children':           { number:       entry.childCount },
      'Ages':               { rich_text:    [{ text: { content: entry.childAges } }] },
      'Allergies':          { rich_text:    [{ text: { content: entry.allergy } }] },
      'Diet':               { rich_text:    [{ text: { content: entry.diet } }] },
      'Usually Packs':      { rich_text:    [{ text: { content: entry.usuallyPacks } }] },
      'Daily Spend':        { rich_text:    [{ text: { content: entry.dailySpend } }] },
      'Canteen Frequency':  { rich_text:    [{ text: { content: entry.canteenFrequency } }] },
      'Child Likes':        { rich_text:    [{ text: { content: entry.childLikes } }] },
      'Weekly Budget':      { rich_text:    [{ text: { content: entry.weeklyBudget } }] },
      'Notes':              { rich_text:    [{ text: { content: entry.notes } }] },
      'Ineligible Reasons': { rich_text:    [{ text: { content: entry.ineligibleReasons } }] },
      'Submitted At':       { date:         { start: new Date().toISOString() } },
    },
  });
}
*/

// ─────────────────────────────────────────────
// SUBMISSION ENDPOINT
// ─────────────────────────────────────────────
app.post('/api/submit', async (req, res) => {
  const entry = req.body;

  console.log(`\n[${new Date().toLocaleString('en-AU')}] New ${entry.status} submission`);
  console.log(`  Name: ${entry.name}  |  Email: ${entry.email}  |  Postcode: ${entry.postcode}`);

  try {
    // Uncomment whichever adapter you configured above:
    // await appendToGoogleSheet(entry);
    // await addToNotion(entry);

    res.json({ ok: true });
  } catch (err) {
    console.error('Database write failed:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`The Lunch Club → http://localhost:${PORT}`);
});
