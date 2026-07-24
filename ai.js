document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // 1. PDF.JS WORKER SETUP
    // ---------------------------------------------------------
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

    // ---------------------------------------------------------
    // 2. DOM ELEMENTS
    // ---------------------------------------------------------
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    
    const trainerToggleBtn = document.getElementById('trainerToggleBtn');
    const trainerPanel = document.getElementById('trainerPanel');
    const closeTrainer = document.getElementById('closeTrainer');
    const adminKeyInput = document.getElementById('adminKeyInput');
    const trainQuestionInput = document.getElementById('trainQuestionInput');
    const trainAnswerInput = document.getElementById('trainAnswerInput');
    const trainSubmitBtn = document.getElementById('trainSubmitBtn');
    const fileUploadInput = document.getElementById('fileUploadInput');
    const trainFileBtn = document.getElementById('trainFileBtn');
    const trainerStatus = document.getElementById('trainerStatus');
    const trainedList = document.getElementById('trainedList');

    const OWNER_SECRET_KEY = "ani2007";

    // ---------------------------------------------------------
    // 3. HELPER FUNCTIONS (Randomizer & Regex Matcher)
    // ---------------------------------------------------------
    function getRandomResponse(responsesArray) {
        if (!responsesArray || responsesArray.length === 0) return "Yes, Sir/Ma'am.";
        const randomIndex = Math.floor(Math.random() * responsesArray.length);
        return responsesArray[randomIndex];
    }

    function checkKeywordsMatch(query, keywordsArray) {
        if (!keywordsArray) return false;
        for (let kw of keywordsArray) {
            const regex = new RegExp('\\b' + kw + '\\b', 'i');
            if (regex.test(query)) {
                return true;
            }
        }
        return false;
    }

    // ---------------------------------------------------------
   // ---------------------------------------------------------
// 4. INDEXEDDB MEMORY MANAGEMENT (Replaces LocalStorage)
// ---------------------------------------------------------
const DB_NAME = "A5lystDatabase";
const DB_VERSION = 1;
let db = null;

// Database Initialize karne ka function
function initDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            // Q&A Store ke liye table/object store
            if (!database.objectStoreNames.contains('trained_memory')) {
                database.createObjectStore('trained_memory', { keyPath: 'id' });
            }
            // Document chunks ke liye table/object store
            if (!database.objectStoreNames.contains('doc_memory')) {
                database.createObjectStore('doc_memory', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// Saara Custom Q&A Data laane ke liye (Async)
async function getTrainedMemory() {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['trained_memory'], 'readonly');
        const store = transaction.objectStore('trained_memory');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

// Saara Document Memory Data laane ke liye (Async)
async function getDocMemory() {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['doc_memory'], 'readonly');
        const store = transaction.objectStore('doc_memory');
        const request = store.getAll();

        request.onsuccess = () => {
            // Kyunki pehle chunks string the, hum unhe map kar lenge
            const results = request.result || [];
            resolve(results.map(item => item.chunk));
        };
        request.onerror = () => reject(request.error);
    });
}

// Q&A Save karne ke liye
async function saveTrainedMemory(question, answer) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['trained_memory'], 'readwrite');
        const store = transaction.objectStore('trained_memory');
        const item = { id: Date.now(), question, response: answer };
        const request = store.put(item);

        request.onsuccess = () => {
            renderTrainedList();
            resolve();
        };
        request.onerror = () => reject(request.error);
    });
}

