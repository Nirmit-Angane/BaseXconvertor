// ============================================
// Constants and Configuration
// ============================================
const BASE_NAMES = {
    '2': 'Binary',
    '8': 'Octal',
    '10': 'Decimal',
    '16': 'Hexadecimal'
};

const BASE_REGEX = {
    '2': /^[01]+$/,
    '8': /^[0-7]+$/,
    '10': /^[0-9]+$/,
    '16': /^[0-9A-Fa-f]+$/
};

const CODE_TYPES = {
    binary: 'Binary',
    gray: 'Gray Code',
    bcd: 'BCD',
    excess3: 'Excess-3'
};

// ============================================
// State Management
// ============================================
const state = {
    conversionHistory: [],
    currentCodeType: 'binary',
    totalConversions: 0,
    theme: 'light'
};

// ============================================
// DOM Elements
// ============================================
const elements = {
    // Navigation
    navbar: document.getElementById('navbar'),
    navLinks: document.querySelectorAll('.nav-link'),
    mobileToggle: document.getElementById('mobileToggle'),
    navLinksContainer: document.getElementById('navLinks'),
    
    // Theme
    themeToggle: document.getElementById('themeToggle'),
    
    // Number Converter
    inputNumber: document.getElementById('inputNumber'),
    inputBase: document.getElementById('inputBase'),
    outputBase: document.getElementById('outputBase'),
    result: document.getElementById('result'),
    convertBtn: document.getElementById('convertBtn'),
    swapBtn: document.getElementById('swapBtn'),
    clearBtn: document.getElementById('clearBtn'),
    copyBtn: document.getElementById('copyBtn'),
    shareBtn: document.getElementById('shareBtn'),
    pasteBtn: document.getElementById('pasteBtn'),
    inputError: document.getElementById('inputError'),
    fromBaseName: document.getElementById('fromBaseName'),
    toBaseName: document.getElementById('toBaseName'),
    batchResults: document.getElementById('batchResults'),
    
    // Export
    downloadTxt: document.getElementById('downloadTxt'),
    downloadCsv: document.getElementById('downloadCsv'),
    downloadJson: document.getElementById('downloadJson'),
    
    // Code Converter
    codeTypeBtns: document.querySelectorAll('.code-type-btn'),
    codeInput: document.getElementById('codeInput'),
    codeError: document.getElementById('codeError'),
    convertCodeBtn: document.getElementById('convertCodeBtn'),
    codeResults: document.getElementById('codeResults'),
    
    // History
    historyList: document.getElementById('historyList'),
    clearHistory: document.getElementById('clearHistory'),
    
    // Calculator
    calcToggle: document.getElementById('calcToggle'),
    calcDock: document.getElementById('calcDock'),
    calcClose: document.getElementById('calcClose'),
    calcDisplay: document.getElementById('calcDisplay'),
    calcButtons: document.querySelectorAll('.calc-btn'),
    
    // Stats
    totalConversions: document.getElementById('totalConversions'),
    
    // Toast
    toast: document.getElementById('toast')
};

// ============================================
// Utility Functions
// ============================================

/**
 * Show toast notification
 */
function showToast(message, duration = 3000) {
    const toast = elements.toast;
    // Defensive: if toast element is not present, avoid throwing and fallback to console
    if (!toast) {
        // eslint-disable-next-line no-console
        console.warn('Toast element not found. Message:', message);
        return;
    }
    const toastMessage = toast.querySelector('.toast-message');
    if (toastMessage) toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

/**
 * Validate input based on number base
 */
function validateInput(value, base) {
    const trimmedValue = value.trim();
    if (!trimmedValue) return false;
    return BASE_REGEX[base].test(trimmedValue);
}

/**
 * Show error message
 */
function showError(element, message) {
    const errorElement = element === elements.inputNumber ? elements.inputError : elements.codeError;
    errorElement.textContent = message;
    errorElement.classList.add('show');
    element.classList.add('error');
}

/**
 * Hide error message
 */
function hideError(element) {
    const errorElement = element === elements.inputNumber ? elements.inputError : elements.codeError;
    errorElement.classList.remove('show');
    element.classList.remove('error');
}

/**
 * Update conversion counter
 */
function updateConversionCounter() {
    state.totalConversions++;
    elements.totalConversions.textContent = state.totalConversions;
    
    // Animate counter
    elements.totalConversions.style.transform = 'scale(1.2)';
    setTimeout(() => {
        elements.totalConversions.style.transform = 'scale(1)';
    }, 200);
}

/**
 * Download file
 */
function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
}

