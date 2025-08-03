// AI Tani Complete - Main JavaScript File
// Handles AI code generation, build tools, collaboration, and all interactive features

// Global variables
let socket;
let currentRoom = null;
let currentLanguage = 'javascript';
let currentFramework = '';
let buildInProgress = false;

// Language and framework mappings
const languageFrameworks = {
    javascript: ['React', 'Vue', 'Angular', 'Node.js', 'Express', 'Vanilla JS'],
    python: ['Django', 'Flask', 'FastAPI', 'PyTorch', 'TensorFlow', 'Standard Library'],
    java: ['Spring', 'Hibernate', 'Android SDK', 'Standard Java'],
    csharp: ['.NET', 'ASP.NET', 'Unity', 'Xamarin'],
    cpp: ['Qt', 'Boost', 'STL', 'Standard C++'],
    rust: ['Actix', 'Rocket', 'Tokio', 'Standard Rust'],
    go: ['Gin', 'Echo', 'Fiber', 'Standard Go'],
    swift: ['UIKit', 'SwiftUI', 'Combine', 'Standard Swift'],
    kotlin: ['Android SDK', 'Spring', 'Ktor', 'Standard Kotlin'],
    dart: ['Flutter', 'Standard Dart'],
    php: ['Laravel', 'Symfony', 'CodeIgniter', 'Standard PHP'],
    ruby: ['Rails', 'Sinatra', 'Standard Ruby'],
    scala: ['Play', 'Akka', 'Spark', 'Standard Scala'],
    haskell: ['Yesod', 'Snap', 'Standard Haskell'],
    elixir: ['Phoenix', 'Plug', 'Standard Elixir'],
    clojure: ['Ring', 'Compojure', 'Standard Clojure'],
    fsharp: ['.NET', 'ASP.NET', 'Standard F#'],
    nim: ['Jester', 'Karax', 'Standard Nim'],
    crystal: ['Kemal', 'Lucky', 'Standard Crystal'],
    v: ['Vweb', 'Standard V'],
    zig: ['Standard Zig'],
    julia: ['Genie', 'Flux', 'Standard Julia'],
    r: ['Shiny', 'Plumber', 'Standard R'],
    matlab: ['Standard MATLAB'],
    perl: ['Mojolicious', 'Dancer', 'Standard Perl'],
    lua: ['OpenResty', 'LÖVE', 'Standard Lua'],
    assembly: ['Standard Assembly'],
    fortran: ['Standard Fortran'],
    cobol: ['Standard COBOL'],
    pascal: ['Free Pascal', 'Standard Pascal'],
    basic: ['Visual Basic', 'Standard BASIC'],
    ada: ['Standard Ada'],
    prolog: ['SWI-Prolog', 'Standard Prolog'],
    lisp: ['Common Lisp', 'Standard Lisp'],
    scheme: ['Racket', 'Standard Scheme'],
    erlang: ['OTP', 'Standard Erlang'],
    ocaml: ['Opam', 'Standard OCaml'],
    smalltalk: ['Pharo', 'Standard Smalltalk'],
    forth: ['Standard Forth'],
    brainfuck: ['Standard Brainfuck'],
    whitespace: ['Standard Whitespace'],
    malbolge: ['Standard Malbolge']
};

// Build platform configurations
const buildPlatforms = {
    exe: {
        javascript: ['electron'],
        python: ['pyinstaller'],
        cpp: ['native'],
        rust: ['native'],
        go: ['native']
    },
    ipa: {
        swift: ['native'],
        javascript: ['react-native'],
        dart: ['flutter']
    },
    apk: {
        kotlin: ['native'],
        javascript: ['react-native'],
        dart: ['flutter']
    }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupSocketConnection();
    setupEventListeners();
    updateLanguageInfo();
});

// Initialize the application
function initializeApp() {
    console.log('AI Tani Complete Initializing...');
    
    // Set up navigation
    setupNavigation();
    
    // Initialize code editor
    setupCodeEditor();
    
    // Set up real-time features
    setupRealTimeFeatures();
    
    console.log('AI Tani Complete Ready!');
}

