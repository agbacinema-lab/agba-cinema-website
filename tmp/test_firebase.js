require('dotenv').config({ path: '.env.local' });

console.log("Checking FIREBASE_SERVICE_ACCOUNT...");
const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!sa) {
    console.error("FIREBASE_SERVICE_ACCOUNT is NOT defined in .env.local");
    process.exit(1);
}

try {
    let serviceAccount;
    if (sa.trim().startsWith('{')) {
        console.log("Detected: Raw JSON");
        serviceAccount = JSON.parse(sa);
    } else {
        console.log("Detected: Base64");
        serviceAccount = JSON.parse(Buffer.from(sa, 'base64').toString('utf8'));
    }
    console.log("SUCCESS: JSON parsed correctly!");
    console.log("Project ID:", serviceAccount.project_id);
    console.log("Client Email:", serviceAccount.client_email);
} catch (e) {
    console.error("FAILURE: Parsing failed.");
    console.error(e.message);
}
