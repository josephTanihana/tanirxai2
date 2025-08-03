const express = require('express');
const router = express.Router();

// Comprehensive language database
const languages = {
    javascript: {
        name: 'JavaScript',
        extensions: ['.js', '.jsx', '.mjs'],
        frameworks: ['React', 'Vue', 'Angular', 'Node.js', 'Express'],
        buildTools: ['Webpack', 'Vite', 'Parcel'],
        platforms: ['web', 'desktop', 'mobile', 'server']
    },
    python: {
        name: 'Python',
        extensions: ['.py', '.pyw', '.pyx'],
        frameworks: ['Django', 'Flask', 'FastAPI', 'PyTorch', 'TensorFlow'],
        buildTools: ['PyInstaller', 'cx_Freeze', 'py2exe'],
        platforms: ['web', 'desktop', 'mobile', 'server', 'ai']
    },
    java: {
        name: 'Java',
        extensions: ['.java', '.class', '.jar'],
        frameworks: ['Spring', 'Hibernate', 'Android SDK'],
        buildTools: ['Maven', 'Gradle', 'Ant'],
        platforms: ['web', 'desktop', 'mobile', 'server']
    },
    csharp: {
        name: 'C#',
        extensions: ['.cs', '.csproj'],
        frameworks: ['.NET', 'ASP.NET', 'Unity', 'Xamarin'],
        buildTools: ['MSBuild', 'dotnet'],
        platforms: ['web', 'desktop', 'mobile', 'server']
    },
    cpp: {
        name: 'C++',
        extensions: ['.cpp', '.cc', '.cxx', '.h', '.hpp'],
        frameworks: ['Qt', 'Boost', 'STL'],
        buildTools: ['CMake', 'Make', 'Visual Studio'],
        platforms: ['desktop', 'mobile', 'server', 'embedded']
    },
    rust: {
        name: 'Rust',
        extensions: ['.rs', '.rlib'],
        frameworks: ['Actix', 'Rocket', 'Tokio'],
        buildTools: ['Cargo'],
        platforms: ['web', 'desktop', 'mobile', 'server', 'embedded']
    },
    go: {
        name: 'Go',
        extensions: ['.go'],
        frameworks: ['Gin', 'Echo', 'Fiber'],
        buildTools: ['go build'],
        platforms: ['web', 'desktop', 'mobile', 'server']
    },
    swift: {
        name: 'Swift',
        extensions: ['.swift'],
        frameworks: ['UIKit', 'SwiftUI', 'Combine'],
        buildTools: ['Xcode', 'Swift Package Manager'],
        platforms: ['mobile', 'desktop', 'server']
    },
    kotlin: {
        name: 'Kotlin',
        extensions: ['.kt', '.kts'],
        frameworks: ['Android SDK', 'Spring', 'Ktor'],
        buildTools: ['Gradle', 'Maven'],
        platforms: ['mobile', 'web', 'server']
    },
    dart: {
        name: 'Dart',
        extensions: ['.dart'],
        frameworks: ['Flutter'],
        buildTools: ['flutter build'],
        platforms: ['mobile', 'web', 'desktop']
    }
};

// Get all languages
router.get('/', (req, res) => {
    res.json({
        success: true,
        totalLanguages: Object.keys(languages).length,
        languages: Object.entries(languages).map(([key, info]) => ({
            key,
            ...info
        }))
    });
});

// Get specific language
router.get('/:language', (req, res) => {
    const { language } = req.params;
    const langInfo = languages[language.toLowerCase()];

    if (!langInfo) {
        return res.status(404).json({
            error: 'Language not found',
            availableLanguages: Object.keys(languages)
        });
    }

    res.json({
        success: true,
        language: {
            key: language.toLowerCase(),
            ...langInfo
        }
    });
});

// Get language frameworks
router.get('/:language/frameworks', (req, res) => {
    const { language } = req.params;
    const langInfo = languages[language.toLowerCase()];

    if (!langInfo) {
        return res.status(404).json({
            error: 'Language not found'
        });
    }

    res.json({
        success: true,
        language: language.toLowerCase(),
        frameworks: langInfo.frameworks
    });
});

// Get language build tools
router.get('/:language/build-tools', (req, res) => {
    const { language } = req.params;
    const langInfo = languages[language.toLowerCase()];

    if (!langInfo) {
        return res.status(404).json({
            error: 'Language not found'
        });
    }

    res.json({
        success: true,
        language: language.toLowerCase(),
        buildTools: langInfo.buildTools
    });
});

// Get language platforms
router.get('/:language/platforms', (req, res) => {
    const { language } = req.params;
    const langInfo = languages[language.toLowerCase()];

    if (!langInfo) {
        return res.status(404).json({
            error: 'Language not found'
        });
    }

    res.json({
        success: true,
        language: language.toLowerCase(),
        platforms: langInfo.platforms
    });
});

module.exports = router; 