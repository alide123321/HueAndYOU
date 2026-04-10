import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const buildDir = path.join(projectRoot, 'build');

fs.rmSync(buildDir, {recursive: true, force: true});
fs.mkdirSync(buildDir, {recursive: true});

// Frontend assets and pages.
fs.cpSync(path.join(projectRoot, 'public'), buildDir, {recursive: true});

// Shared runtime utilities used by browser modules.
fs.cpSync(path.join(projectRoot, 'shared'), path.join(buildDir, 'shared'), {
  recursive: true,
});

// Browser runtime imports used by in-browser palette generation.
fs.cpSync(path.join(projectRoot, 'src'), path.join(buildDir, 'runtime-src'), {
  recursive: true,
});

// Root entry for GitHub Pages.
const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  <script>
    window.location.replace('./views/about.html');
  </script>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Hue & YOU</title>
</head>
<body>
  <p>Redirecting to <a href="./views/about.html">Hue & YOU</a>...</p>
</body>
</html>
`;

fs.writeFileSync(path.join(buildDir, 'index.html'), indexHtml, 'utf8');
fs.writeFileSync(path.join(buildDir, '.nojekyll'), '', 'utf8');

console.log('Built GitHub Pages output in ./build');
