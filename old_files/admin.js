const admin = require('firebase-admin');
const express = require('express');
const app = express();
const port = 5500; // or any port you prefer

// Initialize Firebase Admin SDK
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.get('/users', async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers();
    res.json(listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Unknown',
      photoURL: user.photoURL || 'https://via.placeholder.com/50'
    })));
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).send('Error fetching users');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
