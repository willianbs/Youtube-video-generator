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
    const inputObject = {
      text: sentenceText,
      voice: "en-US"
    };
    const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
    const speechAlgorithm = algorithmiaAuthenticated.algo(
      "magicanded/algospeak/0.2.0?timeout=300"
    );
    const speechResponse = await speechAlgorithm.pipe(inputObject);
    const speechContent = speechResponse.get();
    var t = {
      isError: false,
      errorMessage: "Converting text to speech is completed successfully!",
      errorCode: "Success",
      results: {
        outputUrl:
          "https://soundoftext.nyc3.digitaloceanspaces.com/ed050870-6b70-11e9-8130-0582ccfcede9.mp3",
        outputFile:
          "data://.algo/magicanded/algospeak/temp/algospeak-output2935799914561371346.mp3",
        outputFileUrl:
          "https://algorithmia.com/v1/data/.algo%2Fmagicanded%2Falgospeak%2Ftemp%2Falgospeak-output2935799914561371346.mp3"
      }
    };
    //content.sentences[sentenceIndex].speech = speechContent.outputUrl;
    console.dir(speechContent, { depth: null });
  }
}
module.exports = robot;
