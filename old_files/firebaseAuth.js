// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";
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

// Fetch users from the backend
async function fetchUsers() {
    try {
        const response = await fetch('/users');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const users = await response.json();
        const userList = document.getElementById('user-list');

        userList.innerHTML = ''; // Clear the list

        users.forEach(user => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-item');

            const image = document.createElement('img');
            image.src = user.photoURL || 'https://via.placeholder.com/50'; // Default placeholder image
            image.alt = user.displayName || 'No name';
            image.style.width = '50px';
            image.style.height = '50px';
            image.style.borderRadius = '50%';

            const name = document.createElement('span');
            name.textContent = user.displayName || 'No name';

            listItem.appendChild(image);
            listItem.appendChild(name);
            userList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Call fetchUsers when the page loads
document.addEventListener('DOMContentLoaded', fetchUsers);

// Export functions for use in other files
export { signIn, signOut, auth };