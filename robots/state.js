const fs = require("fs");
const contentFilePath = "./content.json";

function save(content) {
  const contenteFileString = JSON.stringify(content);
  return fs.writeFileSync(contentFilePath, contenteFileString);
}
function load() {
  const fileBuffer = fs.readFileSync(contentFilePath, "utf-8");
  const contentJSON = JSON.parse(fileBuffer);
  return contentJSON;
}

module.exports = {
  save,
  load
};
