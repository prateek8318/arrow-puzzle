// Keep the offline app text and public HTML pages in sync with the reviewed docs.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const documents = {};
const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
fs.mkdirSync(path.join(root, 'docs/legal'), { recursive: true });
for (const name of ['privacy-policy', 'terms-of-use']) {
  const markdown = fs.readFileSync(path.join(root, 'docs', `${name}.md`), 'utf8').trim();
  const text = markdown.replace(/^#+ /gm, '').replace(/\*\*/g, '').replace(/`/g, '');
  documents[name] = text;
  const title = text.split('\n')[0];
  const body = markdown.split(/\r?\n\r?\n/).map(block => {
    const tag = block.startsWith('# ') ? 'h1' : block.startsWith('## ') ? 'h2' : 'p';
    const value = block.replace(/^#+ /, '').replace(/\*\*/g, '').replace(/`/g, '');
    return `<${tag}>${escape(value).replace(/\r?\n/g, '<br>')}</${tag}>`;
  }).join('\n');
  fs.writeFileSync(path.join(root, 'docs/legal', `${name}.html`), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title>
<style>body{max-width:760px;margin:40px auto;padding:0 20px;font:17px/1.7 system-ui,sans-serif;color:#1e293b;background:#fafafa}h1{line-height:1.2}h2{margin-top:32px;font-size:22px}p{overflow-wrap:anywhere}a{color:#1d4ed8}</style></head>
<body><main>${body}</main><nav><a href="privacy-policy.html">Privacy Policy</a> · <a href="terms-of-use.html">Terms of Use</a></nav></body></html>\n`);
}
fs.writeFileSync(path.join(root, 'src/data/legal.json'), `${JSON.stringify(documents, null, 2)}\n`);
