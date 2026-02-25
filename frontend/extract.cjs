const fs = require('fs');
const mainApp = fs.readFileSync('components/MainApp.tsx', 'utf-8');
const lines = mainApp.split('\n');

const startIndex = lines.findIndex(l => l.includes("const openAdminArea = (section: LegalDoc = 'dashboard') => {"));
const endIndex = lines.findIndex((l, i) => i > startIndex && l.includes("if (isRestoringAuth) {"));

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find start or end index.");
    process.exit(1);
}

const extracted = lines.slice(startIndex, endIndex).join('\n');

const hook = fs.readFileSync('hooks/useMainAppState.ts', 'utf-8');
const hookLines = hook.split('\n');
const returnIndex = hookLines.findIndex(l => l.trim() === "return {");

if (returnIndex === -1) {
    console.error("Could not find return statement in hook.");
    process.exit(1);
}

const funcNames = [];
for (let i = startIndex; i < endIndex; i++) {
    let match = lines[i].match(/^\s*const\s+([a-zA-Z0-9_]+)\s*=/);
    if (match && !['activeBranchOption', 'data', 'mappedNews', 'allowedAdminSections', 'roleCapabilities', 'isAdminWorkspace', 'testimonials', 'availableTabs', 'allOpsTabs', 'allowedOpsTabs'].includes(match[1])) {
        funcNames.push(match[1]);
    }
    let funcMatch = lines[i].match(/^\s*function\s+([a-zA-Z0-9_]+)\s*\(/);
    if (funcMatch) funcNames.push(funcMatch[1]);
}

// Ensure unique
const uniqueFuncs = [...new Set(funcNames)];

const newReturn = `    return {
` + hookLines.slice(returnIndex + 1, hookLines.length - 2).join('\n') + `,\n        ` + uniqueFuncs.join(',\n        ') + `
    };
};
`;

const newHook = hookLines.slice(0, returnIndex).join('\n') + '\n' + extracted + '\n' + newReturn;
fs.writeFileSync('hooks/useMainAppState.ts', newHook);
console.log("Successfully extracted and updated hook.");
