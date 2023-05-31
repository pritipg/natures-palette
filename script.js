// Data
var colors;
var groups;
var images;

async function setup() {
  await parseData();
  drawSwatches();
}

async function parseData() {
  // parse colors
  colors = await d3.csv("./assets/data/colors.csv", (d) => {
    return {
      id: parseInt(d["ID"]),
      name: d["Name"],
      group: d["Group"],
      description: d["Description"],
      hexCode: d["Hex"],
      swatch: d["Color file"],
      animal: d["Animal"],
      mineral: d["Mineral"],
      vegetable: d["Vegetable"],
      teaser: parseInt(d["Teaser Image"]),
      parts: parseListString(d["Color IDs in color"]),
      images: parseListString(d["Image IDs"]),
    };
  });

  // parse images
  images = await d3.csv("./assets/data/images.csv", (d) => {
    return {
      id: parseInt(d["ID"]),
      author: d["Author"],
      title: d["Title"],
      url: d["URL"],
      file: d["Image file"],
    };
  });

  // unique color groups
  groups = _.uniq(colors.map((color) => color.group));
}

function parseListString(string) {
  if (string == "") {
    return [];
  }
  return string.split(",").map((s) => parseInt(s));
}

function drawSwatches() {}
