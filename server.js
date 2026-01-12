const express = require("express");
const cheerio = require("cheerio");

const app = express();
const PORT = 3000;

const BASE_SURVEY_URL =
  "https://survey.zivaroresearch.com/surveyInitiate.php?gid=NzM1LTk4";

app.use(express.static("public"));

app.get("/survey", async (req, res) => {
  try {
    const { pid } = req.query;

    if (!pid) {
      return res.status(400).send("Missing pid parameter");
    }

    const surveyUrl = `${BASE_SURVEY_URL}&pid=${encodeURIComponent(pid)}`;

    const response = await fetch(surveyUrl);
    const html = await response.text();

    const $ = cheerio.load(html);

    $("link[href], script[src], img[src], a[href], form[action]").each(
      (i, el) => {
        const attr =
          el.name === "form" ? "action" : el.attribs.href ? "href" : "src";

        if (!attr) return;

        let url = $(el).attr(attr);
        if (url && url.startsWith("/")) {
          $(el).attr(attr, "https://survey.zivaroresearch.com" + url);
        }
      }
    );

    res.send($.html());
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching survey");
  }
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
