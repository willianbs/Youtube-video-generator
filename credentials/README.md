# Credentials format

## Algorithmia

File: `algorithmia.json`
Url to generate: https://algorithmia.com/users/*YOUR_USERNAME*/credentials

```
{
  "apiKey": "YOUR_KEY_HERE"
}
```

## Watson Natural Language Understanding

File: `watson-nlu.json`
Url to generate: https://cloud.ibm.com/services/natural-language-understanding/

```
{
  "apikey": "YOUR_KEY_HERE",
  "url": "https://gateway.watsonplatform.net/natural-language-understanding/api"
}
```

## Google Custom Search

File: `google-search.json`
Url to generate: https://console.cloud.google.com/apis/credentials?

```
{
  "apiKey": "YOUR_KEY_HERE",
  "searchEngineId": "YOUR_SEARCH_ENGINE_ID"
}
```

## Google OAuth2

File: `google-youtube.json`
Url to download: https://console.cloud.google.com/apis/credentials

```
{
  "web": {
    "client_id": "YOUR_CLIENT_ID",
    "project_id": "PROJECT_NAME",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "YOUR_CLIENT_SECRET",
    "redirect_uris": ["YOUR_CALLBACK_RETURN_URI"],
    "javascript_origins": ["YOUR_CALLBACK_ORIGIN_URI"]
  }
}

```
