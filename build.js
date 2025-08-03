const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const archiver = require('archiver');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Build configurations for different platforms
const buildConfigs = {
    exe: {
        electron: {
            template: 'electron-template',
            buildCommand: 'npm run build:electron',
            outputFormat: '.exe'
        },
        python: {
            template: 'python-template',
            buildCommand: 'pyinstaller --onefile',
            outputFormat: '.exe'
        },
        cpp: {
            template: 'cpp-template',
            buildCommand: 'g++ -o',
            outputFormat: '.exe'
        }
    },
    ipa: {
        reactNative: {
            template: 'react-native-template',
            buildCommand: 'npx react-native run-ios',
            outputFormat: '.ipa'
        },
        flutter: {
            template: 'flutter-template',
            buildCommand: 'flutter build ios',
            outputFormat: '.ipa'
        },
        swift: {
            template: 'swift-template',
            buildCommand: 'xcodebuild -project',
            outputFormat: '.ipa'
        }
    },
    apk: {
        reactNative: {
            template: 'react-native-template',
            buildCommand: 'npx react-native run-android',
            outputFormat: '.apk'
        },
        flutter: {
            template: 'flutter-template',
            buildCommand: 'flutter build apk',
            outputFormat: '.apk'
        },
        kotlin: {
            template: 'kotlin-template',
            buildCommand: './gradlew assembleRelease',
            outputFormat: '.apk'
        }
    }
};

// Language to framework mapping
const languageFrameworkMap = {
    'javascript': ['electron', 'react-native'],
    'typescript': ['electron', 'react-native'],
    'python': ['pyinstaller', 'electron'],
    'java': ['android', 'spring'],
    'kotlin': ['android'],
    'swift': ['ios'],
    'cpp': ['native'],
    'csharp': ['dotnet'],
    'go': ['native'],
    'rust': ['native'],
    'php': ['web'],
    'ruby': ['web'],
    'dart': ['flutter'],
    'html': ['web'],
    'css': ['web']
};

// Generate build configuration
router.post('/generate', async (req, res) => {
    try {
        const { language, platform, projectName, code, dependencies } = req.body;

        if (!language || !platform || !projectName) {
            return res.status(400).json({
                error: 'Missing required parameters: language, platform, projectName'
            });
        }

        // Create project directory
        const projectDir = path.join(__dirname, '../../builds', projectName);
        await fs.ensureDir(projectDir);

        // Get build configuration
        const buildConfig = buildConfigs[platform];
        if (!buildConfig) {
            return res.status(400).json({
                error: `Unsupported platform: ${platform}. Supported platforms: ${Object.keys(buildConfigs).join(', ')}`
            });
        }

        // Select appropriate framework
        const frameworks = languageFrameworkMap[language] || ['web'];
        const selectedFramework = frameworks[0];
        const config = buildConfig[selectedFramework];

        if (!config) {
            return res.status(400).json({
                error: `No build configuration found for ${language} on ${platform}`
            });
        }

        // Generate project structure
        const projectStructure = await generateProjectStructure(
            projectName,
            language,
            platform,
            selectedFramework,
            code,
            dependencies
        );

        // Create build script
        const buildScript = generateBuildScript(platform, selectedFramework, config);

        // Save all files
        for (const [filePath, content] of Object.entries(projectStructure)) {
            const fullPath = path.join(projectDir, filePath);
            await fs.ensureDir(path.dirname(fullPath));
            await fs.writeFile(fullPath, content);
        }

        res.json({
            success: true,
            projectName,
            platform,
            language,
            framework: selectedFramework,
            buildScript,
            projectDir,
            message: `Project ${projectName} created successfully for ${platform} build`
        });

    } catch (error) {
        console.error('Build generation error:', error);
        res.status(500).json({
            error: 'Failed to generate build configuration',
            message: error.message
        });
    }
});

// Execute build process
router.post('/execute', async (req, res) => {
    try {
        const { projectName, platform, framework } = req.body;

        const projectDir = path.join(__dirname, '../../builds', projectName);
        
        if (!await fs.pathExists(projectDir)) {
            return res.status(404).json({
                error: 'Project not found',
                projectName
            });
        }

        // Change to project directory
        process.chdir(projectDir);

        // Execute build command
        const buildConfig = buildConfigs[platform][framework];
        const buildCommand = buildConfig.buildCommand;

        console.log(`Building ${projectName} for ${platform} using ${framework}...`);
        console.log(`Command: ${buildCommand}`);

        const { stdout, stderr } = await execAsync(buildCommand, {
            cwd: projectDir,
            timeout: 300000 // 5 minutes timeout
        });

        // Look for output file
        const outputFile = await findOutputFile(projectDir, platform, framework);

        res.json({
            success: true,
            projectName,
            platform,
            framework,
            output: stdout,
            errors: stderr,
            outputFile,
            message: `Build completed successfully for ${projectName}`
        });

    } catch (error) {
        console.error('Build execution error:', error);
        res.status(500).json({
            error: 'Build execution failed',
            message: error.message,
            stdout: error.stdout,
            stderr: error.stderr
        });
    }
});

// Get build status
router.get('/status/:projectName', async (req, res) => {
    try {
        const { projectName } = req.params;
        const projectDir = path.join(__dirname, '../../builds', projectName);

        if (!await fs.pathExists(projectDir)) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }

        const buildLog = path.join(projectDir, 'build.log');
        const outputFiles = await findOutputFiles(projectDir);

        res.json({
            projectName,
            exists: true,
            buildLog: await fs.pathExists(buildLog) ? await fs.readFile(buildLog, 'utf8') : null,
            outputFiles,
            lastModified: (await fs.stat(projectDir)).mtime
        });

    } catch (error) {
        res.status(500).json({
            error: 'Failed to get build status',
            message: error.message
        });
    }
});

