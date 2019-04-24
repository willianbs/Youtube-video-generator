const algorithmia = require("algorithmia");
const sentenceBoundaryDetection = require("sbd");
const algorithmiaApiKey = require("../credentials/algorithmia.json").apiKey;

async function robot(content) {
  await fetchContentFromSource(content); //wikipedia first
  sanitizeContent(content);
  breakContentIntoSentences(content);

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
}
module.exports = robot;
