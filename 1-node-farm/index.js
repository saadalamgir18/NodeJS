const fs = require("fs");
const http = require("http");
const url = require("url");
const slugify = require("slugify");
const replaceTemplet = require("./modules/replaceTemplate");

/*

///////////////////
File system
// blocking, synchronous way
const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);
const textOut = `this is what we know about the avocado:  ${textIn}.`;
fs.writeFileSync("./txt/output.txt", textOut);
// console.log("file has been written");
// non-blocking, asynchrounous
fs.readFile("./txt/start.txt", "utf-8", (err, data) => {
  console.log(data);
  fs.readFile(`./txt/${data}.txt`, "utf-8", (err, data2) => {
    fs.readFile(`./txt/append.txt`, "utf-8", (err, data3) => {
      console.log(data3);
      fs.writeFile("./txt/final.txt", `${data2} \n${data3}`, "utf-8", (err) => {
        console.log("file has been written async");
      });
    });
  });
});

console.log("will read file");
*/

//////////////////
// Server

const tempOverview = fs.readFileSync(
  "./templates/template-overview.html",
  "utf-8"
);
const tempProduct = fs.readFileSync(
  "./templates/template-product.html",
  "utf-8"
);
const tempCard = fs.readFileSync("./templates/template-card.html", "utf-8");
const data = fs.readFileSync("./dev-data/data.json", "utf-8");
const dataObj = JSON.parse(data);
// TODO
console.log(slugify("Fresh Avocado", { lower: true }));
const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);
const server = http.createServer((request, response) => {
  const { query, pathname } = url.parse(request.url, true);

  // overview page
  if (pathname === "/" || pathname === "/overview") {
    response.writeHead(202, {
      "Content-type": "text/html",
    });
    const cardsHtml = dataObj
      .map((el) => replaceTemplet(tempCard, el))
      .join("");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
    response.end(output);

    // product page
  } else if (pathname === "/product") {
    response.writeHead(202, {
      "Content-type": "text/html",
    });
    const product = dataObj[query.id];
    const output = replaceTemplet(tempProduct, product);
    response.end(output);

    //api
  } else if (pathname === "/api") {
    response.writeHead(200, {
      "Content-type": "application/json",
    });
    response.end(data);

    // not found
  } else {
    response.writeHead(404, {
      "Content-type": "text/html",
    });
    response.end("<h1>page not found<h1>");
  }
});
server.listen(8000, "127.0.0.1", () => {
  console.log("listening to request on port 8000");
});
