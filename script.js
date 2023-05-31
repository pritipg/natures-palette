// Data
var colors;
var groups;
var images;

async function setup() {
  await parseData();
}

async function parseData() {
  // parse colors
  // parse images

  colors = await d3.csv("./data/colors.csv", (d) => {
    console.log(d);
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
}

function parseListString(string) {
  if (string == "") {
    return [];
  }
  return string.split(",").map((s) => parseInt(s));
}
