const express = require('express')
const dotenv = require('dotenv')
dotenv.config()

const axios = require('axios')

const app = express()
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// function that return a bytes string from a number
function bytesToSize(bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** i;
  return value.toFixed(2) + ' ' + sizes[i];
}

app.get('/', (req, res) => {
  res.render('pages/index');
})

app.post('/', async (req, res) => {

  const { videoLink } = req.body;

  const videoLinkUrlObj = new URL(videoLink);
  const videoId = videoLinkUrlObj.searchParams.get('v') || videoLinkUrlObj.pathname.split('/')[1];

  if (videoId.length != 11) return res.render('pages/index', { error: 'Invalid video id' });

  const response = await axios.post('https://youtubei.googleapis.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8', {
    "context": {
      "client": {
        "hl": "en",
        "clientName": "WEB",
        "clientVersion": "2.20210721.00.00"
      }
    },
    "videoId": videoId,
  })

  var downloadLinks = [];

  for (var i = 0; i < response.data.streamingData.adaptiveFormats.length; i++) {
    var format = response.data.streamingData.adaptiveFormats[i];
    downloadLinks.push({
      link: format.url,
      quality: format.qualityLabel,
      size: bytesToSize(format.contentLength),
      type: format.mimeType.split(';')[0],
    });
  }

  res.render('pages/index', {
    downloadLinks,
    title: response.data.videoDetails.title,
    thumbnail: response.data.videoDetails.thumbnail.thumbnails[0].url,
  });

})

app.listen(port, () => {
  console.log(`Youtube Downloader started on port ${port}`)
})