/**
 * Format timestamp
 */
function formatTimestamp(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// ============================================
// Theme Management
// ============================================

/**
 * Initialize theme
 */
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    state.theme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
}

/**
 * Toggle theme
 */
function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);
    updateThemeIcon();
    showToast(`${state.theme === 'dark' ? 'Dark' : 'Light'} mode activated`);
}

/**
 * Update theme icon
 */
function updateThemeIcon() {
    const icon = elements.themeToggle.querySelector('.theme-icon');
    icon.textContent = state.theme === 'dark' ? '☀️' : '🌙';
}

// ============================================
// Navigation
// ============================================

/**
 * Handle smooth scroll navigation
 */
function handleNavigation(e) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href');
    if (!targetId || targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        const offsetTop = targetElement.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
        
        // Update active link
        elements.navLinks.forEach(link => link.classList.remove('active'));
        e.target.classList.add('active');
        
        // Close mobile menu
        elements.navLinksContainer.classList.remove('active');
    }
}

/**
 * Toggle mobile menu
 */
function toggleMobileMenu() {
    elements.navLinksContainer.classList.toggle('active');
}

/**
 * Handle scroll effects
 */
function handleScroll() {
    if (window.scrollY > 50) {
        elements.navbar.classList.add('scrolled');
    } else {
        elements.navbar.classList.remove('scrolled');
    }
}

// ============================================
// Number Converter Functions
// ============================================

/**
 * Update base names display
 */
function updateBaseNames() {
    elements.fromBaseName.textContent = BASE_NAMES[elements.inputBase.value];
    elements.toBaseName.textContent = BASE_NAMES[elements.outputBase.value];
}

/**
 * Convert single number
 */
function convertSingleNumber(input, fromBase, toBase) {
    try {
        const decimal = parseInt(input, fromBase);
        if (isNaN(decimal)) {
            throw new Error('Invalid number');
        }
        return decimal.toString(toBase).toUpperCase();
    } catch (error) {
        throw new Error('Conversion failed');
    }
}

/**
 * Convert number(s)
 */
function convertNumber() {
    const input = elements.inputNumber.value.trim();
    const fromBase = elements.inputBase.value;
    const toBase = elements.outputBase.value;
    
    if (!input) {
        showError(elements.inputNumber, 'Please enter a number');
        return;
    }
    
    // Check for batch conversion
    if (input.includes(',')) {
        convertBatch(input, fromBase, toBase);
        return;
    }
    
    // Validate single input
    if (!validateInput(input, fromBase)) {
        showError(elements.inputNumber, `Invalid ${BASE_NAMES[fromBase]} number`);
        return;
    }
    
    try {
        const converted = convertSingleNumber(input, fromBase, toBase);
        elements.result.textContent = converted;
        elements.batchResults.innerHTML = '';
        hideError(elements.inputNumber);
        
        // Add to history
        addToHistory({
            input: input,
            fromBase: BASE_NAMES[fromBase],
            toBase: BASE_NAMES[toBase],
            result: converted,
            timestamp: new Date()
        });
        
        updateConversionCounter();
        showToast('Conversion successful!');
    } catch (error) {
        showError(elements.inputNumber, 'Conversion failed');
    }
}

/**
 * Convert batch numbers
 */
