import fs from 'fs';
let c = fs.readFileSync('/app/src/App.tsx', 'utf8');
c = c.replace('assumptions.some(a => a.status === "VERIFIED")', 'false');
fs.writeFileSync('/app/src/App.tsx', c);
console.log("App.tsx patched successfully");