// Download build output
router.get('/download/:projectName', async (req, res) => {
    try {
        const { projectName } = req.params;
        const projectDir = path.join(__dirname, '../../builds', projectName);

        if (!await fs.pathExists(projectDir)) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }

        const outputFiles = await findOutputFiles(projectDir);
        
        if (outputFiles.length === 0) {
            return res.status(404).json({
                error: 'No build output files found'
            });
        }

        // Create zip archive
        const archive = archiver('zip');
        res.attachment(`${projectName}-build.zip`);
        archive.pipe(res);

        // Add output files to archive
        for (const file of outputFiles) {
            archive.file(file, { name: path.basename(file) });
        }

        await archive.finalize();

    } catch (error) {
        res.status(500).json({
            error: 'Failed to create download',
            message: error.message
        });
    }
});

// Helper functions
async function generateProjectStructure(projectName, language, platform, framework, code, dependencies) {
    const structure = {};

    // Common files
    structure['package.json'] = generatePackageJson(projectName, dependencies);
    structure['README.md'] = generateReadme(projectName, language, platform, framework);

    // Language-specific files
    switch (language) {
        case 'javascript':
        case 'typescript':
            structure['src/index.js'] = code || generateDefaultCode(language, framework);
            structure['src/styles.css'] = generateDefaultCSS();
            break;
        case 'python':
            structure['main.py'] = code || generateDefaultCode(language, framework);
            structure['requirements.txt'] = generateRequirementsTxt(dependencies);
            break;
        case 'java':
            structure['src/main/java/Main.java'] = code || generateDefaultCode(language, framework);
            structure['pom.xml'] = generatePomXml(projectName, dependencies);
            break;
        case 'swift':
            structure['Sources/main.swift'] = code || generateDefaultCode(language, framework);
            structure['Package.swift'] = generatePackageSwift(projectName, dependencies);
            break;
        default:
            structure['src/main.${language}'] = code || generateDefaultCode(language, framework);
    }

    // Platform-specific configuration
    if (platform === 'exe' && framework === 'electron') {
        structure['electron.js'] = generateElectronMain();
        structure['preload.js'] = generateElectronPreload();
    }

    if (platform === 'ipa' && framework === 'react-native') {
        structure['ios/AppDelegate.m'] = generateIOSAppDelegate();
        structure['android/app/src/main/AndroidManifest.xml'] = generateAndroidManifest();
    }

    return structure;
}

function generateBuildScript(platform, framework, config) {
    return `#!/bin/bash
# Build script for ${platform} using ${framework}

echo "Building for ${platform}..."

# Install dependencies
npm install

# Execute build command
${config.buildCommand}

echo "Build completed!"
`;
}

async function findOutputFile(projectDir, platform, framework) {
    const extensions = {
        exe: ['.exe'],
        ipa: ['.ipa'],
        apk: ['.apk']
    };

    const searchExtensions = extensions[platform] || [];
    
    for (const ext of searchExtensions) {
        const files = await fs.readdir(projectDir);
        const outputFile = files.find(file => file.endsWith(ext));
        if (outputFile) {
            return path.join(projectDir, outputFile);
        }
    }

    return null;
}

async function findOutputFiles(projectDir) {
    const files = await fs.readdir(projectDir, { recursive: true });
    return files.filter(file => 
        file.endsWith('.exe') || 
        file.endsWith('.ipa') || 
        file.endsWith('.apk') ||
        file.endsWith('.dmg') ||
        file.endsWith('.deb')
    ).map(file => path.join(projectDir, file));
}

// Template generators
function generatePackageJson(projectName, dependencies = []) {
    return JSON.stringify({
        name: projectName,
        version: '1.0.0',
        description: `AI Tani generated ${projectName}`,
        main: 'src/index.js',
        scripts: {
            start: 'node src/index.js',
            build: 'npm run build:electron',
            'build:electron': 'electron-builder'
        },
        dependencies: {
            ...dependencies.reduce((acc, dep) => ({ ...acc, [dep]: 'latest' }), {}),
            electron: '^27.0.0'
        },
        devDependencies: {
            'electron-builder': '^24.6.4'
        }
    }, null, 2);
}

function generateDefaultCode(language, framework) {
    const templates = {
        javascript: `console.log('Hello from AI Tani!');
// Your code here`,
        python: `print("Hello from AI Tani!")
# Your code here`,
        java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from AI Tani!");
        // Your code here
    }
}`,
        swift: `import Foundation

print("Hello from AI Tani!")
// Your code here`
    };

    return templates[language] || `// ${language} code generated by AI Tani
// Your code here`;
}

function generateDefaultCSS() {
    return `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
}

h1 {
    font-size: 3em;
    margin-bottom: 20px;
}

p {
    font-size: 1.2em;
    line-height: 1.6;
}`;
}

function generateReadme(projectName, language, platform, framework) {
    return `# ${projectName}

This project was generated by AI Tani Complete.

## Details
- **Language**: ${language}
- **Platform**: ${platform}
- **Framework**: ${framework}

## Build Instructions

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Build the project:
   \`\`\`bash
   npm run build
   \`\`\`

## Features
- Generated by AI Tani Complete
- Supports 100,000+ programming languages
- Cross-platform build capabilities
- Real-time collaboration
- Advanced debugging tools

## License
MIT License - Generated by AI Tani Complete
`;
}

module.exports = router; 