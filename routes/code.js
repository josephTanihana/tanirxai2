const express = require('express');
const router = express.Router();

// Code analysis and utilities
router.post('/analyze', (req, res) => {
    try {
        const { code, language } = req.body;

        if (!code || !language) {
            return res.status(400).json({
                error: 'Missing required fields: code, language'
            });
        }

        // Basic code analysis
        const analysis = {
            linesOfCode: code.split('\n').length,
            characters: code.length,
            complexity: calculateComplexity(code, language),
            maintainability: calculateMaintainability(code, language),
            testability: calculateTestability(code, language),
            suggestions: generateSuggestions(code, language),
            issues: findIssues(code, language),
            score: calculateScore(code, language)
        };

        res.json({
            success: true,
            analysis
        });

    } catch (error) {
        console.error('Code analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze code',
            message: error.message
        });
    }
});

// Code formatting
router.post('/format', (req, res) => {
    try {
        const { code, language, style } = req.body;

        if (!code || !language) {
            return res.status(400).json({
                error: 'Missing required fields: code, language'
            });
        }

        const formattedCode = formatCode(code, language, style);

        res.json({
            success: true,
            formattedCode,
            originalCode: code
        });

    } catch (error) {
        console.error('Code formatting error:', error);
        res.status(500).json({
            error: 'Failed to format code',
            message: error.message
        });
    }
});

// Code optimization
router.post('/optimize', (req, res) => {
    try {
        const { code, language, optimizationLevel } = req.body;

        if (!code || !language) {
            return res.status(400).json({
                error: 'Missing required fields: code, language'
            });
        }

        const optimization = optimizeCode(code, language, optimizationLevel);

        res.json({
            success: true,
            optimizedCode: optimization.code,
            improvements: optimization.improvements,
            originalCode: code
        });

    } catch (error) {
        console.error('Code optimization error:', error);
        res.status(500).json({
            error: 'Failed to optimize code',
            message: error.message
        });
    }
});

// Code conversion between languages
router.post('/convert', (req, res) => {
    try {
        const { code, sourceLanguage, targetLanguage } = req.body;

        if (!code || !sourceLanguage || !targetLanguage) {
            return res.status(400).json({
                error: 'Missing required fields: code, sourceLanguage, targetLanguage'
            });
        }

        const conversion = convertCode(code, sourceLanguage, targetLanguage);

        res.json({
            success: true,
            convertedCode: conversion.code,
            explanation: conversion.explanation,
            originalCode: code
        });

    } catch (error) {
        console.error('Code conversion error:', error);
        res.status(500).json({
            error: 'Failed to convert code',
            message: error.message
        });
    }
});

// Helper functions
function calculateComplexity(code, language) {
    // Simple complexity calculation
    const lines = code.split('\n');
    const complexity = {
        cyclomatic: 1,
        cognitive: 1,
        halstead: 1
    };

    // Count control structures
    const controlStructures = ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', 'try'];
    controlStructures.forEach(structure => {
        const regex = new RegExp(`\\b${structure}\\b`, 'gi');
        const matches = code.match(regex);
        if (matches) {
            complexity.cyclomatic += matches.length;
        }
    });

    // Calculate cognitive complexity
    const nestedStructures = ['if', 'for', 'while', 'switch'];
    nestedStructures.forEach(structure => {
        const regex = new RegExp(`\\b${structure}\\b`, 'gi');
        const matches = code.match(regex);
        if (matches) {
            complexity.cognitive += matches.length * 2;
        }
    });

    return complexity;
}

function calculateMaintainability(code, language) {
    const lines = code.split('\n');
    const avgLineLength = code.length / lines.length;
    const commentRatio = (code.match(/\/\/|\/\*|\*/g) || []).length / lines.length;
    
    let maintainability = 100;
    
    // Penalize long lines
    if (avgLineLength > 80) maintainability -= 20;
    if (avgLineLength > 120) maintainability -= 30;
    
    // Penalize lack of comments
    if (commentRatio < 0.1) maintainability -= 15;
    
    // Penalize very long functions
    const functionLines = lines.filter(line => line.trim().includes('function') || line.trim().includes('def'));
    if (functionLines.length > 0) {
        const avgFunctionLength = lines.length / functionLines.length;
        if (avgFunctionLength > 50) maintainability -= 25;
    }
    
    return Math.max(0, maintainability);
}

function calculateTestability(code, language) {
    let testability = 100;
    
    // Check for dependencies
    const dependencies = code.match(/import|require|using/g) || [];
    if (dependencies.length > 10) testability -= 20;
    
    // Check for side effects
    const sideEffects = code.match(/console\.log|print|alert/g) || [];
    if (sideEffects.length > 5) testability -= 15;
    
    // Check for global variables
    const globalVars = code.match(/var\s+\w+|let\s+\w+|const\s+\w+/g) || [];
    if (globalVars.length > 10) testability -= 25;
    
    return Math.max(0, testability);
}

function generateSuggestions(code, language) {
    const suggestions = [];
    
    // Check for common issues
    if (code.includes('console.log')) {
        suggestions.push('Consider removing console.log statements for production code');
    }
    
    if (code.includes('TODO') || code.includes('FIXME')) {
        suggestions.push('Address TODO/FIXME comments before deployment');
    }
    
    if (code.length > 1000) {
        suggestions.push('Consider breaking down large functions into smaller, more manageable pieces');
    }
    
    if (!code.includes('function') && !code.includes('def') && !code.includes('class')) {
        suggestions.push('Consider organizing code into functions or classes');
    }
    
    if (code.includes('eval(') || code.includes('innerHTML')) {
        suggestions.push('Avoid using eval() and innerHTML for security reasons');
    }
    
    return suggestions;
}

