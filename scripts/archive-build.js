const fs = require('fs');
const path = require('path');

const version = process.argv[2];
const packagePath = path.join('build', 'com.pear.desktop.streamdeck.streamDeckPlugin');

if (!version) {
    console.error('Usage: npm run archive-build -- <version>');
    process.exit(1);
}

if (!fs.existsSync(packagePath)) {
    console.error(`Build package not found at ${packagePath}. Run npm run build and package it first.`);
    process.exit(1);
}

const archiveDirectory = path.join('local-builds', version);
fs.mkdirSync(archiveDirectory, {recursive: true});

const archivePath = path.join(archiveDirectory, path.basename(packagePath));
fs.copyFileSync(packagePath, archivePath);

console.log(`Archived ${packagePath} to ${archivePath}`);