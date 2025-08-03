const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Mock projects database (in production, use a real database)
const projects = [];

// Get all projects
router.get('/', (req, res) => {
    res.json({
        success: true,
        totalProjects: projects.length,
        projects: projects.map(project => ({
            id: project.id,
            name: project.name,
            description: project.description,
            language: project.language,
            framework: project.framework,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            status: project.status
        }))
    });
});

// Get project by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const project = projects.find(p => p.id === id);

    if (!project) {
        return res.status(404).json({
            error: 'Project not found'
        });
    }

    res.json({
        success: true,
        project
    });
});

// Create new project
router.post('/', (req, res) => {
    try {
        const { name, description, language, framework, code } = req.body;

        if (!name || !language) {
            return res.status(400).json({
                error: 'Missing required fields: name, language'
            });
        }

        const project = {
            id: uuidv4(),
            name,
            description: description || '',
            language,
            framework: framework || '',
            code: code || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active',
            files: [
                {
                    name: `main.${getFileExtension(language)}`,
                    content: code || '',
                    type: 'main'
                }
            ],
            buildHistory: [],
            collaborators: []
        };

        projects.push(project);

        res.json({
            success: true,
            message: 'Project created successfully',
            project: {
                id: project.id,
                name: project.name,
                description: project.description,
                language: project.language,
                framework: project.framework,
                createdAt: project.createdAt,
                status: project.status
            }
        });

    } catch (error) {
        console.error('Project creation error:', error);
        res.status(500).json({
            error: 'Failed to create project',
            message: error.message
        });
    }
});

// Update project
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, language, framework, code, status } = req.body;

        const project = projects.find(p => p.id === id);
        if (!project) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }

        // Update project fields
        if (name) project.name = name;
        if (description !== undefined) project.description = description;
        if (language) project.language = language;
        if (framework !== undefined) project.framework = framework;
        if (code !== undefined) project.code = code;
        if (status) project.status = status;

        project.updatedAt = new Date().toISOString();

        res.json({
            success: true,
            message: 'Project updated successfully',
            project: {
                id: project.id,
                name: project.name,
                description: project.description,
                language: project.language,
                framework: project.framework,
                updatedAt: project.updatedAt,
                status: project.status
            }
        });

    } catch (error) {
        console.error('Project update error:', error);
        res.status(500).json({
            error: 'Failed to update project',
            message: error.message
        });
    }
});

// Delete project
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const projectIndex = projects.findIndex(p => p.id === id);

        if (projectIndex === -1) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }

        projects.splice(projectIndex, 1);

        res.json({
            success: true,
            message: 'Project deleted successfully'
        });

    } catch (error) {
        console.error('Project deletion error:', error);
        res.status(500).json({
            error: 'Failed to delete project',
            message: error.message
        });
    }
});

// Get project files
router.get('/:id/files', (req, res) => {
    const { id } = req.params;
    const project = projects.find(p => p.id === id);

    if (!project) {
        return res.status(404).json({
            error: 'Project not found'
        });
    }

    res.json({
        success: true,
        files: project.files
    });
});

// Add file to project
router.post('/:id/files', (req, res) => {
    try {
        const { id } = req.params;
        const { name, content, type } = req.body;

        const project = projects.find(p => p.id === id);
        if (!project) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }

        const file = {
            id: uuidv4(),
            name,
            content: content || '',
            type: type || 'code',
            createdAt: new Date().toISOString()
        };

        project.files.push(file);
        project.updatedAt = new Date().toISOString();

        res.json({
            success: true,
            message: 'File added successfully',
            file
        });

    } catch (error) {
        console.error('File addition error:', error);
        res.status(500).json({
            error: 'Failed to add file',
            message: error.message
        });
    }
});

// Update project file
router.put('/:id/files/:fileId', (req, res) => {
    try {
        const { id, fileId } = req.params;
        const { name, content, type } = req.body;

        const project = projects.find(p => p.id === id);
        if (!project) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }

        const file = project.files.find(f => f.id === fileId);
        if (!file) {
            return res.status(404).json({
                error: 'File not found'
            });
        }

        // Update file fields
        if (name) file.name = name;
        if (content !== undefined) file.content = content;
        if (type) file.type = type;

        project.updatedAt = new Date().toISOString();

        res.json({
            success: true,
            message: 'File updated successfully',
            file
        });

    } catch (error) {
        console.error('File update error:', error);
        res.status(500).json({
            error: 'Failed to update file',
            message: error.message
        });
    }
});

// Delete project file
router.delete('/:id/files/:fileId', (req, res) => {
    try {
        const { id, fileId } = req.params;

        const project = projects.find(p => p.id === id);
        if (!project) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }

        const fileIndex = project.files.findIndex(f => f.id === fileId);
        if (fileIndex === -1) {
            return res.status(404).json({
                error: 'File not found'
            });
        }

        project.files.splice(fileIndex, 1);
        project.updatedAt = new Date().toISOString();

        res.json({
            success: true,
            message: 'File deleted successfully'
        });

    } catch (error) {
        console.error('File deletion error:', error);
        res.status(500).json({
            error: 'Failed to delete file',
            message: error.message
        });
    }
});

// Get project build history
router.get('/:id/builds', (req, res) => {
    const { id } = req.params;
    const project = projects.find(p => p.id === id);

    if (!project) {
        return res.status(404).json({
            error: 'Project not found'
        });
    }

    res.json({
        success: true,
        builds: project.buildHistory
    });
});

// Add build record to project
router.post('/:id/builds', (req, res) => {
    try {
        const { id } = req.params;
        const { platform, framework, status, output, errors } = req.body;

        const project = projects.find(p => p.id === id);
        if (!project) {
            return res.status(404).json({
                error: 'Project not found'
            });
        }

        const build = {
            id: uuidv4(),
            platform,
            framework,
            status,
            output: output || '',
            errors: errors || '',
            createdAt: new Date().toISOString()
        };

        project.buildHistory.push(build);
        project.updatedAt = new Date().toISOString();

        res.json({
            success: true,
            message: 'Build record added successfully',
            build
        });

    } catch (error) {
        console.error('Build record addition error:', error);
        res.status(500).json({
            error: 'Failed to add build record',
            message: error.message
        });
    }
});

// Helper function to get file extension
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

module.exports = router; 