// Document Chunk Save karne ke liye
async function saveDocChunk(chunkText) {
    const database = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(['doc_memory'], 'readwrite');
        const store = transaction.objectStore('doc_memory');
        const request = store.add({ chunk: chunkText });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Brain Console me list render karne wala function (Updated for Async)
async function renderTrainedList() {
    if (!trainedList) return;
    const memory = await getTrainedMemory();
    trainedList.innerHTML = '';
    
    if (memory.length === 0) {
        trainedList.innerHTML = '<p style="font-size: 0.8rem; color: #888;">No custom data available in IndexedDB, Sir/Ma\'am.</p>';
        return;
    }
    
    memory.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'trained-item';
        div.innerHTML = `
            <div class="trained-item-info">
                <strong>Q: ${item.question}</strong>
                <span>A: ${item.response}</span>
            </div>
            <button class="delete-q-btn" data-id="${item.id}">X</button>
        `;
        trainedList.appendChild(div);
    });
    
    document.querySelectorAll('.delete-q-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = Number(e.target.getAttribute('data-id'));
            const database = await initDB();
            const transaction = database.transaction(['trained_memory'], 'readwrite');
            const store = transaction.objectStore('trained_memory');
            store.delete(id);
            transaction.oncomplete = () => {
                renderTrainedList();
            };
        });
    });
}
    // ---------------------------------------------------------
    // 5. PDF & TEXT FILE READER ENGINE
    // ---------------------------------------------------------
    async function processFile(file) {
        if (file.type === "application/pdf" && typeof pdfjsLib !== 'undefined') {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map(item => item.str).join(" ") + " ";
            }
            return fullText;
        } else {
            return await file.text();
        }
    }

    if (trainFileBtn) {
        trainFileBtn.addEventListener('click', async () => {
            const key = adminKeyInput ? adminKeyInput.value.trim() : "";
            const file = fileUploadInput && fileUploadInput.files ? fileUploadInput.files[0] : null;

            if (key !== OWNER_SECRET_KEY) {
                if (trainerStatus) {
                    trainerStatus.textContent = 'Authorization Failed. Only Mr. Anirudh has clearance.';
                    trainerStatus.style.color = 'red';
                }
                return;
            }
            if (!file) {
                if (trainerStatus) {
                    trainerStatus.textContent = 'Please select a valid Text or PDF document, Sir.';
                    trainerStatus.style.color = 'red';
                }
                return;
            }

            if (trainerStatus) {
                trainerStatus.style.color = '#eab308';
                trainerStatus.textContent = `Processing document (${file.name}), Sir...`;
            }

            try {
                const text = await processFile(file);
                const chunks = text.split(/(?<=\.)\s+/); 
                
                chunks.forEach(chunk => {
                    if(chunk.trim().length > 10) saveDocChunk(chunk.trim());
                });

                if (trainerStatus) {
                    trainerStatus.style.color = 'var(--success-color)';
                    trainerStatus.textContent = `Success, Sir! Contents of ${file.name} integrated.`;
                }
                if (fileUploadInput) fileUploadInput.value = "";
            } catch (err) {
                if (trainerStatus) {
                    trainerStatus.style.color = 'red';
                    trainerStatus.textContent = 'Error reading file, Sir. Please try again.';
                }
            }
        });
    }

    // ---------------------------------------------------------
// 6. CORE AI RESPONSE ENGINE (IndexedDB + External API Fallback)
async function generateA5Response(userQuery) {
    const cleanQuery = userQuery.toLowerCase().trim();
    const userWords = cleanQuery.split(/\s+/);

    // Priority 1: Exact Custom Q&A from IndexedDB
    const customMemory = await getTrainedMemory();
    for (let item of customMemory) {
        if (cleanQuery.includes(item.question.toLowerCase())) {
            return `Sir/Ma'am, as per my training: ${item.response}`;
        }
    }

    // Priority 2: Talk.js Knowledge Base
    if (window.talkKnowledge && Array.isArray(window.talkKnowledge)) {
        for (let item of window.talkKnowledge) {
            if (checkKeywordsMatch(cleanQuery, item.keywords)) {
                if (Array.isArray(item.responses)) {
                    return getRandomResponse(item.responses);
                } else if (item.response) {
                    return `Yes, Sir/Ma'am. ${item.response}`;
                }
            }
        }
    }

    // Priority 3: Deep Search inside IndexedDB Uploaded Documents
    const docMemory = await getDocMemory();
    let bestDocMatch = null;
    let highestDocScore = 0;

    for (let chunk of docMemory) {
        let score = 0;
        let chunkLower = chunk.toLowerCase();
        for (let word of userWords) {
            if (word.length > 3 && chunkLower.includes(word)) score++;
        }
        if (score > highestDocScore) {
            highestDocScore = score;
            bestDocMatch = chunk;
        }
    }

    if (highestDocScore >= 1 && bestDocMatch) {
        return `Sir/Ma'am, based on the documents provided to me:\n\n"${bestDocMatch}"`;
    }

    // --- PRIORITY 4: EXTERNAL AI API FALLBACK ---
    // Agar local database me kuch nahi mila, toh yahan external AI se jawab mangwayenge
    try {
        const externalReply = await fetchExternalAIResponse(userQuery);
        if (externalReply) {
            return `Sir/Ma'am, ${externalReply}`;
        }
    } catch (error) {
        console.error("External API Error:", error);
    }

    // Final Fallback Responses agar API bhi fail ho jaye
    const fallbackResponses = [
        "I apologize, Sir/Ma'am, but I do not have specific information regarding your query right now.",
        "I am sorry, Sir/Ma'am, my database does not contain the answer to that yet. Please feel free to ask something else.",
        "Forgive me, Sir/Ma'am, I am continuously learning. How else may I assist you today?"
    ];
    
    return getRandomResponse(fallbackResponses);
}

