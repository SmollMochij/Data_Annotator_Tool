// Include your application JavaScript code here

let active = 30;
let done = 6;
const ctx = document.getElementById('myChart');
const doughData = {
    labels: ['Active', 'Done'],
    datasets: [{
        data: [30, 6],
        backgroundColor: [
            'rgba(120,118,210,1)',
            'rgba(135,226,92,1)',
        ],
        borderColor: [
            'rgba(120,118,210,1)',
            'rgba(135,226,92,1)',
        ],
        spacing: 5,
    }],
};
const doughOptions = {
    cutout: '60%',
    plugins: {
        legend: {
            display: false,
        }
    },
    scales: {
        y: {
            display: false
        }
    },
}
new Chart(ctx, {
    type: 'doughnut',
    data: doughData,
    options: doughOptions,
});

// Firebase Configuration and Data Fetching Code
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";

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
const database = getDatabase(app);

// Reference to the path in your database where annotators are stored
const annotatorsRef = ref(database, 'annotators/');

// Get the data and update the UI
onValue(annotatorsRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    updateAnnotatorList(data);
  }
});

function updateAnnotatorList(annotators) {
  const listContainer = document.querySelector('.list-container');
  listContainer.innerHTML = ''; // Clear the existing list
  
  for (const key in annotators) {
    const annotator = annotators[key];
    const listItem = document.createElement('li');
    listItem.className = 'list-item';
    
    const img = document.createElement('img');
    img.src = annotator.imageURL;
    img.alt = annotator.name;
    
    const span = document.createElement('span');
    span.textContent = annotator.name;
    
    listItem.appendChild(img);
    listItem.appendChild(span);
    listContainer.appendChild(listItem);
  }
}
