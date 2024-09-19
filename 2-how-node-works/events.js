const EventEmitter = require("events");
const myEmitter = new EventEmitter();
myEmitter.on("newSale", () => {
  console.log("There was a new sale");
});
myEmitter.on("newSale", () => {
  console.log("Costumer name: Saad");
});
myEmitter.on("newSale", (stock) => {
  console.log(`there are ${stock} items left in the stocs`);
});
myEmitter.emit("newSale", 9);
