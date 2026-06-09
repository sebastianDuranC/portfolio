const fs = require('fs');

function checkJS() {
  const code = fs.readFileSync('app.js', 'utf8');
  try {
    const acorn = require('acorn');
    acorn.parse(code, { ecmaVersion: 2020 });
    console.log("app.js syntax is valid");
  } catch (e) {
    console.error("Syntax Error in app.js:", e.message);
  }
}

function checkCSS() {
  // basic check, just looking for mismatched braces
  const code = fs.readFileSync('styles.css', 'utf8');
  const open = (code.match(/\{/g) || []).length;
  const close = (code.match(/\}/g) || []).length;
  console.log(`styles.css has ${open} { and ${close} }`);
}

checkJS();
checkCSS();
