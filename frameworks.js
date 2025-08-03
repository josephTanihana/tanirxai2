const express = require('express');
const router = express.Router();

// Framework database
const frameworks = {
    // JavaScript frameworks
    react: {
        name: 'React',
        language: 'javascript',
        description: 'A JavaScript library for building user interfaces',
        website: 'https://reactjs.org',
        version: '18.2.0',
        features: ['Component-based', 'Virtual DOM', 'JSX', 'Hooks'],
        buildTools: ['Create React App', 'Vite', 'Webpack'],
        platforms: ['web', 'mobile', 'desktop']
    },
    vue: {
        name: 'Vue.js',
        language: 'javascript',
        description: 'The Progressive JavaScript Framework',
        website: 'https://vuejs.org',
        version: '3.3.0',
        features: ['Reactive', 'Component-based', 'Single File Components'],
        buildTools: ['Vue CLI', 'Vite', 'Webpack'],
        platforms: ['web', 'mobile']
    },
    angular: {
        name: 'Angular',
        language: 'typescript',
        description: 'Platform for building mobile and desktop web applications',
        website: 'https://angular.io',
        version: '17.0.0',
        features: ['TypeScript', 'Dependency Injection', 'RxJS', 'CLI'],
        buildTools: ['Angular CLI', 'Webpack'],
        platforms: ['web', 'mobile']
    },
    express: {
        name: 'Express.js',
        language: 'javascript',
        description: 'Fast, unopinionated, minimalist web framework for Node.js',
        website: 'https://expressjs.com',
        version: '4.18.2',
        features: ['Routing', 'Middleware', 'Static Files', 'Template Engines'],
        buildTools: ['npm', 'yarn'],
        platforms: ['server']
    },
    
    // Python frameworks
    django: {
        name: 'Django',
        language: 'python',
        description: 'High-level Python web framework that encourages rapid development',
        website: 'https://djangoproject.com',
        version: '4.2.0',
        features: ['ORM', 'Admin Interface', 'Security', 'Scalability'],
        buildTools: ['pip', 'poetry'],
        platforms: ['web', 'server']
    },
    flask: {
        name: 'Flask',
        language: 'python',
        description: 'A lightweight WSGI web application framework',
        website: 'https://flask.palletsprojects.com',
        version: '2.3.0',
        features: ['Micro-framework', 'Flexible', 'Extensible'],
        buildTools: ['pip', 'poetry'],
        platforms: ['web', 'server']
    },
    fastapi: {
        name: 'FastAPI',
        language: 'python',
        description: 'Modern, fast web framework for building APIs with Python',
        website: 'https://fastapi.tiangolo.com',
        version: '0.104.0',
        features: ['Fast', 'Type Hints', 'Auto Documentation', 'Async'],
        buildTools: ['pip', 'poetry'],
        platforms: ['web', 'server']
    },
    
    // Java frameworks
    spring: {
        name: 'Spring Boot',
        language: 'java',
        description: 'Framework for building production-ready applications',
        website: 'https://spring.io/projects/spring-boot',
        version: '3.1.0',
        features: ['Auto-configuration', 'Starter Dependencies', 'Actuator'],
        buildTools: ['Maven', 'Gradle'],
        platforms: ['web', 'server']
    },
    hibernate: {
        name: 'Hibernate',
        language: 'java',
        description: 'Object-relational mapping framework for Java',
        website: 'https://hibernate.org',
        version: '6.2.0',
        features: ['ORM', 'JPA', 'Query Language', 'Caching'],
        buildTools: ['Maven', 'Gradle'],
        platforms: ['server']
    },
    
    // C# frameworks
    dotnet: {
        name: '.NET',
        language: 'csharp',
        description: 'Free, cross-platform, open source developer platform',
        website: 'https://dotnet.microsoft.com',
        version: '8.0.0',
        features: ['Cross-platform', 'Performance', 'Unified Platform'],
        buildTools: ['dotnet CLI', 'Visual Studio'],
        platforms: ['web', 'desktop', 'mobile', 'server']
    },
    aspnet: {
        name: 'ASP.NET Core',
        language: 'csharp',
        description: 'Cross-platform framework for building web apps and services',
        website: 'https://dotnet.microsoft.com/apps/aspnet',
        version: '8.0.0',
        features: ['MVC', 'Web API', 'SignalR', 'Blazor'],
        buildTools: ['dotnet CLI', 'Visual Studio'],
        platforms: ['web', 'server']
    },
    
    // Mobile frameworks
    reactnative: {
        name: 'React Native',
        language: 'javascript',
        description: 'Framework for building native applications using React',
        website: 'https://reactnative.dev',
        version: '0.72.0',
        features: ['Cross-platform', 'Native Performance', 'Hot Reload'],
        buildTools: ['Metro', 'Expo CLI'],
        platforms: ['mobile']
    },
    flutter: {
        name: 'Flutter',
        language: 'dart',
        description: 'UI toolkit for building natively compiled applications',
        website: 'https://flutter.dev',
        version: '3.16.0',
        features: ['Cross-platform', 'Hot Reload', 'Custom Widgets'],
        buildTools: ['Flutter CLI'],
        platforms: ['mobile', 'web', 'desktop']
    },
    
    // Desktop frameworks
    electron: {
        name: 'Electron',
        language: 'javascript',
        description: 'Framework for building cross-platform desktop apps',
        website: 'https://electronjs.org',
        version: '27.0.0',
        features: ['Cross-platform', 'Web Technologies', 'Native APIs'],
        buildTools: ['electron-builder', 'electron-forge'],
        platforms: ['desktop']
    },
    qt: {
        name: 'Qt',
        language: 'cpp',
        description: 'Cross-platform application development framework',
        website: 'https://qt.io',
        version: '6.6.0',
        features: ['Cross-platform', 'Widgets', 'QML', 'Signals/Slots'],
        buildTools: ['qmake', 'CMake'],
        platforms: ['desktop', 'mobile']
    }
};

