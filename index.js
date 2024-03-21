import express from "express";
import axios from "axios";
import { load } from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------- Manga info ---------------------------- //
const PANINI_URL = process.env.PANINI_URL;

const CURRENT_PAGE = process.env.CURRENT_PAGE;
const CURRENT_PAGE_CHILD = process.env.CURRENT_PAGE_CHILD;
const LAST_PAGE = process.env.LAST_PAGE;
const LAST_PAGE_CHILD = process.env.LAST_PAGE_CHILD;
const OR_LAST_PAGE = process.env.OR_LAST_PAGE;
const OR_LAST_PAGE_CHILD = process.env.OR_LAST_PAGE_CHILD;
const PER_PAGE = process.env.PER_PAGE;
const PER_PAGE_CHILD = process.env.PER_PAGE_CHILD;
const TOTAL_PAGES = process.env.TOTAL_PAGES;

const MANGA_ITEMS = process.env.MANGA_ITEMS;
const MANGA_NAME = process.env.MANGA_NAME;
const MANGA_PRICE = process.env.MANGA_PRICE;
const MANGA_IMAGE = process.env.MANGA_IMAGE;
const MANGA_URL = process.env.MANGA_URL;
const MANGA_PRE_SALE = process.env.MANGA_PRE_SALE;

// -------------------------------------------------------------------- //

app.get("/", async (req, res) => {
  const pageNum = req.query.page || 1;
  const listItemsNum = req.query.items || 12;

  const mangaList = {
    pagination: {},
    data: [],
  };

  const data = await axios.get(
    `${PANINI_URL}?p=${pageNum}&product_list_limit=${listItemsNum}`
  );
  const $ = load(data.data);

  mangaList.pagination = {
    current_page: $(CURRENT_PAGE_CHILD, CURRENT_PAGE).children().last().html(),
    last_page:
      $(LAST_PAGE_CHILD, LAST_PAGE).last().html() ||
      $(OR_LAST_PAGE_CHILD, OR_LAST_PAGE).last().children().last().html(),

    items: {
      per_page: $(PER_PAGE_CHILD, PER_PAGE).html(),
      total: $(`#${TOTAL_PAGES}`).children().last().html(),
    },
  };

  $(MANGA_ITEMS).each((i, item) => {
    const name = $(MANGA_NAME, item).text();
    const price = $(MANGA_PRICE, item).text();
    const image = $(MANGA_IMAGE, item).attr("src");
    const url = $(MANGA_URL, item).attr("href");
    const pre_sale = $(MANGA_PRE_SALE).html() ? true : false;

    if (!name) return;

    mangaList.data.push({
      name,
      price,
      image: image?.split("?", 1).toString(),
      url,
      pre_sale,
    });
  });

  res.send(mangaList);
});

app.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});
