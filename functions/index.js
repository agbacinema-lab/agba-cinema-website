const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

/**
 * Triggered when a brand makes an internship request.
 * Sends notification to Super Admin.
 */
exports.onInternshipRequestCreated = functions.firestore
    .document('internship_requests/{requestId}')
    .onCreate(async (snap, context) => {
        const request = snap.data();
        const brandId = request.brandId;
        const studentId = request.studentId;

        // Fetch brand and student data
        const brandSnap = await admin.firestore().collection('brands').doc(brandId).get();
        const studentSnap = await admin.firestore().collection('students').doc(studentId).get();
        
        const brandData = brandSnap.data();
        const studentData = studentSnap.data();

        console.log(`Brand ${brandData.companyName} requested student ${studentData.fullName}`);

        // Email logic would go here using a service like SendGrid or Nodemailer
        // For now, we log the event.
        return null;
    });

/**
 * Triggered when a student is promoted to "Internship Ready".
 * Notifies the student.
 */
exports.onStudentStatusUpdated = functions.firestore
    .document('students/{studentId}')
    .onUpdate(async (change, context) => {
        const newValue = change.after.data();
        const previousValue = change.before.data();

        if (newValue.status === 'internship_ready' && previousValue.status !== 'internship_ready') {
            const userSnap = await admin.firestore().collection('users').doc(newValue.userId).get();
            const userData = userSnap.data();
            
            console.log(`Student ${userData.name} is now Internship Ready!`);
            // Email student here
        }
        return null;
    });