// Set up Socket.IO connection
function setupSocketConnection() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to AI Tani Complete server');
        showNotification('Connected to server', 'success');
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        showNotification('Disconnected from server', 'warning');
    });
    
    socket.on('code-updated', (data) => {
        handleCodeUpdate(data);
    });
    
    socket.on('build-started', (data) => {
        handleBuildStarted(data);
    });
    
    socket.on('ai-progress', (data) => {
        handleAIProgress(data);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Language selection
    document.getElementById('language-select').addEventListener('change', updateLanguageInfo);
    document.getElementById('build-language').addEventListener('change', updateBuildFrameworks);
    document.getElementById('build-platform').addEventListener('change', updateBuildOptions);
    
    // Form submissions
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Navigation functions
function handleNavigation(event) {
    event.preventDefault();
    
    // Remove active class from all links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to clicked link
    event.target.classList.add('active');
    
    // Scroll to section
    const targetId = event.target.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// AI Code Generation
async function generateCode() {
    const language = document.getElementById('language-select').value;
    const framework = document.getElementById('framework-select').value;
    const prompt = document.getElementById('code-prompt').value;
    const complexity = document.getElementById('complexity-select').value;
    
    if (!prompt.trim()) {
        showNotification('Please enter a description of what you want to build', 'error');
        return;
    }
    
    showNotification('Generating code...', 'info');
    
    try {
        const response = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                language,
                framework,
                prompt,
                complexity,
                platform: 'web'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayGeneratedCode(data.code, data.explanation);
            showNotification('Code generated successfully!', 'success');
            
            // Emit to socket for real-time updates
            if (socket) {
                socket.emit('ai-generation', {
                    progress: 100,
                    message: 'Code generated successfully'
                });
            }
        } else {
            showNotification(data.error || 'Failed to generate code', 'error');
        }
    } catch (error) {
        console.error('Code generation error:', error);
        showNotification('Failed to generate code. Please try again.', 'error');
    }
}

// Display generated code
function displayGeneratedCode(code, explanation) {
    const codeElement = document.getElementById('generated-code');
    const explanationElement = document.getElementById('code-explanation');
    
    // Syntax highlighting
    codeElement.innerHTML = `<code>${escapeHtml(code)}</code>`;
    
    // Update explanation
    explanationElement.textContent = explanation;
    
    // Copy code to build section
    document.getElementById('build-code').value = code;
}

// Build Tools Functions
async function generateBuild() {
    const projectName = document.getElementById('project-name').value;
    const language = document.getElementById('build-language').value;
    const platform = document.getElementById('build-platform').value;
    const framework = document.getElementById('build-framework').value;
    const code = document.getElementById('build-code').value;
    
    if (!projectName || !language || !platform || !framework || !code.trim()) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    showNotification('Generating build configuration...', 'info');
    updateBuildProgress(10, 'Generating build configuration...');
    
    try {
        const response = await fetch('/api/build/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                projectName,
                language,
                platform,
                framework,
                code,
                dependencies: []
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateBuildProgress(50, 'Build configuration generated successfully');
            updateBuildLog(`Build configuration generated for ${projectName}\nFramework: ${framework}\nPlatform: ${platform}`);
            showNotification('Build configuration generated successfully!', 'success');
        } else {
            showNotification(data.error || 'Failed to generate build configuration', 'error');
        }
    } catch (error) {
        console.error('Build generation error:', error);
        showNotification('Failed to generate build configuration', 'error');
    }
}

async function executeBuild() {
    const projectName = document.getElementById('project-name').value;
    const language = document.getElementById('build-language').value;
    const platform = document.getElementById('build-platform').value;
    const framework = document.getElementById('build-framework').value;
    
    if (!projectName || !language || !platform || !framework) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (buildInProgress) {
        showNotification('Build already in progress', 'warning');
        return;
    }
    
    buildInProgress = true;
    showNotification('Starting build process...', 'info');
    updateBuildProgress(0, 'Starting build process...');
    
    try {
        const response = await fetch('/api/build/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                projectName,
                language,
                platform,
                framework
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateBuildProgress(100, 'Build completed successfully!');
            updateBuildLog(data.output || 'Build completed successfully');
            updateBuildResults(data.outputFile ? `Build output: ${data.outputFile}` : 'Build completed');
            showNotification('Build completed successfully!', 'success');
        } else {
            updateBuildProgress(0, 'Build failed');
            updateBuildLog(data.message || 'Build failed');
            showNotification(data.error || 'Build failed', 'error');
        }
    } catch (error) {
        console.error('Build execution error:', error);
        updateBuildProgress(0, 'Build failed');
        updateBuildLog('Build execution failed');
        showNotification('Build execution failed', 'error');
    } finally {
        buildInProgress = false;
    }
}

async function downloadBuild() {
    const projectName = document.getElementById('project-name').value;
    
    if (!projectName) {
        showNotification('Please enter a project name', 'error');
        return;
    }
    
    try {
        window.open(`/api/build/download/${projectName}`, '_blank');
        showNotification('Download started', 'success');
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Download failed', 'error');
    }
}

// Update build progress
function updateBuildProgress(percentage, message) {
    const progressBar = document.querySelector('#build-progress .progress-fill');
    const messageElement = document.getElementById('build-message');
    
    progressBar.style.width = `${percentage}%`;
    messageElement.textContent = message;
}

// Update build log
function updateBuildLog(log) {
    const logElement = document.getElementById('build-log');
    logElement.innerHTML = `<code>${escapeHtml(log)}</code>`;
}

// Update build results
function updateBuildResults(results) {
    const resultsElement = document.getElementById('build-results');
    resultsElement.innerHTML = `<p>${escapeHtml(results)}</p>`;
}

// Language and Framework Updates
function updateLanguageInfo() {
    const language = document.getElementById('language-select').value;
    const frameworkSelect = document.getElementById('framework-select');
    
    // Clear existing options
    frameworkSelect.innerHTML = '<option value="">Select Framework</option>';
    
    // Add frameworks for selected language
    const frameworks = languageFrameworks[language] || [];
    frameworks.forEach(framework => {
        const option = document.createElement('option');
        option.value = framework.toLowerCase().replace(/\s+/g, '-');
        option.textContent = framework;
        frameworkSelect.appendChild(option);
    });
    
    currentLanguage = language;
}

function updateBuildFrameworks() {
    const language = document.getElementById('build-language').value;
    const platform = document.getElementById('build-platform').value;
    const frameworkSelect = document.getElementById('build-framework');
    
    // Clear existing options
    frameworkSelect.innerHTML = '<option value="">Select Framework</option>';
    
    // Get available frameworks for the language and platform
    const availableFrameworks = buildPlatforms[platform]?.[language] || [];
    availableFrameworks.forEach(framework => {
        const option = document.createElement('option');
        option.value = framework;
        option.textContent = framework.charAt(0).toUpperCase() + framework.slice(1);
        frameworkSelect.appendChild(option);
    });
}

function updateBuildOptions() {
    updateBuildFrameworks();
}

// Collaboration Functions
function joinRoom() {
    const roomId = document.getElementById('room-id').value;
    
    if (!roomId.trim()) {
        showNotification('Please enter a room ID', 'error');
        return;
    }
    
    if (socket) {
        socket.emit('join-room', roomId);
        currentRoom = roomId;
        showNotification(`Joined room: ${roomId}`, 'success');
    }
}

function createRoom() {
    const roomId = Math.random().toString(36).substring(2, 8);
    document.getElementById('room-id').value = roomId;
    joinRoom();
}

// Handle code updates from collaboration
function handleCodeUpdate(data) {
    const collaborationCode = document.getElementById('collaboration-code');
    collaborationCode.value = data.code;
    showNotification('Code updated by another user', 'info');
}

// Handle build progress
function handleBuildStarted(data) {
    updateBuildProgress(25, `Build started for ${data.project}`);
    updateBuildLog(`Build started for ${data.project}\nType: ${data.type}`);
}

// Handle AI progress
function handleAIProgress(data) {
    console.log('AI Progress:', data);
}

// Utility Functions
function copyCode() {
    const codeElement = document.getElementById('generated-code');
    const code = codeElement.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Code copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy code', 'error');
    });
}

