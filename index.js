//Orquestrador

const readline = require("readline-sync");

function start() {
  const content = {};
  content.searchTerm = askAndReturnSearchTerm(); //what are we talking about?
  content.prefix = askAndReturnPrefix(); // making human friendly ;)
  function askAndReturnSearchTerm() {
    return readline.question("Type a term to talk about: ");
  }
  function askAndReturnPrefix() {
    const prefixes = ["Who is", "What is", "The history of"];
    const selectedPrefixIndex = readline.keyInSelect(
      prefixes,
      "Choose an option: "
    );
    const selectedPrefixText = prefixes[selectedPrefixIndex];
    return selectedPrefixText;
  }
  console.log(content);
}

start();
