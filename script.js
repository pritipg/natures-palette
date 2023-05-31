// Data
var colors;
var groups;
var images;

// D3 Selections
var swatches;
var gridImageContainers;
var gridTexts;

async function setup() {
  await parseData();
  drawSwatches();
  drawGrids();
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

function drawSwatches() {
  // prettier-ignore
  swatches = d3.select("#swatches")
    .selectAll("img")
    .data(colors)
    .enter()
    .append("img")
      .attr("class", "mr1 w2 h2 pointer dim")
      .attr("src", c => "./assets/swatches/" + c.swatch);
}

function drawGrids() {
  // prettier-ignore-start
  var gridGroups = d3
    .select("#grids")
    .selectAll("div")
    .data(groups)
    .enter()
    .append("div")
    .attr("class", "br b--black-10");

  gridGroups
    .append("h2")
    .attr("class", "f4 fw5 ph3 pb3 mv0")
    .text((g) => g);

  var gridGroupContents = gridGroups
    .append("div")
    .attr("class", "ph3 image-grid");

  var gridContentCards = gridGroupContents
    .selectAll("div")
    .data((g) => colors.filter((c) => c.group == g))
    .enter()
    .append("div")
    .attr("class", "image-grid-item")
    .style("grid-row", (c, i) => getRowIndex(i))
    .style("grid-column", (c, i) => getColIndex(i));

  gridImageContainers = gridContentCards
    .append("div")
    .attr("id", (c) => "grid-image-" + c.id)
    .attr("class", "relative h-100 pointer dim");

  gridImageContainers
    .append("img")
    .attr("src", (c) => "./assets/photos/" + getImage(c.teaser).file);

  gridImageContainers
    .append("img")
    .attr("class", "absolute bottom-0 right-0 w2 h2")
    .attr("src", (c) => "./assets/swatches/" + c.swatch);

  gridTexts = gridContentCards
    .append("h3")
    .attr("class", "mv0 f7 fw4 pv1 dark-gray lh-copy")
    .text((c) => c.name);

  //prettier-ignore-end
}

// Helpers

function getRowIndex(index) {
  var mod = index % 3;
  if (mod == 0) return 1;
  if (mod == 1) return 3;
  if (mod == 2) return 2;
}

function getColIndex(index) {
  var mod = index % 3;
  var col = 2 * Math.floor(index / 3);
  if (mod == 0) return col + 1;
  if (mod == 1) return col + 1;
  if (mod == 2) return col + 2;
}

function getImage(id) {
  return images.find((image) => image.id == id);
}
