const { google } = require("googleapis");
const customsearch = google.customsearch("v1");
const state = require("./state");

const googleSearchCredentials = require("../credentials/google-search.json");

async function robot() {
  const content = state.load();

  await fetchImagesForAllSentences(content);
  state.save(content);

  async function fetchImagesForAllSentences(content) {
    for (const sentence of context.sentences) {
      const query = `${content.searchTerm} ${sentence.keywords[0]}`;
      sentence.images = fetchGoogleAndReturnImagesLinks(query);
      sentence.googleSearchQuery = query;
    }
  }

  console.dir(imagesArray, { depth: null });
  process.exit(0);

  async function fetchGoogleAndReturnImagesLinks(query) {
    const response = await customsearch.cse.list({
      //https://developers.google.com/apis-explorer/#p/customsearch/v1/search.cse.list
      auth: googleSearchCredentials.apiKey,
      cx: googleSearchCredentials.searchEngineId,
      q: query,
      searchType: "image",
      imgSize: "large", //size can be one of: icon, small, medium, large, xlarge, xxlarge, and huge
      num: 3 //Number of search results to return
    });
    const imagesUrl = response.data.items.map(item => {
      return item.link;
    });
    return imagesUrl;
  }
}
module.exports = robot;
