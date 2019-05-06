const state = require("./state");
const google = require("googleapis").google;
const youtube = google.youtube({ version: "v3" });
const OAuth2 = google.auth.OAuth2;
const express = require("express");
const fs = require("fs");
const path = require("path");
const rootPath = path.resolve(__dirname, "..");

async function robot() {
  console.log(`[YOUTUBE SYSTEM] Starting...`);
  const content = state.load();
  await authenticateWithOAuth2();
  const videoInformation = await uploadVideo(content);
  await uploadThumbnail(videoInformation);

  function printProgress(progress) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(progress + "%");
  }
  async function authenticateWithOAuth2() {
    const webServer = await startWebServer();
    const OAuthClient = await createOAuth2Client();
    requestUserConsent(OAuthClient);
    const authorizationToken = await waitForGoogleCallback(webServer);
    await requestGoogleForAccessToken(OAuthClient, authorizationToken);
    await setGlobalGoogleAuthentication(OAuthClient);
    await stopWebserver(webServer);

    async function startWebServer() {
      return new Promise((resolve, reject) => {
        const port = 5000;
        const app = express();

        const server = app.listen(port, () => {
          console.log(
            `[YOUTUBE SYSTEM] Listening on: http://localhost:${port}`
          );
          resolve({
            app,
            server
          });
        });
      });
    }

    async function createOAuth2Client() {
      const credentials = require("../credentials/google-youtube.json");
      const OAuthClient = new OAuth2(
        credentials.web.client_id,
        credentials.web.client_secret,
        credentials.web.redirect_uris[0]
      );
      return OAuthClient;
    }

    function requestUserConsent(OAuthClient) {
      const consentUrl = OAuthClient.generateAuthUrl({
        access_type: "offline",
        scope: "https://www.googleapis.com/auth/youtube"
      });

      console.log(`[YOUTUBE SYSTEM] Please, give your consent: ${consentUrl}`);
    }

    async function waitForGoogleCallback(webServer) {
      return new Promise((resolve, reject) => {
        console.log(`[YOUTUBE SYSTEM] Waiting for user consent...`);
        webServer.app.get("/oauth2callback", (req, res) => {
          const authCode = req.query.code;
          console.log(`> consent given: ${authCode}`);
          res.send("<h1>Thank you</h1><p>Now you can close this tab ;)</p>");
          resolve(authCode);
        });
      });
    }
    async function requestGoogleForAccessToken(
      OAuthClient,
      authorizationToken
    ) {
      return new Promise((resolve, reject) => {
        OAuthClient.getToken(authorizationToken, (error, tokens) => {
          if (error) reject(error);

          console.log(`[YOUTUBE SYSTEM] Access Tokens received:`);
          console.log(tokens);

          OAuthClient.setCredentials(tokens);
          resolve();
        });
      });
    }
    function setGlobalGoogleAuthentication(OAuthClient) {
      google.options({
        auth: OAuthClient
      });
    }
    async function stopWebserver(webServer) {
      return new Promise((resolve, reject) => {
        webServer.server.close(() => {
          resolve();
        });
      });
    }
  }
  async function uploadVideo(content) {
    const videoFilePath = `${rootPath}/content/${content.searchTerm.replace(
      /\s/g,
      ""
    )}.mp4`; //remove white spaces of the name
    const videoFileSize = fs.statSync(videoFilePath).size;
    const videoTitle = `${content.prefix} ${content.searchTerm}`;
    const videoTags = [content.searchTerm, ...content.sentences[0].keywords];
    const videoDescription = content.sentences
      .map(sentence => {
        return sentence.text;
      })
      .join("\n\n");

    const requestParameters = {
      part: "snippet, status",
      requestBody: {
        snippet: {
          title: videoTitle,
          description: videoDescription,
          tags: videoTags
        },
        status: {
          privacyStatus: "unlisted"
        }
      },
      media: {
        body: fs.createReadStream(videoFilePath)
      }
    };
    console.log(`[YOUTUBE SYSTEM] Starting to upload video...`);
    const youtubeResponse = await youtube.videos.insert(requestParameters, {
      onUploadProgress: onUploadProgress
    });
    //printProgress(o)

    console.log(
      `[YOUTUBE SYSTEM] Video available at: https://youtu.be/${
        youtubeResponse.data.id
      }`
    );
    return youtubeResponse.data;
    function onUploadProgress(event) {
      const progress = Math.round((event.bytesRead / videoFileSize) * 100);
      printProgress(`[YOUTUBE SYSTEM] Uploading progress: ${progress}`);
    }
  }
  async function uploadThumbnail(videoInformation) {
    const videoId = videoInformation.id;
    const videoThumbnailFilePath = "./cache/youtube-thumb.png";
    const requestParameters = {
      videoId: videoId,
      media: {
        mimetype: "image/png",
        body: fs.createReadStream(videoThumbnailFilePath)
      }
    };
    const youtubeResponse = await youtube.thumbnails.set(requestParameters);
    console.log(`[YOUTUBE SYSTEM] Thumbnail uploaded`);
  }
}

module.exports = robot;
