//Orquestrator

//Getting robots
const robots = {
  input: require("./robots/input"),
  text: require("./robots/text"),
  state: require("./robots/state")
};
// Inits everything
async function start() {
  robots.input();
  await robots.text(); //awaits for the robot to execute before going forward
  const content = robots.state.load();
  console.dir(content, { depth: null });
}

start();
