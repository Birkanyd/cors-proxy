const express = require('express');
const cors = require('cors');
const request = require('request');

const app = express();
app.use(cors());

app.get("/proxy", (req, res) => {
  const targetURL = req.query.url;
  if (!targetURL) {
    return res.status(400).send("Hata: ?url parametresi boş.");
  }

  console.log("Proxy isteği:", targetURL);

  request(targetURL)
    .on("response", (response) => {
      if (response.headers["content-type"]) {
        res.setHeader("Content-Type", response.headers["content-type"]);
      }
      res.setHeader("Access-Control-Allow-Origin", "*");
    })
    .on("error", (err) => {
      res.status(500).send("İstek hatası: " + err.message);
    })
    .pipe(res);
});

app.get("/", (req, res) => {
  res.send("CORS PROXY ÇALIŞIYOR ✔");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Sunucu ayakta:", PORT));
