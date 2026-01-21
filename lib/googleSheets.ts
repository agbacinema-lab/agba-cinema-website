
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Config variables
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Fix for newlines in env vars

export interface BookingData {
    reference: string;
    fullName: string;
    email: string;
    phone: string;
    service: string;
    amount: string;
    date: string;
    category: string;
    status: string;
}

export async function appendBookingToSheet(data: BookingData) {
    if (!SPREADSHEET_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
        console.warn("Google Sheets credentials not set. Skipping data append.");
        return false;
    }

    try {
        const serviceAccountAuth = new JWT({
            email: GOOGLE_CLIENT_EMAIL,
            key: GOOGLE_PRIVATE_KEY,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

        await doc.loadInfo(); // loads document properties and worksheets

        const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]

        // Check if headers exist, if not add them (optional, but good for first run)
        await sheet.setHeaderRow(['Date', 'Reference', 'Full Name', 'Email', 'Phone', 'Service', 'Category', 'Amount', 'Status']);

        await sheet.addRow({
            'Date': data.date,
            'Reference': data.reference,
            'Full Name': data.fullName,
            'Email': data.email,
            'Phone': data.phone,
            'Service': data.service,
            'Category': data.category,
            'Amount': data.amount,
            'Status': data.status
        });

        console.log(`Booking ${data.reference} appended to Google Sheet.`);
        return true;

    } catch (error) {
        console.error("Error appending to Google Sheet:", error);
        return false;
    }
}
