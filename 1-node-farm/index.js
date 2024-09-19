const fs = require("fs");
const http = require("http");
const url = require("url");

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
const data = fs.readFileSync("./dev-data/data.json", "utf-8");
const dataObj = JSON.parse(data);
const server = http.createServer((request, response) => {
  console.log(request.url);
  const pathName = request.url;
  if (pathName === "/overview") {
    response.end("this is an Overview");
  } else if (pathName === "/product") {
    response.end("this is a product");
  } else if (pathName === "/api") {
    response.writeHead(200, {
      "Content-type": "application/json",
    });
    response.end(data);
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
