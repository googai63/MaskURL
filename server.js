const express = require("express");
const cheerio = require("cheerio");
const fetch = require("node-fetch");

const app = express();
const PORT = 3000;

const BASE_SURVEY_URL =
  "https://survey.zivaroresearch.com/surveyInitiate.php?gid=NzM1LTk4";

app.use(express.static("public"));

app.get("/survey", async (req, res) => {
  try {
    const { pid } = req.query;
    if (!pid) return res.status(400).send("Missing pid");

    const surveyUrl = `${BASE_SURVEY_URL}&pid=${encodeURIComponent(pid)}`;
    const response = await fetch(surveyUrl);
    const html = await response.text();
    const $ = cheerio.load(html);

   
    const customImg =
      "https://datanexaresearch.com/wp-content/uploads/2025/12/Transparent-1-120x80.png";
    $("img").each((i, el) => {
      $(el).attr("src", customImg);
      $(el).attr("alt", "My Custom Image");
    });

    $("input[type='image']").each((i, el) => {
      $(el).attr("src", customImg);
      $(el).attr("alt", "My Custom Image");
    });

    $("[style]").each((i, el) => {
      const style = $(el).attr("style");
      if (style && style.includes("background-image")) {
        const newStyle = style
          .split(";")
          .filter((s) => !s.includes("background-image"))
          .join(";");
        $(el).attr("style", newStyle);
      }
    });

    $("head").append(`
      <style>
        * { background-image: none !important; }
      </style>
    `);

    if ($("title").length) {
      $("title").text("My Survey");
    } else {
      $("head").append("<title>My Survey</title>");
    }

    const faviconUrl =
      "https://datanexaresearch.com/wp-content/uploads/2025/12/Transparent-1-120x80.png";
    if ($("link[rel='icon']").length) {
      $("link[rel='icon']").attr("href", faviconUrl);
    } else {
      $("head").append(
        `<link rel="icon" href="${faviconUrl}" type="image/png">`
      );
    }

    $("link[href], script[src], a[href], form[action]").each((i, el) => {
      const attr =
        el.name === "form" ? "action" : el.attribs.href ? "href" : "src";

      if (!attr) return;

      const url = $(el).attr(attr);
      if (url && url.startsWith("/")) {
        $(el).attr(attr, "https://survey.zivaroresearch.com" + url);
      }
    });

    res.send($.html());
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching survey");
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