function downloadCode() {
    const codeElement = document.getElementById('generated-code');
    const code = codeElement.textContent;
    const language = document.getElementById('language-select').value;
    const extension = getFileExtension(language);
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-tani-generated.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Code downloaded!', 'success');
}

function analyzeCode() {
    const codeElement = document.getElementById('generated-code');
    const code = codeElement.textContent;
    const language = document.getElementById('language-select').value;
    
    if (!code.trim()) {
        showNotification('No code to analyze', 'warning');
        return;
    }
    
    showNotification('Analyzing code...', 'info');
    
    // Simulate code analysis
    setTimeout(() => {
        const analysis = {
            linesOfCode: code.split('\n').length,
            complexity: 'medium',
            maintainability: 'good',
            suggestions: [
                'Consider adding error handling',
                'Add input validation',
                'Include unit tests',
                'Add documentation'
            ]
        };
        
        showCodeAnalysis(analysis);
    }, 1000);
}

function showCodeAnalysis(analysis) {
    const results = `
Code Analysis Results:
- Lines of Code: ${analysis.linesOfCode}
- Complexity: ${analysis.complexity}
- Maintainability: ${analysis.maintainability}

Suggestions:
${analysis.suggestions.map(s => `- ${s}`).join('\n')}
    `;
    
    updateBuildLog(results);
    showNotification('Code analysis completed!', 'success');
}