// Helper Function jo external AI API se connect karega
async function fetchExternalAIResponse(prompt) {
    const API_KEY = ""; // Jaise Gemini ya OpenAI ki key
    
    // Example using Google Gemini API endpoint structure:
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: `Answer this query professionally, acknowledging the user politely: ${prompt}` }]
            }]
        })
    });

    const data = await response.json();
    if (data && data.candidates && data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text;
    }
    return null;
}

    // ---------------------------------------------------------
    // 7. CHAT UI HANDLERS
    // ---------------------------------------------------------
    function appendMessage(text, sender) {
        if (!chatMessages) return;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'assistant-message');
        
        const bubble = document.createElement('div');
        bubble.classList.add('message-bubble');
        bubble.style.whiteSpace = 'pre-line';
        bubble.textContent = text;
        
        messageDiv.appendChild(bubble);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function handleSendMessage() {
    if (!userInput) return;
    const text = userInput.value.trim();
    if (!text) return;
    
    appendMessage(text, 'user');
    userInput.value = '';
    
    const randomDelay = Math.floor(Math.random() * 500) + 400;
    setTimeout(async () => {
        const reply = await generateA5Response(text); // <-- Yahan await lagaya gaya hai
        appendMessage(reply, 'assistant');
    }, randomDelay);
}


    if (sendBtn) {
        sendBtn.addEventListener('click', handleSendMessage);
    }
    
    if (userInput) {
        userInput.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage(); 
            }
        });
    }

    // ---------------------------------------------------------
    // 8. TRAINER PANEL TOGGLES
    // ---------------------------------------------------------
    if (trainerToggleBtn && trainerPanel) {
        trainerToggleBtn.addEventListener('click', () => { 
            trainerPanel.classList.remove('hidden'); 
            renderTrainedList(); 
        });
    }
    
    if (closeTrainer && trainerPanel) {
        closeTrainer.addEventListener('click', () => { 
            trainerPanel.classList.add('hidden'); 
            if (trainerStatus) trainerStatus.textContent = ''; 
        });
    }

    if (trainSubmitBtn) {
        trainSubmitBtn.addEventListener('click', () => {
            const key = adminKeyInput ? adminKeyInput.value.trim() : "";
            const q = trainQuestionInput ? trainQuestionInput.value.trim() : "";
            const a = trainAnswerInput ? trainAnswerInput.value.trim() : "";
            
            if (key !== OWNER_SECRET_KEY) { 
                if (trainerStatus) {
                    trainerStatus.textContent = 'Authorization Failed, Sir. Invalid credentials.'; 
                    trainerStatus.style.color = 'red'; 
                }
                return; 
            }
            
            if (!q || !a) { 
                if (trainerStatus) {
                    trainerStatus.textContent = 'Sir, please fill both Question and Answer fields.'; 
                    trainerStatus.style.color = 'red'; 
                }
                return; 
            }
            
            saveTrainedMemory(q, a);
            if (trainerStatus) {
                trainerStatus.style.color = 'var(--success-color)';
                trainerStatus.textContent = 'Data successfully injected into memory, Sir!';
            }
            
            if (trainQuestionInput) trainQuestionInput.value = ''; 
            if (trainAnswerInput) trainAnswerInput.value = '';
        });
    }
});
