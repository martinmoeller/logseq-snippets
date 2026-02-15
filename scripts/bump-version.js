import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Get bump type from command line args (major, minor, patch)
const bumpType = process.argv[2] || 'patch';

if (!['major', 'minor', 'patch'].includes(bumpType)) {
    console.error('Invalid bump type. Use: major, minor, or patch');
    process.exit(1);
}

// Read package.json
const packageJsonPath = join(process.cwd(), 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

// Store old version
const oldVersion = packageJson.version;

// Parse current version
const versionParts = packageJson.version.split('.');
let major = parseInt(versionParts[0]);
let minor = parseInt(versionParts[1]);
let patch = parseInt(versionParts[2]);

// Increment version based on type
let newVersion;
switch (bumpType) {
    case 'major':
        major += 1;
        minor = 0;
        patch = 0;
        newVersion = `${major}.${minor}.${patch}`;
        break;
    case 'minor':
        minor += 1;
        patch = 0;
        newVersion = `${major}.${minor}.${patch}`;
        break;
    case 'patch':
    default:
        patch += 1;
        newVersion = `${major}.${minor}.${patch}`;
        break;
}

// Update package.json
packageJson.version = newVersion;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4) + '\n');

console.log(`✓ Bumped ${bumpType} version: ${oldVersion} → ${newVersion}`);
