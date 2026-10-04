import fs from "node:fs";

// cp1252 -> byte (only the 0x80-0x9F range differs from latin1)
const CP1252_REV = {
  "\u20AC": 0x80, "\u201A": 0x82, "\u0192": 0x83, "\u201E": 0x84, "\u2026": 0x85,
  "\u2020": 0x86, "\u2021": 0x87, "\u02C6": 0x88, "\u2030": 0x89, "\u0160": 0x8A,
  "\u2039": 0x8B, "\u0152": 0x8C, "\u017D": 0x8E, "\u2018": 0x91, "\u2019": 0x92,
  "\u201C": 0x93, "\u201D": 0x94, "\u2022": 0x95, "\u2013": 0x96, "\u2014": 0x97,
  "\u02DC": 0x98, "\u2122": 0x99, "\u0161": 0x9A, "\u203A": 0x9B, "\u0153": 0x9C,
  "\u017E": 0x9E, "\u0178": 0x9F,
};

// Returns the repaired string only if the text is genuine cp1252-mojibake
// (i.e. latin1/cp1252 bytes that decode as valid UTF-8); otherwise null.
function fixMojibake(str) {
  if (/[\u0080-\u00FF\u20AC\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026]/.test(str) === false) {
    return null; // all ASCII, nothing to do
  }
  const bytes = [];
  for (const ch of str) {
    const c = ch.codePointAt(0);
    if (c <= 0xff) bytes.push(c);
    else if (CP1252_REV[ch] !== undefined) bytes.push(CP1252_REV[ch]);
    else return null; // contains real non-cp1252 Unicode -> not a clean mojibake line
  }
  const out = Buffer.from(bytes).toString("utf8");
  if (out.includes("\uFFFD")) return null;
  return out;
}

const file = "public/javascript.js";
const raw = fs.readFileSync(file, "utf8");
const lines = raw.split("\n");
let changed = 0;
const out = lines.map((line) => {
  const hasCR = line.endsWith("\r");
  const core = hasCR ? line.slice(0, -1) : line;
  const fixed = fixMojibake(core);
  if (fixed && fixed !== core) { changed++; return hasCR ? fixed + "\r" : fixed; }
  return line;
});
fs.writeFileSync(file, out.join("\n"), "utf8");
console.log("lines changed:", changed);

// report leftovers (weak indicator -> manual review)
const markers = /Ã|â€|âœ|ðŸ|Æ|á»|áº|Ä|Â|á»|áº/;
const left = out.filter((l) => markers.test(l));
console.log("leftover suspicious lines:", left.length);
left.slice(0, 40).forEach((l, i) => console.log("  " + l.trim().slice(0, 110)));
