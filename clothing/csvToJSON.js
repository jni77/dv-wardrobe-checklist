const csvFilePath = "clothing/clothing.csv";
const csv = require("csvtojson");
const fs = require("fs");
csv()
  .fromFile(csvFilePath)
  .then((jsonObj) => {
    const data = JSON.stringify(jsonObj);
    fs.writeFile("src/clothing.json", data, (err) => {
      if (err) {
        throw err;
      }
      console.log("success");
    });
  });
