//Orquestrator

//Getting robots
const robots = {
  input: require("./robots/input"),
  text: require("./robots/text"),
  state: require("./robots/state"),
  image: require("./robots/image")
};
// Inits everything
async function start() {
  robots.input();
  await robots.text(); //awaits for the robot to execute before going forward
  await robots.image(); //searches for imagens in context with the keywords returned from "robots.text()"
  const content = robots.state.load();
  console.dir(content, { depth: null });
}

start();
