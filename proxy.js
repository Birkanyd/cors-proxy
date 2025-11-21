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

  console.log("İstek yapılıyor:", targetURL);

  // URL'in ana domainini bul (Referer için lazım)
  let origin = "";
  try {
      origin = new URL(targetURL).origin;
  } catch (e) {
      origin = targetURL;
  }

  // MASKELEME AYARLARI (Burası çok önemli)
  const options = {
    url: targetURL,
    headers: {
      // Karşı siteye "Ben en güncel iPhone'um" diyoruz
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
      // "Ben senin kendi sitenden geliyorum" diyoruz
      'Referer': origin,
      'Origin': origin,
      'Accept': '*/*',
      'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
    },
    // Bazı SSL hatalarını görmezden gel (Güvenlik duvarlarını aşmak için)
    strictSSL: false
  };

  request(options)
    .on("response", (response) => {
      // Hata 1005 veya 403 alırsak loglara yazalım
      if (response.statusCode >= 400) {
         console.log("Karşı site hata verdi:", response.statusCode);
      }
      
      // Karşıdan gelen başlıkları iPhone'a ilet
      if (response.headers["content-type"]) {
        res.setHeader("Content-Type", response.headers["content-type"]);
      }
      res.setHeader("Access-Control-Allow-Origin", "*");
    })
    .on("error", (err) => {
      console.error("Sunucu hatası:", err);
      res.status(500).send("Hata oluştu: " + err.message);
    })
    .pipe(res);
});

app.get("/", (req, res) => {
  res.send("CORS PROXY (MASKELİ) ÇALIŞIYOR ✔");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Sunucu ayakta:", PORT));