// Get all frameworks
router.get('/', (req, res) => {
    const { language, platform } = req.query;
    
    let filteredFrameworks = Object.entries(frameworks).map(([key, info]) => ({
        key,
        ...info
    }));
    
    // Filter by language
    if (language) {
        filteredFrameworks = filteredFrameworks.filter(fw => 
            fw.language.toLowerCase() === language.toLowerCase()
        );
    }
    
    // Filter by platform
    if (platform) {
        filteredFrameworks = filteredFrameworks.filter(fw => 
            fw.platforms.includes(platform.toLowerCase())
        );
    }
    
    res.json({
        success: true,
        totalFrameworks: filteredFrameworks.length,
        frameworks: filteredFrameworks
    });
});

// Get specific framework
router.get('/:framework', (req, res) => {
    const { framework } = req.params;
    const frameworkInfo = frameworks[framework.toLowerCase()];

    if (!frameworkInfo) {
        return res.status(404).json({
            error: 'Framework not found',
            availableFrameworks: Object.keys(frameworks)
        });
    }

    res.json({
        success: true,
        framework: {
            key: framework.toLowerCase(),
            ...frameworkInfo
        }
    });
});

// Get frameworks by language
router.get('/language/:language', (req, res) => {
    const { language } = req.params;
    
    const languageFrameworks = Object.entries(frameworks)
        .filter(([key, info]) => info.language.toLowerCase() === language.toLowerCase())
        .map(([key, info]) => ({
            key,
            ...info
        }));

    res.json({
        success: true,
        language,
        totalFrameworks: languageFrameworks.length,
        frameworks: languageFrameworks
    });
});

// Get frameworks by platform
router.get('/platform/:platform', (req, res) => {
    const { platform } = req.params;
    
    const platformFrameworks = Object.entries(frameworks)
        .filter(([key, info]) => info.platforms.includes(platform.toLowerCase()))
        .map(([key, info]) => ({
            key,
            ...info
        }));

    res.json({
        success: true,
        platform,
        totalFrameworks: platformFrameworks.length,
        frameworks: platformFrameworks
    });
});

