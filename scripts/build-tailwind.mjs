import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { compile } from 'tailwindcss';

const require = createRequire(import.meta.url);
const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const srcDir = path.join(rootDir, 'src');
const outputDir = path.join(srcDir, 'generated');
const outputFile = path.join(outputDir, 'tailwind.css');

const stringLiteralPattern = /(["'`])((?:\\.|(?!\1)[\s\S])*)\1/g;

const customCss = `
html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: Inter, "Segoe UI", sans-serif;
  background: #f8fafc;
}

button,
input,
select {
  font: inherit;
}

.animate-shake {
  animation: shake 0.35s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-4px);
  }

  75% {
    transform: translateX(4px);
  }
}
`;

const normalizeToken = (token) =>
  token
    .trim()
    .replace(/^[<>{}()[\],;`"'!]+/, '')
    .replace(/[<>{}()[\],;`"']+$/, '');

const isLikelyClassToken = (token) => {
  if (!token || token.length > 120) return false;
  if (token.startsWith('http') || token.startsWith('/')) return false;
  if (!/[a-z]/i.test(token)) return false;
  if (/^[A-Z][A-Za-z]+$/.test(token)) return false;
  if (token.includes(' ')) return false;
  return true;
};

const walkFiles = async (directory) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === 'generated') {
      continue;
    }

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
      continue;
    }

    if (/\.(js|jsx|ts|tsx|html|css)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
};

const loadStylesheet = async (id, base) => {
  let resolved;

  if (id === 'tailwindcss') {
    resolved = require.resolve('tailwindcss/index.css');
  } else if (id.startsWith('.')) {
    resolved = path.resolve(base, id);
  } else {
    resolved = require.resolve(id);
  }

  return {
    base: path.dirname(resolved),
    content: await fs.readFile(resolved, 'utf8'),
  };
};

const collectCandidates = async () => {
  const files = await walkFiles(srcDir);
  const htmlPath = path.join(rootDir, 'index.html');
  files.push(htmlPath);

  const candidates = new Set();

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');

    for (const match of content.matchAll(stringLiteralPattern)) {
      const tokens = match[2].split(/\s+/);

      for (const rawToken of tokens) {
        const token = normalizeToken(rawToken);
        if (isLikelyClassToken(token)) {
          candidates.add(token);
        }
      }
    }
  }

  return [...candidates];
};

const build = async () => {
  const candidates = await collectCandidates();
  const compiler = await compile(
    '@import "tailwindcss";\n@custom-variant dark (&:where(.dark, .dark *));',
    {
      from: path.join(srcDir, 'index.css'),
      loadStylesheet,
    },
  );
  const css = compiler.build(candidates);

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputFile, `${css}\n${customCss}`);
  console.log(`Generated ${path.relative(rootDir, outputFile)} with ${candidates.length} candidates.`);
};

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
