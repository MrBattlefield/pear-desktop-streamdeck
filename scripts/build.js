const esbuild = require('esbuild');
const fs = require('fs');
// Create release folder
console.log('Creating release folder');
if (fs.existsSync('build')) {
    fs.rmSync('build', {recursive: true, force: true});
}
fs.mkdirSync('build');

// Create plugin folder
console.log('Creating plugin folder');
if (fs.existsSync('build/com.pear.desktop.streamdeck.sdPlugin')) {
    fs.rmSync('build/com.pear.desktop.streamdeck.sdPlugin', {recursive: true, force: true});
}
fs.mkdirSync('build/com.pear.desktop.streamdeck.sdPlugin');

// Build plugin
console.log('Building plugin');

async function bundle(entryPoint, outFile) {
    await esbuild.build({
        entryPoints: [entryPoint],
        outfile: outFile,
        bundle: true,
        format: 'iife',
        platform: 'browser',
        target: ['es2017'],
        minify: true
    });
}

async function main() {
    await Promise.all([
        bundle('src/pear-desktop-pi.ts', 'build/com.pear.desktop.streamdeck.sdPlugin/bundle-pi.js'),
        bundle('src/pear-desktop.ts', 'build/com.pear.desktop.streamdeck.sdPlugin/bundle.js')
    ]);

    // Copy files
    console.log('Copying files');
    const outputDir = 'build/com.pear.desktop.streamdeck.sdPlugin';
    const rootEntries = fs.readdirSync('.');

    const excludedJson = new Set([
        'package.json',
        'package-lock.json',
        'tsconfig.json',
        'release-please-config.json',
        '.release-please-manifest.json'
    ]);

    rootEntries
        .filter((name) => name.endsWith('.json') && !excludedJson.has(name))
        .forEach((name) => fs.copyFileSync(name, `${outputDir}/${name}`));

    rootEntries
        .filter((name) => name.endsWith('.html'))
        .forEach((name) => fs.copyFileSync(name, `${outputDir}/${name}`));

    rootEntries
        .filter((name) => name.endsWith('.css'))
        .forEach((name) => fs.copyFileSync(name, `${outputDir}/${name}`));

    fs.cpSync('icons', `${outputDir}/icons`, {recursive: true});

    // Done building plugin folder, check the build directory
    console.log('Done building plugin folder, check the build directory');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
