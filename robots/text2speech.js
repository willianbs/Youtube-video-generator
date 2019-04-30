const algorithmia = require("algorithmia");
const state = require("./state");

const algorithmiaApiKey = require("../credentials/algorithmia.json").apiKey;

async function robot() {
  const content = state.load();
  await getSpeechFromSentences(content);
  state.save(content);

  async function getSpeechFromSentences(content) {
    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      await createSpeechFromSentence(
        sentenceIndex,
        content.sentences[sentenceIndex].text
      );
    }
  }
  async function createSpeechFromSentence(sentenceIndex, sentenceText) {
    // algorithmia.client("simOmVbMYBteS6bKble+QQwwXBb1")
    // .algo("magicanded/algospeak/0.2.0?timeout=300") // timeout is optional
    // .pipe(input)
    // .then(function(response) {
    //     console.log(response.get());
    // });
    const inputObject = {
      text: sentenceText,
      voice: "en-US"
    };
    const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
    const speechAlgorithm = algorithmiaAuthenticated.algo(
      "magicanded/algospeak/0.2.0"
    );
    const speechResponse = await speechAlgorithm.pipe(inputObject);
    const speechContent = speechResponse.get();
    content.sourceContentOriginal = wikipediaContent.content;
  }
}
module.exports = robot;