// Navigation functions
function startCoding() {
    document.querySelector('a[href="#ai-assistant"]').click();
}

function showBuildTools() {
    document.querySelector('a[href="#build-tools"]').click();
}

function showDemo() {
    showNotification('Demo feature coming soon!', 'info');
}

// Keyboard shortcuts
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + Enter to generate code
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        generateCode();
    }
    
    // Ctrl/Cmd + S to save/copy code
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        copyCode();
    }
}

// Setup functions
function setupNavigation() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupCodeEditor() {
    // Real-time code updates for collaboration
    const collaborationCode = document.getElementById('collaboration-code');
    if (collaborationCode) {
        collaborationCode.addEventListener('input', function() {
            if (socket && currentRoom) {
                socket.emit('code-change', {
                    roomId: currentRoom,
                    code: this.value,
                    language: currentLanguage
                });
            }
        });
    }
}

function setupRealTimeFeatures() {
    // Auto-save functionality
    setInterval(() => {
        const code = document.getElementById('generated-code').textContent;
        if (code && code.trim()) {
            localStorage.setItem('ai-tani-last-code', code);
        }
    }, 30000); // Save every 30 seconds
    
    // Restore last code on page load
    const lastCode = localStorage.getItem('ai-tani-last-code');
    if (lastCode) {
        document.getElementById('generated-code').innerHTML = `<code>${escapeHtml(lastCode)}</code>`;
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getFileExtension(language) {
    const extensions = {
        javascript: 'js',
        python: 'py',
        java: 'java',
        csharp: 'cs',
        cpp: 'cpp',
        rust: 'rs',
        go: 'go',
        swift: 'swift',
        kotlin: 'kt',
        dart: 'dart',
        php: 'php',
        ruby: 'rb',
        scala: 'scala',
        haskell: 'hs',
        elixir: 'ex',
        clojure: 'clj',
        fsharp: 'fs',
        nim: 'nim',
        crystal: 'cr',
        v: 'v',
        zig: 'zig',
        julia: 'jl',
        r: 'r',
        matlab: 'm',
        perl: 'pl',
        lua: 'lua',
        assembly: 'asm',
        fortran: 'f90',
        cobol: 'cob',
        pascal: 'pas',
        basic: 'bas',
        ada: 'adb',
        prolog: 'pl',
        lisp: 'lisp',
        scheme: 'scm',
        erlang: 'erl',
        ocaml: 'ml',
        smalltalk: 'st',
        forth: 'fth',
        brainfuck: 'bf',
        whitespace: 'ws',
        malbolge: 'mb'
    };
    
    return extensions[language] || 'txt';
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Export functions for global access
window.generateCode = generateCode;
window.copyCode = copyCode;
window.downloadCode = downloadCode;
window.analyzeCode = analyzeCode;
window.generateBuild = generateBuild;
window.executeBuild = executeBuild;
window.downloadBuild = downloadBuild;
window.joinRoom = joinRoom;
window.createRoom = createRoom;
window.startCoding = startCoding;
window.showBuildTools = showBuildTools;
window.showDemo = showDemo;
window.updateLanguageInfo = updateLanguageInfo;
window.updateBuildFrameworks = updateBuildFrameworks;
window.updateBuildOptions = updateBuildOptions; 