function convertBatch(input, fromBase, toBase) {
    const numbers = input.split(',').map(n => n.trim()).filter(n => n);
    let html = '<h3>Batch Results:</h3>';
    let validCount = 0;
    let results = [];
    
    numbers.forEach(num => {
        if (validateInput(num, fromBase)) {
            try {
                const converted = convertSingleNumber(num, fromBase, toBase);
                results.push({
                    input: num,
                    output: converted,
                    valid: true
                });
                validCount++;
            } catch (error) {
                results.push({
                    input: num,
                    output: 'Error',
                    valid: false
                });
            }
        } else {
            results.push({
                input: num,
                output: 'Invalid',
                valid: false
            });
        }
    });
    
    // Display results
    results.forEach(item => {
        const borderColor = item.valid ? 'var(--primary-color)' : 'var(--error-color)';
        html += `
            <div class="batch-item" style="border-left-color: ${borderColor}">
                <span>${item.input} (${BASE_NAMES[fromBase]})</span>
                <span style="color: ${item.valid ? 'var(--primary-color)' : 'var(--error-color)'}">
                    <strong>${item.output}${item.valid ? ' (' + BASE_NAMES[toBase] + ')' : ''}</strong>
                </span>
            </div>
        `;
    });
    
    elements.batchResults.innerHTML = html;
    elements.result.textContent = `${validCount} of ${numbers.length} converted successfully`;
    hideError(elements.inputNumber);
    
    if (validCount > 0) {
        updateConversionCounter();
        showToast(`Batch conversion complete: ${validCount}/${numbers.length} successful`);
    }
}

/**
 * Swap bases
 */
function swapBases() {
    const tempBase = elements.inputBase.value;
    elements.inputBase.value = elements.outputBase.value;
    elements.outputBase.value = tempBase;
    updateBaseNames();
    
    // If there's a result, use it as new input
    if (elements.result.textContent && elements.result.textContent !== 'Ready to convert...') {
        elements.inputNumber.value = elements.result.textContent;
        convertNumber();
    }
    
    showToast('Bases swapped!');
}

/**
 * Clear inputs
 */
function clearInputs() {
    elements.inputNumber.value = '';
    elements.result.textContent = 'Ready to convert...';
    elements.batchResults.innerHTML = '';
    hideError(elements.inputNumber);
}

/**
 * Copy result to clipboard
 */
async function copyResult() {
    const text = elements.result.textContent;
    if (text === 'Ready to convert...') {
        showToast('Nothing to copy!');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
        
        // Visual feedback
        elements.copyBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            elements.copyBtn.style.transform = 'scale(1)';
        }, 200);
    } catch (error) {
        showToast('Failed to copy');
    }
}

/**
 * Share result
 */
async function shareResult() {
    const text = elements.result.textContent;
    if (text === 'Ready to convert...') {
        showToast('Nothing to share!');
        return;
    }
    
    const shareText = `${elements.inputNumber.value} (${BASE_NAMES[elements.inputBase.value]}) = ${text} (${BASE_NAMES[elements.outputBase.value]})`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Number Conversion Result',
                text: shareText
            });
            showToast('Shared successfully!');
        } catch (error) {
            if (error.name !== 'AbortError') {
                copyResult();
            }
        }
    } else {
        await copyResult();
    }
}

/**
 * Paste from clipboard
 */
async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        elements.inputNumber.value = text;
        showToast('Pasted from clipboard!');
    } catch (error) {
        showToast('Failed to paste');
    }
}

// ============================================
// History Management
// ============================================

/**
 * Add to history
 */
function addToHistory(item) {
    state.conversionHistory.unshift(item);
    
    // Keep only last 50 conversions
    if (state.conversionHistory.length > 50) {
        state.conversionHistory.pop();
    }
    
    updateHistoryDisplay();
    saveHistoryToLocalStorage();
}

/**
 * Update history display
 */
