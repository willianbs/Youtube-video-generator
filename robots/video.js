const gm = require("gm").subClass({ imageMagick: true });
const hbjs = require("handbrake-js");
const state = require("./state");
const fs = require("fs");
const spawn = require("child_process").spawn;
const path = require("path");
const rootPath = path.resolve(__dirname, "..");

async function robot() {
  const content = state.load();
  await convertAllImages(content);
  await createAllSentenceImages(content);
  await createYoutubeThumbnail();
  await createAfterEffectsScript(content);
  await renderVideoWithAfterEffects();
  state.save(content);

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
        .out("-resize", `${width}x${height}^`)
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
  async function createAfterEffectsScript(content) {
    await state.saveScript(content);
  }
  function printProgress(progress) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(progress + "%");
  }
  async function renderVideoWithAfterEffects() {
    return new Promise((resolve, reject) => {
      const AERenderFilePath =
        "/Applications/Adobe After Effects CC 2019/aerender";
      const templateFilePath = `${rootPath}/templates/1/template.aep`;
      const destinationFilePathMOV = `${rootPath}/content/${content.searchTerm.replace(
        /\s/g,
        ""
      )}.mov`; //get searchTerm and removes white spaces
      const destinationFilePathMP4 = `${rootPath}/content/${content.searchTerm.replace(
        /\s/g,
        ""
      )}.mp4`;
      console.log(" > Starting After Effects...");
      const aerender = spawn(AERenderFilePath, [
        "-comp",
        "main",
        "-project",
        destinationFilePathMOV,
        "-output",
        destinationFilePath
      ]);
      aerender.stdout.on("data", data => {
        // process.stdout.write(data);
        printProgress(data);
      });
      aerender.stdout.on("close", data => {
        // process.stdout.write(data);
        printProgress(data);
        console.log(" > After Effects closed, convert to .mp4");
        hbjs
          .spawn({
            input: destinationFilePathMOV,
            output: destinationFilePathMP4
          })
          .on("error", err => {
            // invalid user input, no video found etc
            console.error(`Deu merda na conversão: ${err}`);
          })
          .on("progress", progress => {
            printProgress(
              `> Percent complete: ${progress.percentComplete}, ETA: ${
                progress.eta
              }`
            );
          })
          .on("complete", progress => {
            console.log(" > Encoding finished successfully");
            //remove big MOV file
            fs.unlinkSync(destinationFilePathMOV, err => {
              if (err) {
                console.error(`Deu merda na exclusão: ${err}`);
              }
              console.log(`> File MOV removed.`);
            });
            resolve();
          });
      });
    });
  }
}
module.exports = robot;
