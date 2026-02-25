const fs = require('fs');
let main = fs.readFileSync('components/MainApp.tsx', 'utf-8');

// Fix duplicate normalize
main = main.replace(/const normalize = \(v: string\) => \(v \|\| ''\)\.toLowerCase\(\)\.trim\(\);\r?\n+const normalize = \(v: string\) => \(v \|\| ''\)\.toLowerCase\(\)\.trim\(\);/, "const normalize = (v: string) => (v || '').toLowerCase().trim();");

// Extract the 236 keys from useMainAppState
const hook = fs.readFileSync('hooks/useMainAppState.ts', 'utf-8');
const returnMatch = hook.match(/return \{\s+([\s\S]+?)\s+\};/);
let keys = [];
if (returnMatch) {
    keys = returnMatch[1].split(',\n').map(k => k.trim());
}

// Replace the state block in MainApp
const initialTabIndex = main.indexOf("const App: React.FC<MainAppProps> = ({ initialTab = 'Home' }) => {");
const isRestoringIndex = main.indexOf("if (isRestoringAuth) {");

if (initialTabIndex > -1 && isRestoringIndex > -1) {
    const before = main.substring(0, main.indexOf('{', initialTabIndex) + 1);
    const after = main.substring(isRestoringIndex);

    // Check if useMainAppState is imported
    const importStatement = "import { useMainAppState } from '../hooks/useMainAppState';\n";
    let finalCode = main;
    if (!main.includes('useMainAppState')) {
        finalCode = importStatement + before + "\n  const {\n    " + keys.join(',\n    ') + "\n  } = useMainAppState(initialTab);\n\n  " + after;
    } else {
        finalCode = before + "\n  const {\n    " + keys.join(',\n    ') + "\n  } = useMainAppState(initialTab);\n\n  " + after;
    }

    fs.writeFileSync('components/MainApp.tsx', finalCode);
    console.log("Successfully refactored MainApp.tsx to use useMainAppState");
} else {
    console.log("Could not find boundaries in MainApp.tsx", { initialTabIndex, isRestoringIndex });
}