function updateHistoryDisplay() {
    if (state.conversionHistory.length === 0) {
        elements.historyList.innerHTML = `
            <div class="history-empty">
                <div class="empty-icon">📭</div>
                <div class="empty-text">No conversions yet</div>
                <div class="empty-subtext">Start converting numbers above to see your history here!</div>
            </div>
        `;
        return;
    }
    
    elements.historyList.innerHTML = state.conversionHistory.map((item, index) => `
        <div class="history-item" style="animation-delay: ${index * 0.05}s">
            <div>
                <strong>${item.input}</strong> (${item.fromBase}) → 
                <strong style="color: var(--primary-color)">${item.result}</strong> (${item.toBase})
                <br>
                <small style="color: var(--text-tertiary)">${formatTimestamp(item.timestamp)}</small>
            </div>
        </div>
    `).join('');
}

/**
 * Clear history
 */
function clearHistoryData() {
    // Defensive: ensure history list element exists
    if (!elements.historyList) {
        console.warn('History list element not found.');
        return;
    }

    if (state.conversionHistory.length === 0) {
        showToast('History is already empty!');
        return;
    }

    if (confirm('Are you sure you want to clear all conversion history?')) {
        state.conversionHistory = [];

        // Clear UI immediately
        updateHistoryDisplay();
        state.totalConversions = 0;
        if (elements.totalConversions) elements.totalConversions.textContent = state.totalConversions;

        // Remove saved history from localStorage to ensure persistence
        try {
            localStorage.removeItem('conversionHistory');
        } catch (err) {
            console.error('Failed to remove conversionHistory from localStorage', err);
        }

        showToast('History cleared!');
    }
}

/**
 * Save history to localStorage
 */
function saveHistoryToLocalStorage() {
    try {
        localStorage.setItem('conversionHistory', JSON.stringify(state.conversionHistory));
    } catch (error) {
        console.error('Failed to save history:', error);
    }
}

/**
 * Load history from localStorage
 */
function loadHistoryFromLocalStorage() {
    try {
        const saved = localStorage.getItem('conversionHistory');
        if (saved) {
            state.conversionHistory = JSON.parse(saved).map(item => ({
                ...item,
                timestamp: new Date(item.timestamp)
            }));
            updateHistoryDisplay();
            state.totalConversions = state.conversionHistory.length;
            elements.totalConversions.textContent = state.totalConversions;
        }
    } catch (error) {
        console.error('Failed to load history:', error);
    }
}

// ============================================
// Export Functions
// ============================================

/**
 * Download as TXT
 */
function downloadAsTxt() {
    if (state.conversionHistory.length === 0) {
        showToast('No history to download!');
        return;
    }
    
    const content = state.conversionHistory.map(item => 
        `${item.input} (${item.fromBase}) → ${item.result} (${item.toBase}) - ${formatTimestamp(item.timestamp)}`
    ).join('\n');
    
    downloadFile(content, 'conversion-history.txt', 'text/plain');
}

/**
 * Download as CSV
 */
function downloadAsCsv() {
    if (state.conversionHistory.length === 0) {
        showToast('No history to download!');
        return;
    }
    
    const headers = 'Input,From Base,Result,To Base,Timestamp\n';
    const rows = state.conversionHistory.map(item => 
        `"${item.input}","${item.fromBase}","${item.result}","${item.toBase}","${formatTimestamp(item.timestamp)}"`
    ).join('\n');
    
    downloadFile(headers + rows, 'conversion-history.csv', 'text/csv');
}

/**
 * Download as JSON
 */
function downloadAsJson() {
    if (state.conversionHistory.length === 0) {
        showToast('No history to download!');
        return;
    }
    
    const data = JSON.stringify(state.conversionHistory, null, 2);
    downloadFile(data, 'conversion-history.json', 'application/json');
}

// ============================================
// Code Converter Functions
// ============================================

/**
 * Binary to Gray Code
 */
function binaryToGray(binary) {
    let gray = binary[0];
    for (let i = 1; i < binary.length; i++) {
        gray += (parseInt(binary[i - 1]) ^ parseInt(binary[i])).toString();
    }
    return gray;
}

