// --- Global Data Structures (SIMPLIFIED) ---
const tabs = [
    { id: 'MSStoreLegacy', name: 'MS Store (Legacy)', csv: './csv/MSStoreLegacy.csv' },
    { id: 'MSStore', name: 'MS Store', csv: './csv/MSStore.csv' },
    { id: 'WinPlayer', name: 'Windows Player', csv: './csv/WinPlayer.csv' },
    { id: 'WinStudio', name: 'Windows Studio', csv: './csv/WinStudio.csv' },
    // { id: 'MacPlayer', name: 'Mac Player', csv: './csv/MacPlayer.csv' },
    // { id: 'MacStudio', name: 'Mac Studio', csv: './csv/MacStudio.csv' },
    { id: 'RCCService', name: 'RCC Service', csv: './csv/RCCService.csv' },
];

// --- Tab Management Functions ---
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('bg-gray-800', 'border-b-2', 'border-blue-500', 'text-white');
        btn.classList.add('bg-gray-900', 'text-gray-400');
    });
    
    const activeBtn = document.getElementById('btn-' + tabId);
    activeBtn.classList.remove('bg-gray-900', 'text-gray-400');
    activeBtn.classList.add('bg-gray-800', 'border-b-2', 'border-blue-500', 'text-white');
}

// --- CSV Parsing Function ---
function parseCSV(csv) {
    const rows = [];
    let currentRow = [];
    let currentFieldChars = [];
    let insideQuotes = false;
    
    for (let i = 0; i < csv.length; i++) {
        const char = csv[i];
        const nextChar = csv[i + 1];
        
        if (char === '"' && insideQuotes && nextChar === '"') {
            currentFieldChars.push('"');
            i++; // skip escaped quote
        } else if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            currentRow.push(currentFieldChars.join(''));
            currentFieldChars = [];
        } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !insideQuotes) {
            if (char === '\r') i++; // skip \n after \r
            currentRow.push(currentFieldChars.join(''));
            rows.push(currentRow);
            currentRow = [];
            currentFieldChars = [];
        } else {
            currentFieldChars.push(char);
        }
    }
    
    // Add the last field and row if needed
    if (currentFieldChars.length > 0 || currentRow.length > 0) {
        currentRow.push(currentFieldChars.join(''));
        rows.push(currentRow);
    }
    
    return rows;
}

// --- iOS/MSStore Table Generation (Original generateTable, renamed for clarity) ---
// This function handles the CSV format for MSStoreLegacy/MSStore (which appears to use iOS formatting logic)
function generateTable(csv) {
    const rows = parseCSV(csv).slice(1); // Skip the header row
    // Expected number of columns for iOS:
    const MIN_COLUMNS = 5; 
    
    let html = `<table class="min-w-full bg-gray-800 border border-gray-700 rounded-b-lg">
      <thead>
        <tr class="text-left border-b border-gray-700">
          <th class="p-3">Version</th>
          <th class="p-3">Engine Version</th>
          <th class="p-3">Release Date</th>
          <th class="p-3">Info</th>
          <th class="p-3 text-center">Download</th>
        </tr>
      </thead>
      <tbody>`;
    
    for (const row of rows) {
        // FIX: Check if the row has enough elements to avoid destructuring 'link' as undefined
        if (row.length < MIN_COLUMNS) {
            console.warn("Skipping incomplete row:", row);
            continue; // Skip this row if it doesn't have the expected columns
        }

        const [version, versionCode, releaseDate, notes, link] = row;
        // versionCode = Engine Version
        html += `
        <tr class="border-b border-gray-700">
          <td class="p-3">${version}</td>
          <td class="p-3">${versionCode}</td>
          <td class="p-3">${releaseDate}</td>
          <td class="p-3">${notes}</td>
          ${link.trim() !== "" ? `
          <td class="p-3 text-center">
            <a target="_blank" rel="noopener noreferrer" href="${link.trim()}" class="group inline-flex items-center justify-center rounded-lg" onclick="openModal('download-modal', '${link.trim()}')">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" class="w-6 h-6 group-hover:text-gray-300 transition">
                <path d="M15 1C14.448 1 14 1.448 14 2V6H16V2C16 1.448 15.552 1 15 1ZM16 6V18.586L18.293 16.293C18.684 15.902 19.316 15.902 19.707 16.293C20.098 16.684 20.098 17.316 19.707 17.707L15.707 21.707C15.512 21.902 15.256 22 15 22C14.744 22 14.488 21.902 14.293 21.707L10.293 17.707C9.902 17.316 9.902 16.684 10.293 16.293C10.684 15.902 11.316 15.902 11.707 16.293L14 18.586V6H6C4.895 6 4 6.895 4 8V25C4 26.105 4.895 27 6 27H24C25.105 27 26 26.105 26 25V8C26 6.895 25.105 6 24 6H16Z" fill="currentColor"/>
              </svg>
            </a>
            </td>` : ''}
        </tr>`;
    }
    
    html += `</tbody></table>`;
    return html;
}

