import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
// We need 'query' and 'where' to filter the list
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// YOUR API KEYS
const firebaseConfig = {
    apiKey: "AIzaSyDmmZr7FuJV39cK_9WqabqS26doV04USgE",
    authDomain: "hemosync-765c9.firebaseapp.com",
    databaseURL: "https://hemosync-765c9-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "hemosync-765c9",
    storageBucket: "hemosync-765c9.firebasestorage.app",
    messagingSenderId: "749126382362",
    appId: "1:749126382362:web:8852a1e895edbbea3072a3",
    measurementId: "G-JP1Y2S1LN5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const eventsList = document.getElementById('eventsList');
const loadingMsg = document.getElementById('loadingMessage');

// 1. Check Auth & Load Data
onAuthStateChanged(auth, async (user) => {
    if (user) {
        loadOrganiserEvents(user.uid);
    } else {
        window.location.href = "index.html";
    }
});

async function loadOrganiserEvents(uid) {
    try {
        // SRS Requirement: Query database for events managed by THIS specific organiser
        const q = query(collection(db, "events"), where("organiserId", "==", uid));
        const querySnapshot = await getDocs(q);

        loadingMsg.style.display = "none"; // Hide loading text

        if (querySnapshot.empty) {
            eventsList.innerHTML = `
                <div style="text-align:center; padding: 20px; animation: fadeIn 0.5s;">
                    <i class="fa-regular fa-calendar-xmark" style="font-size: 40px; color: #ddd; margin-bottom: 10px;"></i>
                    <p style="color: #666;">No events found.</p>
                    <button class="btn-login" style="margin-top:10px; font-size: 12px; padding: 10px 20px;" onclick="window.location.href='create_event.html'">Create One</button>
                </div>`;
            return;
        }

        // Loop through each event found in the database
        let index = 0;
        querySnapshot.forEach((doc) => {
            const event = doc.data();
            const eventId = doc.id; // We need this ID to edit/manage later
            
            // ANIMATION LOGIC: Calculate delay based on index (0s, 0.1s, 0.2s...)
            const delay = index * 0.1;
            
            // Create HTML card for the event
            const eventCard = `
                <div class="status-card" style="display:block; margin-bottom: 15px; border-left: 5px solid #D32F2F; 
                     opacity: 0; animation: fadeInUp 0.5s ease forwards; animation-delay: ${delay}s; transition: transform 0.2s;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <h3 style="color: #333; margin-bottom: 5px;">${event.venue}</h3>
                            <p style="font-size: 13px; color: #666;">
                                <i class="fa-regular fa-calendar"></i> ${event.date} &nbsp;|&nbsp; 
                                <i class="fa-regular fa-clock"></i> ${event.time}
                            </p>
                            <p style="font-size: 12px; color: #D32F2F; margin-top:5px;">
                                <strong>${event.availableSlots}</strong> slots remaining
                            </p>
                        </div>
                        <div style="text-align:right;">
                            <span style="background:#e8f5e9; color:#2e7d32; padding: 4px 8px; border-radius:10px; font-size:10px; font-weight:bold;">
                                ${event.status}
                            </span>
                            <br><br>
                            <button onclick="alert('Manage Event ID: ${eventId}')" style="background:none; border:none; color:#D32F2F; cursor:pointer; font-size: 16px; transition: transform 0.2s;">
                                <i class="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Add the new card to the list
            eventsList.innerHTML += eventCard;
            index++; // Increment index for next card's delay
        });

    } catch (error) {
        console.error("Error loading events:", error);
        loadingMsg.innerHTML = `<span style="color:red">Error loading data. Check console.</span>`;
    }
}