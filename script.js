// Data
var colors;
var groups;
var images;

// D3 Selections
var swatches;
var gridImageContainers;
var gridTexts;
var links;

async function setup() {
  await parseData();
  drawSwatches();
  drawGrids();
  drawLinks();
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
      .attr("src", c => "./assets/swatches/" + c.swatch)
      .on("click", (event, c) => {
        event.stopPropagation();
        update(c);
      })
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
    .attr("class", "relative h-100 pointer dim")
    .on("click", (event, c) => {
      event.stopPropagation();
      update(c);
    });

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

function drawLinks() {
  var gridBBox = getBoundingBox("grids");
  links = d3
    .select("#links")
    .attr("width", gridBBox.width)
    .attr("height", gridBBox.height);
}

// Update UI

function update(activeColor) {
  updateSwatches(activeColor);
  updateGrids(activeColor);
  updateLinks(activeColor);
}

function updateSwatches(activeColor) {
  if (activeColor) {
    swatches
      .classed("ba bw1 b--orange", (c) => c.id == activeColor.id)
      .classed(
        "o-10",
        (c) => !(c.id == activeColor.id || activeColor.parts.includes(c.id))
      )
      .classed(
        "dim",
        (c) => c.id == activeColor.id || activeColor.parts.includes(c.id)
      );
  } else {
    swatches
      .classed("ba bw1 b--orange", false)
      .classed("o-10", false)
      .classed("dim", true);
  }
}

function updateGrids(activeColor) {
  if (activeColor) {
    gridImageContainers
      .classed("ba bw1 b--orange", (c) => c.id == activeColor.id)
      .classed(
        "o-10",
        (c) => !(c.id == activeColor.id || activeColor.parts.includes(c.id))
      )
      .classed(
        "dim",
        (c) => c.id == activeColor.id || activeColor.parts.includes(c.id)
      );
    gridTexts
      .classed("orange", (c) => c.id == activeColor.id)
      .classed(
        "o-10",
        (c) => !(c.id == activeColor.id || activeColor.parts.includes(c.id))
      );
    document
      .getElementById("grid-image-" + activeColor.id)
      .scrollIntoView({ behavior: "smooth", inline: "center" });
  } else {
    gridImageContainers
      .classed("ba bw1 b--orange", false)
      .classed("o-10", false)
      .classed("dim", true);
    gridTexts.classed("orange", false).classed("o-10", false);
  }
}

function updateLinks(activeColor) {
  if (activeColor) {
    d3.select("#links").selectAll("path").remove();

    var connections = document.getElementById("connections");
    var connectionsBBox = getBoundingBox("connections");

    var sourceBBox = getBoundingBox("grid-image-" + activeColor.id);

    var linkGenerator = d3.linkHorizontal();

    for (var i = 0; i < activeColor.parts.length; i++) {
      var targetBBox = getBoundingBox("grid-image-" + activeColor.parts[i]);

      var sourceX = connections.scrollLeft + sourceBBox.x;
      var sourceY = sourceBBox.y - connectionsBBox.y;
      var targetX = connections.scrollLeft + targetBBox.x;
      var targetY = targetBBox.y - connectionsBBox.y;

      if (targetX < sourceX) {
        sourceY += sourceBBox.height / 2;
        targetX += targetBBox.width;
        targetY += targetBBox.height / 2;
      } else if (targetX == sourceX && targetY < sourceY) {
        sourceX += sourceBBox.width / 2;
        targetX += targetBBox.width / 2;
        targetY += targetBBox.height;
      } else if (targetX == sourceX && targetY > sourceY) {
        sourceX += sourceBBox.width / 2;
        sourceY += sourceBBox.height;
        targetX += targetBBox.width / 2;
      } else {
        sourceX += sourceBBox.width;
        sourceY += sourceBBox.height / 2;
        targetY += targetBBox.height / 2;
      }

      var path = linkGenerator({
        source: [sourceX, sourceY],
        target: [targetX, targetY],
      });

      d3.select("#links")
        .append("path")
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "#ff6300");
    }
  } else {
    d3.select("#links").selectAll("path").remove();
  }
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

function getBoundingBox(id) {
  return document.getElementById(id).getBoundingClientRect();
}
