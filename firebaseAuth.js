// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
// Remove this if not using analytics
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDsAD7cYKC7boqne9MLZ2y7b9AANgWk5OE",
    authDomain: "data-annotator-tool.firebaseapp.com",
    databaseURL: "https://data-annotator-tool-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "data-annotator-tool",
    storageBucket: "data-annotator-tool.appspot.com",
    messagingSenderId: "913657972954",
    appId: "1:913657972954:web:94e337e257d3452d7f3de3",
    measurementId: "G-RWJF94GG05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Remove if not using analytics
const analytics = getAnalytics(app);
const auth = getAuth(app);  // Initialize Firebase Authentication

// Initialize Firebase Database
const db = getDatabase(app); // Initialize Firebase Realtime Database

// Authentication functions
function signIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

function signOut() {
    return firebaseSignOut(auth);
}

// Monitor auth state
onAuthStateChanged(auth, user => {
    if (user) {
        console.log('User is signed in:', user);
        // Additional logic for signed-in user
    } else {
        console.log('No user is signed in.');
        // Redirect to sign-in page or show sign-in UI
    }
});

// Fetch annotators from Firebase Realtime Database
async function fetchAnnotatorsFromFirebase() {
    try {
        const annotatorsRef = ref(db, 'annotators'); // Reference to the annotators node in the database
        const snapshot = await get(annotatorsRef);

        if (snapshot.exists()) {
            const annotators = snapshot.val();
            const dropdownMenu = document.querySelector('.dropdown-menu');  // Target the dropdown menu here

            dropdownMenu.innerHTML = ''; // Clear the dropdown before populating

            Object.keys(annotators).forEach(annotatorId => {
                const annotator = annotators[annotatorId];

                const dropdownItem = document.createElement('a');  // Create an anchor tag for each annotator
                dropdownItem.classList.add('dropdown-item');  // Add the class needed for Bootstrap styling
                dropdownItem.href = '#';  // You can customize this if you want to navigate somewhere on click
                dropdownItem.textContent = annotator.name || 'No name';

                dropdownMenu.appendChild(dropdownItem);  // Add the item to the dropdown
            });
        } else {
            console.log("No annotators found.");
        }
    } catch (error) {
        console.error('Error fetching annotators from Firebase:', error);
    }
}

// Call fetchAnnotatorsFromFirebase when the page loads
document.addEventListener('DOMContentLoaded', fetchAnnotatorsFromFirebase);


// Export functions for use in other files
export { signIn, signOut, auth };
