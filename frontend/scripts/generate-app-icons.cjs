// All install and touch icons are built from the same mark used in the app.
const sharp = require("sharp");
const path = require("node:path");
const root = path.resolve(__dirname, "../public");
Promise.all([192, 512, 180].map(size =>
  sharp(path.join(root, "echotale-mark.svg")).resize(size, size).png()
    .toFile(path.join(root, `echotale-icon-${size}.png`))
)).then(() => console.log("Generated EchoTale app icons.")).catch(error => { console.error(error); process.exitCode = 1; });
