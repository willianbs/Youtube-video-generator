const algorithmia = require("algorithmia");
const NaturalLanguageUnderstandingV1 = require("watson-developer-cloud/natural-language-understanding/v1.js");
const sentenceBoundaryDetection = require("sbd"); //identify sentences from blocks of text

const algorithmiaApiKey = require("../credentials/algorithmia.json").apiKey;
const watsonApiKey = require("../credentials/watson-nlu.json").apikey;
const watsonURL = require("../credentials/watson-nlu.json").url;

const state = require("./state");

// using Watson to understand and extract keywords from the text
const nlu = new NaturalLanguageUnderstandingV1({
  version: "2018-11-16",
  iam_apikey: watsonApiKey,
  url: watsonURL
});
//run robot
async function robot() {
  const content = state.load();

  await fetchContentFromSource(content); //wikipedia first
  sanitizeContent(content); //remove blank lines and markdown and dates in parenthesis
  breakContentIntoSentences(content); //transform full block of text into readable sentences
  limitMaximunSenteces(content); //limits the number of sentences to not overuse the API calls
  await fetchKeywordsOfAllSentences(content); //iterate & adds keywords to every sentence

  state.save(content);
  async function fetchContentFromSource(content) {
    const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
    const wikipediaAlgorithm = algorithmiaAuthenticated.algo(
      "web/WikipediaParser/0.1.2"
    );
    const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm);
    const wikipediaContent = wikipediaResponse.get();
    content.sourceContentOriginal = wikipediaContent.content;
  }
  function sanitizeContent(content) {
    const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(
      content.sourceContentOriginal
    );
    const withoutDatesInParentheses = removeDatesInParentheses(
      withoutBlankLinesAndMarkdown
    );

    content.sourceContentSanitized = withoutDatesInParentheses;

    function removeBlankLinesAndMarkdown(text) {
      const allLines = text.split("\n");

      const withoutBlankLinesAndMarkdown = allLines.filter(line => {
        if (line.trim().length === 0 || line.trim().startsWith("=")) {
          return false;
        }

        return true;
      });

      return withoutBlankLinesAndMarkdown.join(" ");
    }
  }

  function removeDatesInParentheses(text) {
    return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, "").replace(/  /g, " ");
  }

  function breakContentIntoSentences(content) {
    content.sentences = [];
    const sentences = sentenceBoundaryDetection.sentences(
      content.sourceContentSanitized
    );
    sentences.forEach(sentence => {
      content.sentences.push({
        text: sentence,
        keywords: [],
        images: []
      });
    });
  }
  function limitMaximunSenteces(content) {
    content.sentences = content.sentences.slice(0, content.maxSentences);
  }
  async function fetchKeywordsOfAllSentences(content) {
    for (const sentence of content.sentences) {
      sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text);
    }
  }
}

async function fetchWatsonAndReturnKeywords(sentence) {
  return new Promise((resolve, reject) => {
    nlu.analyze(
      {
        text: sentence,
        features: {
          keywords: {}
        }
      },
      (error, response) => {
        if (error) throw error;
        //console.log(JSON.stringify(response, null, 4));
        const keywords = response.keywords.map(keyword => {
          return keyword.text;
        });
        resolve(keywords);
      }
    );
  });
}

module.exports = robot;
