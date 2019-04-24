//Orquestrator

const readline = require("readline-sync");

//Getting robots
const robots = {
  text: require("./robots/text")
};

async function start() {
  const content = {
    maxSentences = 7
  };
  content.searchTerm = askAndReturnSearchTerm(); //what are we talking about?
  content.prefix = askAndReturnPrefix(); // making human friendly ;)

  await robots.text(content); //awaits for the robot to execute before going forward
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