function findIssues(code, language) {
    const issues = [];
    
    // Security issues
    if (code.includes('eval(')) {
        issues.push({
            type: 'security',
            severity: 'high',
            message: 'Use of eval() is a security risk',
            line: findLineNumber(code, 'eval(')
        });
    }
    
    if (code.includes('innerHTML')) {
        issues.push({
            type: 'security',
            severity: 'medium',
            message: 'innerHTML can lead to XSS attacks',
            line: findLineNumber(code, 'innerHTML')
        });
    }
    
    // Performance issues
    if (code.includes('document.write')) {
        issues.push({
            type: 'performance',
            severity: 'medium',
            message: 'document.write can block page rendering',
            line: findLineNumber(code, 'document.write')
        });
    }
    
    return issues;
}

function calculateScore(code, language) {
    const maintainability = calculateMaintainability(code, language);
    const testability = calculateTestability(code, language);
    const complexity = calculateComplexity(code, language);
    
    let score = (maintainability + testability) / 2;
    
    // Penalize high complexity
    if (complexity.cyclomatic > 10) score -= 20;
    if (complexity.cognitive > 15) score -= 15;
    
    return Math.max(0, Math.min(100, score));
}

function formatCode(code, language, style = 'standard') {
    // Basic formatting (in production, use proper formatters)
    let formatted = code;
    
    // Remove extra whitespace
    formatted = formatted.replace(/\s+/g, ' ');
    
    // Add proper indentation
    const lines = formatted.split('\n');
    let indentLevel = 0;
    
    const formattedLines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed === '') return '';
        
        // Decrease indent for closing braces
        if (trimmed.includes('}') || trimmed.includes('end')) {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        
        const indented = '    '.repeat(indentLevel) + trimmed;
        
        // Increase indent for opening braces
        if (trimmed.includes('{') || trimmed.includes('if') || trimmed.includes('for') || trimmed.includes('while')) {
            indentLevel++;
        }
        
        return indented;
    });
    
    return formattedLines.join('\n');
}

function optimizeCode(code, language, level = 'basic') {
    const optimizations = [];
    let optimizedCode = code;
    
    // Basic optimizations
    if (level === 'basic' || level === 'advanced') {
        // Remove unused variables (basic detection)
        const varRegex = /(?:var|let|const)\s+(\w+)/g;
        const variables = [];
        let match;
        
        while ((match = varRegex.exec(code)) !== null) {
            variables.push(match[1]);
        }
        
        // Check if variables are used
        variables.forEach(variable => {
            const usageRegex = new RegExp(`\\b${variable}\\b`, 'g');
            const usages = code.match(usageRegex);
            if (usages && usages.length === 1) {
                optimizations.push(`Unused variable '${variable}' can be removed`);
            }
        });
    }
    
    // Advanced optimizations
    if (level === 'advanced') {
        // Suggest using const instead of let when possible
        const letRegex = /let\s+(\w+)\s*=\s*([^;]+);/g;
        let match;
        
        while ((match = letRegex.exec(code)) !== null) {
            const varName = match[1];
            const value = match[2];
            
            // Check if it's a primitive value
            if (/^['"`]|^\d+$|^true$|^false$/.test(value.trim())) {
                optimizations.push(`Consider using 'const' instead of 'let' for '${varName}'`);
            }
        }
    }
    
    return {
        code: optimizedCode,
        improvements: optimizations
    };
}

function convertCode(code, sourceLanguage, targetLanguage) {
    // Basic code conversion templates
    const conversions = {
        'javascript-python': {
            code: code
                .replace(/function\s+(\w+)/g, 'def $1')
                .replace(/console\.log/g, 'print')
                .replace(/const\s+/g, '')
                .replace(/let\s+/g, '')
                .replace(/var\s+/g, '')
                .replace(/;\s*$/gm, '')
                .replace(/\{\s*/g, ':')
                .replace(/\}/g, ''),
            explanation: 'Converted JavaScript to Python with basic syntax changes'
        },
        'python-javascript': {
            code: code
                .replace(/def\s+(\w+)/g, 'function $1')
                .replace(/print\s*\(/g, 'console.log(')
                .replace(/:\s*$/gm, ' {')
                .replace(/(\w+)\s*=\s*([^#\n]+)/g, 'let $1 = $2;'),
            explanation: 'Converted Python to JavaScript with basic syntax changes'
        }
    };
    
    const conversionKey = `${sourceLanguage}-${targetLanguage}`;
    const conversion = conversions[conversionKey];
    
    if (conversion) {
        return conversion;
    }
    
    // Generic conversion
    return {
        code: `// Converted from ${sourceLanguage} to ${targetLanguage}
// This is a template conversion - manual review required
${code}`,
        explanation: `Basic template conversion from ${sourceLanguage} to ${targetLanguage}. Manual review and adjustments required.`
    };
}

function findLineNumber(code, searchTerm) {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(searchTerm)) {
            return i + 1;
        }
    }
    return -1;
}

module.exports = router; 