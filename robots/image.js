const imageDownloader = require("image-downloader");
const { google } = require("googleapis");
const customsearch = google.customsearch("v1");
const state = require("./state");

const googleSearchCredentials = require("../credentials/google-search.json");

async function robot() {
  const content = state.load();

  await fetchImagesForAllSentences(content);
  await downloadAllImages(content);
  state.save(content);

  async function fetchImagesForAllSentences(content) {
    for (const sentence of content.sentences) {
      const query = `${content.searchTerm} ${sentence.keywords[0]}`;
      sentence.images = await fetchGoogleAndReturnImagesLinks(query);
      sentence.googleSearchQuery = query;
    }
  }

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
            throw new Error("Imagem Já baixada");

          await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`);
          content.downloadedImages.push(imageUrl);
          console.log(
            `> [${sentenceIndex}][${imageIndex}] Download concluído: ${imageUrl}`
          );
          break;
        } catch (error) {
          console.warn(
            `> [${sentenceIndex}][${imageIndex}] Erro ao baixar: ${imageUrl}: ${error}`
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
