//Orquestrator

//Getting robots
const robots = {
  input: require("./robots/input"),
  text: require("./robots/text"),
  state: require("./robots/state"),
  image: require("./robots/image"),
  voice: require("./robots/text2speech"),
  video: require("./robots/video"),
  youtube: require("./robots/youtube")
};
// Inits everything
async function start() {
  robots.input();
  await robots.text(); //awaits for the robot to execute before going forward
  await robots.voice(); //identify sentences and convert to voice
  await robots.image(); //searches for imagens in context with the keywords returned from "robots.text()"
  await robots.video(); //create video assets and renders it
  await robots.youtube(); //upload to YT
}

start();
