const admin = require("firebase-admin");
const initializeSettings = require("./index");
const firebaseJson = require('./firebase.json');

const initFirebase = async () => {
  try {
    await initializeSettings;
    admin.initializeApp({
      credential: admin.credential.cert(firebaseJson),
    });
    console.log("Firebase Admin SDK initialized successfully");
    return admin;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    throw error;
  }
};

module.exports = initFirebase();
