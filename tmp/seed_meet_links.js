const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Locate service account in .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT=(.*)/);

if (!match) {
  console.error("FIREBASE_SERVICE_ACCOUNT not found in .env.local");
  process.exit(1);
}

let serviceAccountStr = match[1].trim();
let serviceAccount;

if (serviceAccountStr.startsWith('{')) {
  serviceAccount = JSON.parse(serviceAccountStr);
} else {
  serviceAccount = JSON.parse(Buffer.from(serviceAccountStr, 'base64').toString('utf8'));
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const links = [
  "https://meet.google.com/yiw-nwwv-ign",
  "https://meet.google.com/jvk-gsia-mzb",
  "https://meet.google.com/szz-rtcu-cpq",
  "https://meet.google.com/ujn-jtdt-nak",
  "https://meet.google.com/ajg-gnfw-mxg"
];

async function seed() {
  console.log("Seeding Meet Link Pool...");
  const poolCol = db.collection('meet_link_pool');

  // Clear existing (optional but cleaner for initial seed)
  const existing = await poolCol.get();
  for (const doc of existing.docs) {
    await doc.ref.delete();
  }

  for (const url of links) {
    await poolCol.add({
      url: url.trim(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Added: ${url}`);
  }

  console.log("Seed Complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
