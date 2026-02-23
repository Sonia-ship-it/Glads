const fs = require('fs');
const path = require('path');

const mainAppPath = path.join(__dirname, 'components', 'MainApp.tsx');
let content = fs.readFileSync(mainAppPath, 'utf8');

function extractSection(tabName, propList, imports) {
    const marker = `{currentTab === '${tabName}' && (`;
    const startIdx = content.indexOf(marker);
    if (startIdx === -1) {
        console.log(`Could not find ${tabName} section`);
        return;
    }

    // Find matching closing parenthesis
    let openCount = 0;
    let endIdx = -1;
    const startContentIdx = startIdx + marker.length - 1; // index of '('

    for (let i = startContentIdx; i < content.length; i++) {
        if (content[i] === '(') openCount++;
        if (content[i] === ')') {
            openCount--;
            if (openCount === 0) {
                // Find the following `}`
                const closeBraceIdx = content.indexOf('}', i);
                if (closeBraceIdx !== -1) {
                    endIdx = closeBraceIdx;
                    break;
                }
            }
        }
    }

    if (endIdx === -1) {
        console.log(`Could not find end of ${tabName} section`);
        return;
    }

    const sectionContent = content.substring(startIdx + marker.length, endIdx - 1).trim();
    const componentName = `${tabName}Section`;

    const compContent = `import * as React from 'react';\n${imports}\n\ninterface ${componentName}Props {\n  ${propList.join(';\n  ')};\n}\n\nexport const ${componentName}: React.FC<${componentName}Props> = ({ ${propList.map(p => p.split(':')[0].trim()).join(', ')} }) => {\n  return (\n    ${sectionContent}\n  );\n};\n`;

    fs.writeFileSync(path.join(__dirname, 'components', 'sections', `${componentName}.tsx`), compContent);

    const replacement = `{currentTab === '${tabName}' && (\n            <${componentName} ${propList.map(p => {
        const name = p.split(':')[0].trim();
        return `${name}={${name}}`;
    }).join(' ')} />\n          )}`;

    content = content.substring(0, startIdx) + replacement + content.substring(endIdx + 1);
    console.log(`Extracted ${componentName}`);
}

extractSection('Rooms', [
    'data: any', 'activeBranch: any', 'setCurrentTab: any', 'show3DView: any', 'setCursorLabel: any', 'openImmersive: any', 'openRoomBooking: any', 'setRotation: any', 'setShow3DView: any', 'start360Rotation: any'
], "import { Branch, RoomType } from '../../types';\nimport { LoadingScreen } from '../common/LoadingScreen';");

extractSection('Services', [
    'data: any', 'activeBranch: any', 'setCurrentTab: any', 'openBooking: any', 'openImmersive: any', 'setSelectedService: any'
], "import { Branch } from '../../types';\nimport { LoadingScreen } from '../common/LoadingScreen';");

extractSection('Gallery', [
    'data: any', 'activeBranch: any', 'setCursorLabel: any', 'openImmersive: any'
], "import { Branch } from '../../types';");

extractSection('Contact', [
    'activeBranch: any', 'data: any', 'submitFeedback: any', 'feedbackLoading: any', 'feedbackMessage: any'
], "import { Branch } from '../../types';\nimport { MapPin, Phone, Mail, Clock } from 'lucide-react';");

fs.writeFileSync(mainAppPath, content);
console.log("Done updating MainApp.tsx");
