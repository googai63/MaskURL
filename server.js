const express = require("express");
const cheerio = require("cheerio");

const app = express();
const PORT = 3000;

const SURVEY_URL =
  "https://survey.zivaroresearch.com/surveyInitiate.php?gid=NzM1LTk4&pid=asdasd";

// Serve static front-end files
app.use(express.static("public"));

// Route to fetch survey
app.get("/survey", async (req, res) => {
  try {
    // Use built-in fetch in Node 22
    const response = await fetch(SURVEY_URL);
    const html = await response.text();

    const $ = cheerio.load(html);

    // Fix relative URLs for CSS, JS, images, forms
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
