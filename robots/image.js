const imageDownloader = require("image-downloader");
const { google } = require("googleapis");
const customsearch = google.customsearch("v1");
const state = require("./state");

const googleSearchCredentials = require("../credentials/google-search.json");

async function robot() {
  console.log("[IMAGE ANALYSIS] Starting...");
  const content = state.load();

  await fetchImagesForAllSentences(content);
  await downloadAllImages(content);

  state.save(content);

  async function fetchImagesForAllSentences(content) {
    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      let query;
      if (sentenceIndex === 0) query = `${content.searchTerm}`;
      else
        query = `${content.searchTerm} ${
          content.sentences[sentenceIndex].keywords[0]
        }`;
      console.log(`[IMAGE ANALYSIS] Querying Google Images with: "${query}"`);
      content.sentences[
        sentenceIndex
      ].images = await fetchGoogleAndReturnImagesLinks(query);
      content.sentences[sentenceIndex].images = query;
    }
  }

  async function fetchGoogleAndReturnImagesLinks(query) {
    const response = await customsearch.cse.list({
      //https://developers.google.com/apis-explorer/#p/customsearch/v1/search.cse.list
      auth: googleSearchCredentials.apiKey,
      cx: googleSearchCredentials.searchEngineId,
      q: query,
      //rights: "cc_publicdomain", //Filters based on licensing. Supported values include: cc_publicdomain, cc_attribute, cc_sharealike, cc_noncommercial, cc_nonderived and combinations of these.
      searchType: "image",
      imgSize: "large", //size can be one of: icon, small, medium, large, xlarge, xxlarge, and huge
      num: 3 //Number of search results to return
    });
    const imagesUrl = response.data.items.map(item => {
      return item.link;
    });
    return imagesUrl;
  }
  async function downloadAllImages(content) {
    content.downloadedImages = [];

    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      const images = content.sentences[sentenceIndex].images;

      for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
        const imageUrl = images[imageIndex];

        try {
          if (content.downloadedImages.includes(imageUrl))
            throw new Error("[IMAGE ANALYSIS] Image already downloaded");

          await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`);
          content.downloadedImages.push(imageUrl);
          console.log(
            `[IMAGE ANALYSIS] [${sentenceIndex}][${imageIndex}] Download finished: ${imageUrl}`
          );
          break;
        } catch (error) {
          console.warn(
            `[IMAGE ANALYSIS] [${sentenceIndex}][${imageIndex}] Error downloading: ${imageUrl}: ${error}`
          );
        }
      }
    }
  }
  async function downloadAndSave(url, filename) {
    return imageDownloader.image({
      url: url,
      dest: `./cache/${filename}`
    });
  }
}
module.exports = robot;