// Get framework features
router.get('/:framework/features', (req, res) => {
    const { framework } = req.params;
    const frameworkInfo = frameworks[framework.toLowerCase()];

    if (!frameworkInfo) {
        return res.status(404).json({
            error: 'Framework not found'
        });
    }

    res.json({
        success: true,
        framework: framework.toLowerCase(),
        features: frameworkInfo.features
    });
});

// Get framework build tools
router.get('/:framework/build-tools', (req, res) => {
    const { framework } = req.params;
    const frameworkInfo = frameworks[framework.toLowerCase()];

    if (!frameworkInfo) {
        return res.status(404).json({
            error: 'Framework not found'
        });
    }

    res.json({
        success: true,
        framework: framework.toLowerCase(),
        buildTools: frameworkInfo.buildTools
    });
});

// Get framework platforms
router.get('/:framework/platforms', (req, res) => {
    const { framework } = req.params;
    const frameworkInfo = frameworks[framework.toLowerCase()];

    if (!frameworkInfo) {
        return res.status(404).json({
            error: 'Framework not found'
        });
    }

    res.json({
        success: true,
        framework: framework.toLowerCase(),
        platforms: frameworkInfo.platforms
    });
});

// Generate project template for framework
router.post('/:framework/template', (req, res) => {
    try {
        const { framework } = req.params;
        const { projectName, options } = req.body;

        const frameworkInfo = frameworks[framework.toLowerCase()];
        if (!frameworkInfo) {
            return res.status(404).json({
                error: 'Framework not found'
            });
        }

        const template = generateFrameworkTemplate(frameworkInfo, projectName, options);

        res.json({
            success: true,
            framework: framework.toLowerCase(),
            projectName,
            template
        });

    } catch (error) {
        console.error('Template generation error:', error);
        res.status(500).json({
            error: 'Failed to generate template',
            message: error.message
        });
    }
});

// Helper function to generate framework templates
function generateFrameworkTemplate(framework, projectName, options = {}) {
    const templates = {
        react: {
            'package.json': `{
  "name": "${projectName}",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`,
            'src/App.js': `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to ${projectName}</h1>
        <p>Generated with AI Tani Complete</p>
      </header>
    </div>
  );
}

export default App;`,
            'src/App.css': `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
}

.App-header h1 {
  margin: 0;
  font-size: 2rem;
}`
        },
        vue: {
            'package.json': `{
  "name": "${projectName}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "lint": "vue-cli-service lint"
  },
  "dependencies": {
    "vue": "^3.3.0"
  },
  "devDependencies": {
    "@vue/cli-service": "^5.0.0"
  }
}`,
            'src/App.vue': `<template>
  <div id="app">
    <h1>Welcome to {{ projectName }}</h1>
    <p>Generated with AI Tani Complete</p>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      projectName: '${projectName}'
    }
  }
}
</script>

<style>
#app {
  text-align: center;
  padding: 20px;
}

h1 {
  color: #42b983;
}
</style>`
        },
        flask: {
            'app.py': `from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html', project_name='${projectName}')

if __name__ == '__main__':
    app.run(debug=True)`,
            'templates/index.html': `<!DOCTYPE html>
<html>
<head>
    <title>${projectName}</title>
</head>
<body>
    <h1>Welcome to {{ project_name }}</h1>
    <p>Generated with AI Tani Complete</p>
</body>
</html>`,
            'requirements.txt': `Flask==2.3.0`
        }
    };

    const template = templates[framework.key] || {
        'README.md': `# ${projectName}

This project was generated using ${framework.name} framework.

## Getting Started

1. Install dependencies
2. Run the development server
3. Open your browser

## Generated with AI Tani Complete

- Framework: ${framework.name}
- Language: ${framework.language}
- Version: ${framework.version}
`
    };

    return template;
}

module.exports = router; 