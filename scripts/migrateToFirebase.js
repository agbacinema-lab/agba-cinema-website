const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// You need to download your service account key from Firebase Console
// Project Settings -> Service Accounts -> Generate new private key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateData() {
  // Migrate Blog
  const blogData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/blog.json'), 'utf8'));
  for (const post of blogData) {
    const { id, ...postWithoutId } = post;
    await db.collection('posts').add({
      ...postWithoutId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Migrated blog post: ${post.title}`);
  }

  // Migrate Portfolio
  const portfolioData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/portfolio.json'), 'utf8'));
  for (const item of portfolioData) {
    const { id, ...itemWithoutId } = item;
    await db.collection('portfolio').add({
      ...itemWithoutId,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Migrated portfolio item: ${item.title}`);
  }

  console.log('Migration completed successfully!');
}

migrateData().catch(console.error);