/**
 * Gray Code to Binary
 */
function grayToBinary(gray) {
    let binary = gray[0];
    for (let i = 1; i < gray.length; i++) {
        binary += (parseInt(binary[i - 1]) ^ parseInt(gray[i])).toString();
    }
    return binary;
}

/**
 * Binary to Excess-3
 */
function binaryToExcess3(binary) {
    const decimal = parseInt(binary, 2);
    return (decimal + 3).toString(2).padStart(Math.max(4, binary.length), '0');
}

/**
 * Excess-3 to Binary
 */
function excess3ToBinary(excess3) {
    const decimal = parseInt(excess3, 2);
    const result = decimal - 3;
    return result >= 0 ? result.toString(2) : '0';
}

/**
 * Decimal to BCD
 */
function decimalToBCD(decimal) {
    return decimal.toString()
        .split('')
        .map(digit => parseInt(digit, 10).toString(2).padStart(4, '0'))
        .join('');
}

/**
 * BCD to Decimal
 */
function BCDToDecimal(bcd) {
    // Pad to make length divisible by 4
    while (bcd.length % 4 !== 0) {
        bcd = '0' + bcd;
    }
    const chunks = bcd.match(/.{1,4}/g);
    return chunks ? chunks.map(chunk => parseInt(chunk, 2)).join('') : '0';
}

/**
 * Select code type
 */
