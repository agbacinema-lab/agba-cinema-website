console.log("Checking ENV vars...")
console.log("FIREBASE_SERVICE_ACCOUNT exists?", !!process.env.FIREBASE_SERVICE_ACCOUNT)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
     const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8')
     console.log("Base64 decoding successful.")
     const json = JSON.parse(decoded)
     console.log("JSON parsing successful. Project ID:", json.project_id)
  } catch (e) {
     console.log("Base64/JSON failure. Trying raw JSON...")
     try {
       const json = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
       console.log("Raw JSON parsing successful. Project ID:", json.project_id)
     } catch (e2) {
       console.log("Raw JSON fails too.")
     }
  }
}
