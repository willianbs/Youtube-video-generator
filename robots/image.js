const imageDownloader = require("image-downloader");
const { google } = require("googleapis");
const customsearch = google.customsearch("v1");
const gm = require("gm").subClass({ imageMagick: true });
const state = require("./state");

const googleSearchCredentials = require("../credentials/google-search.json");

async function robot() {
  const content = state.load();

  await fetchImagesForAllSentences(content);
  await downloadAllImages(content);
  convertAllImages(content);
  createAllSentenceImages(content);
  createYoutubeThumbnail();

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
  async function convertAllImages(content) {
    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      await convertImage(sentenceIndex);
    }
  }
  async function convertImage(sentenceIndex) {
    return new Promise((resolve, reject) => {
      const inputFile = `./cache/${sentenceIndex}-original.png[0]`; //[0] is for getting the first frame if the file is a GIF
      const outputFile = `./cache/${sentenceIndex}-converted.png`;
      const width = 1920;
      const height = 1080;
      gm()
        .in(inputFile)
        .out("(")
        .out("-clone")
        .out("0")
        .out("-background", "white")
        .out("-blur", "0x9")
        .out("-resize", `${width}x${height}`)
        .out(")")
        .out("(")
        .out("-clone")
        .out("0")
        .out("-background", "white")
        .out("-resize", `${width}x${height}`)
        .out(")")
        .out("-delete", "0")
        .out("-gravity", "center")
        .out("-compose", "over")
        .out("-composite")
        .out("-extent", `${width}x${height}`)
        .write(outputFile, error => {
          if (error) return reject(error);
          console.log(
            `> [${sentenceIndex}] Image converted: ${inputFile} -> ${outputFile}`
          );
          resolve();
        });
    });
  }
  async function createAllSentenceImages(content) {
    for (
      let sentenceIndex = 0;
      sentenceIndex < content.sentences.length;
      sentenceIndex++
    ) {
      await createSentenceImage(
        sentenceIndex,
        content.sentences[sentenceIndex].text
      );
    }
  }
  async function createSentenceImage(sentenceIndex, sentenceText) {
    return new Promise((resolve, reject) => {
      const outputFile = `./cache/${sentenceIndex}-sentence.png`;
      const templateSettings = {
        0: {
          size: "1920x400",
          gravity: "center"
        },
        1: {
          size: "1920x1080",
          gravity: "center"
        },
        2: {
          size: "800x1080",
          gravity: "west"
        },
        3: {
          size: "1920x400",
          gravity: "center"
        },
        4: {
          size: "1920x1080",
          gravity: "center"
        },
        5: {
          size: "800x1080",
          gravity: "west"
        },
        6: {
          size: "1920x400",
          gravity: "center"
        }
      };
      gm()
        .out("-size", templateSettings[sentenceIndex].size)
        .out("-gravity", templateSettings[sentenceIndex].gravity)
        .out("-background", "transparent")
        .out("-fill", "white")
        .out("-kerning", "-1")
        .out(`caption:${sentenceText}`)
        .write(outputFile, error => {
          if (error) return reject(error);
          console.log(`> [${sentenceIndex}] Sentence created: ${outputFile}`);
          resolve();
        });
    });
  }
  async function createYoutubeThumbnail() {
    return new Promise((resolve, reject) => {
      gm()
        .in(`./cache/0-converted.png`)
        .write(`./cache/youtube-thumb.png`, error => {
          if (error) return reject(error);
          console.log(`> Created Thumb. `);
          resolve();
        });
    });
  }
}
module.exports = robot;