// --- Window Onload (REMOVED UPLOAD SUBMIT LISTENER) ---
window.onload = async () => {
    
    await createTabs();
    
    // NOTE: initializeFileUpload() is kept for general file-handling UI
    // even though the submit listener is removed.
    initializeFileUpload();
    
    // REMOVED: document.getElementById('upload-form').addEventListener('submit', async (e) => {...})
    // The entire block of code that handles the file upload via XMLHttpRequest is gone.
};

// --- createTabs (REMOVED UPLOAD BUTTON) ---
async function createTabs() {
    
    // Dynamically create the tabs container
    const tabsContainer = document.getElementById('tabs');
    tabsContainer.innerHTML = ''; // Clear any existing content

    const tabsContentContainer = document.getElementById('tabsContent');
    tabsContentContainer.innerHTML = ''; // Clear any existing content

    // Use the main 'tabs' array directly
    for (const [index, tab] of tabs.entries()) {

        const button = document.createElement('button');
        button.id = `btn-tab-${tab.id}`;
        button.className = `tab-button px-4 py-2 ${
            index === 0 ? 'bg-gray-800 border-b-2 border-blue-500 text-white' : 'bg-gray-900 text-gray-400'
        } rounded-t-lg`;
        button.textContent = tab.name;
        button.onclick = () => showTab(`tab-${tab.id}`);
        tabsContainer.appendChild(button);

        const tabDiv = document.createElement('div');
        tabDiv.setAttribute('id', `tab-${tab.id}`);
        tabDiv.classList.add('tab-content');
        if (index !== 0) {
            tabDiv.classList.add('hidden');
        }
        tabsContentContainer.appendChild(tabDiv);
    }

    // Load content for each tab in the background
    for (const tab of tabs) {
        try {
            const content = await fetch(tab.csv).then((r) => {
                if (!r.ok) throw new Error(`Failed to load ${tab.csv}`);
                return r.text();
            });

            const tabDiv = document.getElementById(`tab-${tab.id}`);
            // Always use the non-Android table generation function
            tabDiv.innerHTML = generateTable(content); 
        } catch (error) {
            console.error(`Error loading CSV for tab ${tab.id}:`, error);
            const tabDiv = document.getElementById(`tab-${tab.id}`);
            tabDiv.innerHTML = `<p class="text-red-500 text-center">Failed to load data for this tab.</p>`;
        }
    }

    // REMOVED: Upload button creation and appending
}

// --- Modals and Downloads ---
function openModal(modalId, url, metadata = {}) {
    const modal = document.getElementById(modalId);

    const downloadLink = modal.querySelector('.download-again-link');
    if (url && downloadLink) {
        downloadLink.href = url; // Set the URL for the link
    }

    if (sessionStorage.getItem(modalId + '-dontshowagain') === 'true') return;

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
        modal.querySelector('div').classList.remove('scale-95');
        modal.querySelector('div').classList.add('scale-100');
    }, 10); // Small delay to allow transition to apply
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    modal.querySelector('div').classList.remove('scale-100');
    modal.querySelector('div').classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 200);
    
    const dontShowAgain = modal.querySelector('.dont-show-again-checkbox');
    if (dontShowAgain && dontShowAgain.checked) {
        sessionStorage.setItem(modalId + '-dontshowagain', 'true');
    }
}

async function downloadFile(url, onProgress) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download ${url}`);

    const reader = response.body.getReader();
    const contentLength = parseInt(response.headers.get('Content-Length'), 10);
    let receivedLength = 0;
    const chunks = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedLength += value.length;

        if (onProgress && contentLength) {
            const progress = (receivedLength / contentLength) * 100;
            onProgress(progress);
        }
    }

    return new Blob(chunks);
}

// --- File Upload Initialization ---
function initializeFileUpload() {
    const fileInput = document.getElementById('file-input');
    const fileDropArea = document.getElementById('file-drop-area');
    const fileNameDisplay = document.getElementById('file-name');
    const additionalFields = document.getElementById('additional-fields');
    
    fileDropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropArea.classList.add('bg-gray-600');
    });
    
    fileDropArea.addEventListener('dragleave', () => {
        fileDropArea.classList.remove('bg-gray-600');
    });
    
    fileDropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropArea.classList.remove('bg-gray-600');
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileChosen(file);
        }
    });
    
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            handleFileChosen(file);
        }
    });
    
    async function handleFileChosen(file) {
        const fileInput = document.getElementById('file-input');
        const fileDropArea = document.getElementById('file-drop-area');
        const fileNameDisplay = document.getElementById('file-name');
        const additionalFields = document.getElementById('additional-fields');
        
        fileInput.disabled = true;
        fileDropArea.classList.add('hidden');
        fileNameDisplay.textContent = `Selected file: ${file.name}`;
        fileNameDisplay.classList.remove('hidden');
        additionalFields.classList.remove('hidden');
        setTimeout(() => {
            additionalFields.classList.add('opacity-100', 'scale-100');
            additionalFields.classList.remove('opacity-0', 'scale-95');
        }, 10); // Trigger transition
        
        // The original code was incomplete here, but the file-handling UI logic is maintained.
    }
}
