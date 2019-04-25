const readline = require("readline-sync");
const state = require("./state");

function robot() {
  const content = {
    maxSentences: 7
  };
  content.searchTerm = askAndReturnSearchTerm(); //what are we talking about?
  content.prefix = askAndReturnPrefix(); // making human friendly ;)
  state.save(content); //saves data to disc (can use SQL later, this is just a POC)

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
}

module.exports = robot;