function selectCodeType(type) {
    state.currentCodeType = type;
    
    // Update UI
    elements.codeTypeBtns.forEach(btn => {
        if (btn.dataset.type === type) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    elements.codeInput.placeholder = `Enter ${CODE_TYPES[type]} code...`;
}

/**
 * Convert code
 */
function convertCode() {
    const type = state.currentCodeType;
    const input = elements.codeInput.value.trim();
    
    if (!input) {
        showError(elements.codeInput, 'Please enter a code');
        return;
    }
    
    if (!/^[01]+$/.test(input)) {
        showError(elements.codeInput, 'Only binary digits (0 and 1) are allowed');
        return;
    }
    
    try {
        let results = {};
        
        switch (type) {
            case 'binary':
                const gray = binaryToGray(input);
                const decimal = parseInt(input, 2);
                const bcd = decimalToBCD(decimal);
                const excess3 = binaryToExcess3(input);
                results = {
                    'Gray Code': gray,
                    'Decimal': decimal.toString(),
                    'BCD': bcd,
                    'Excess-3': excess3
                };
                break;
                
            case 'gray':
                const binary = grayToBinary(input);
                const dec2 = parseInt(binary, 2);
                const bcd2 = decimalToBCD(dec2);
                const exc2 = binaryToExcess3(binary);
                results = {
                    'Binary': binary,
                    'Decimal': dec2.toString(),
                    'BCD': bcd2,
                    'Excess-3': exc2
                };
                break;
                
            case 'bcd':
                const decimal3 = BCDToDecimal(input);
                const binary3 = parseInt(decimal3, 10).toString(2);
                const gray3 = binaryToGray(binary3);
                const excess33 = binaryToExcess3(binary3);
                results = {
                    'Binary': binary3,
                    'Decimal': decimal3,
                    'Gray Code': gray3,
                    'Excess-3': excess33
                };
                break;
                
            case 'excess3':
                const binary4 = excess3ToBinary(input);
                const decimal4 = parseInt(binary4, 2);
                const gray4 = binaryToGray(binary4);
                const bcd4 = decimalToBCD(decimal4);
                results = {
                    'Binary': binary4,
                    'Decimal': decimal4.toString(),
                    'Gray Code': gray4,
                    'BCD': bcd4
                };
                break;
        }
        
        displayCodeResults(results);
        hideError(elements.codeInput);
        updateConversionCounter();
        showToast('Code conversion successful!');
    } catch (error) {
        showError(elements.codeInput, 'Conversion failed. Check your input.');
    }
}

/**
 * Display code results
 */
function displayCodeResults(results) {
    elements.codeResults.innerHTML = Object.entries(results).map(([label, value]) => `
        <div class="code-result-item">
            <div class="code-result-label">${label}</div>
            <div class="code-result-value">${value}</div>
        </div>
    `).join('');
}

// ============================================
// Calculator Functions
// ============================================

let calcValue = '';

/**
 * Toggle calculator
 */
function toggleCalculator() {
    elements.calcDock.classList.toggle('open');
}

/**
 * Close calculator
 */
function closeCalculator() {
    elements.calcDock.classList.remove('open');
}

/**
 * Handle calculator button click
 */
function handleCalcButton(value) {
    if (value === 'C') {
        calcValue = '';
        elements.calcDisplay.textContent = '0';
    } else if (value === '=') {
        try {
            calcValue = eval(calcValue).toString();
            elements.calcDisplay.textContent = calcValue;
        } catch {
            elements.calcDisplay.textContent = 'Error';
            calcValue = '';
        }
    } else {
        calcValue += value;
        elements.calcDisplay.textContent = calcValue;
    }
}

/**
 * Handle calculator keyboard input
 */
function handleCalcKeyboard(e) {
    if (!elements.calcDock.classList.contains('open')) return;
    
    const key = e.key;
    
    if (/[0-9+\-*\/.]/.test(key)) {
        handleCalcButton(key);
    } else if (key === 'Enter') {
        e.preventDefault();
        handleCalcButton('=');
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        handleCalcButton('C');
    } else if (key === 'Backspace') {
        calcValue = calcValue.slice(0, -1);
        elements.calcDisplay.textContent = calcValue || '0';
    }
}

// ============================================
// Event Listeners
// ============================================

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Theme
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    elements.mobileToggle.addEventListener('click', toggleMobileMenu);
    window.addEventListener('scroll', handleScroll);
    
    // Number Converter
    elements.convertBtn.addEventListener('click', convertNumber);
    elements.swapBtn.addEventListener('click', swapBases);
    elements.clearBtn.addEventListener('click', clearInputs);
    elements.copyBtn.addEventListener('click', copyResult);
    elements.shareBtn.addEventListener('click', shareResult);
    elements.pasteBtn.addEventListener('click', pasteFromClipboard);
    elements.inputBase.addEventListener('change', updateBaseNames);
    elements.outputBase.addEventListener('change', updateBaseNames);
    elements.inputNumber.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') convertNumber();
    });
    
    // Export
    elements.downloadTxt.addEventListener('click', downloadAsTxt);
    elements.downloadCsv.addEventListener('click', downloadAsCsv);
    elements.downloadJson.addEventListener('click', downloadAsJson);
    
    // Code Converter
    elements.codeTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => selectCodeType(btn.dataset.type));
    });
    elements.convertCodeBtn.addEventListener('click', convertCode);
    elements.codeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') convertCode();
    });
    
    // History
    if (elements.clearHistory) {
        elements.clearHistory.addEventListener('click', clearHistoryData);
    } else {
        console.warn('clearHistory button not found; clear history handler not attached.');
    }
    
    // Calculator
    elements.calcToggle.addEventListener('click', toggleCalculator);
    elements.calcClose.addEventListener('click', closeCalculator);
    elements.calcButtons.forEach(btn => {
        btn.addEventListener('click', () => handleCalcButton(btn.dataset.value));
    });
    document.addEventListener('keydown', handleCalcKeyboard);
}

// ============================================
// Initialization
// ============================================

/**
 * Initialize application
 */
function init() {
    console.log('🔢 BaseXconvertor - Initializing...');
    
    // Initialize theme
    initTheme();
    
    // Initialize base names
    updateBaseNames();
    
    // Load history
    loadHistoryFromLocalStorage();
    
    // Initialize event listeners
    initEventListeners();
    
    // Set initial code type
    selectCodeType('binary');
    
    console.log('✅ BaseXconvertor - Ready!');
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}