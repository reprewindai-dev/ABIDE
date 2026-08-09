import fs from 'fs';
let c = fs.readFileSync('/app/src/App.tsx', 'utf8');
c = c.replace('const errData = await response.json();', 'let errData; try { errData = await response.json(); } catch(e) { throw new Error("Server returned status " + response.status + " " + response.statusText + " with an invalid non-JSON format (possibly an API Gateway Timeout). Try breaking your input into smaller parts."); }');
fs.writeFileSync('/app/src/App.tsx', c);
console.log("App.tsx patched for HTML error handling successfully");
