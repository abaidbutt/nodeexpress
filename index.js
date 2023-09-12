const express = require("express");
const app = express();
const multer = require("multer");
const fs = require("fs");
// respond with "hello world" when a GET request is made to the homepage
app.get("/", (req, res) => {
  res.send("hello world");
});
const csv = require("csvtojson");
const path = require("path");
const qrcode = require("qrcode");

const websiteUrl = "https://example.com/";
app.get("/qr", (req, res) => {
  qrcode.toFile(
    "keventers.png",
    websiteUrl,
    {
      color: {
        dark: "#CE9B66", // QR code color
        light: "#ffffff", // Background color
      },
    },
    (err) => {
      if (err) throw err;
      console.log("QR code saved!");
    }
  );
});

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
let maxSize = 10000 * 1024 * 1024;
const csvFilter = function (req, file, callback) {
  var ext = path.extname(file.originalname);
  if (ext !== ".csv") {
    return callback("This Extension is not supported");
  }
  callback(null, true);
};

var csvtojsonupload = multer({
  storage: fileStorage,
  fileFilter: csvFilter,
});

app.post("/csvtojson", csvtojsonupload.single("file"), async (req, res) => {
  try {
    // let writeDir = servePath("public/" + Date.now() + "output.json");
    // const csvFilePath = servePath(req.file.path);
    // console.log(csvFilePath, writeDir);
    console.log(req.file.path);
    const data = await csv().fromFile(
      path.join(__dirname + `/${req.file.path}`)
    );
    let writeFile = fs.writeFileSync(
      path.join(__dirname + "/public/output.json"),
      JSON.stringify({ data }, null, 2)
    );

    console.log(
      writeFile,
      "thi data",
      path.join(__dirname + "/public/output.json"),
      req.user
    );

    var buffer = fs.readFileSync(path.join(__dirname + "/public/output.json"));
    var bufferBase64 = Buffer(buffer);
    console.log(bufferBase64);
    res.json({ bufferBase64 });

    // const options = {
    //   root: path.join(__dirname, "public"),
    //   dotfiles: "deny",
    //   headers: {
    //     "x-timestamp": Date.now(),
    //     "x-sent": true,
    //   },
    // };

    // res.sendFile("output.json", options, (err) => {
    //   if (err) {
    //     console.log(err, "ti");
    //   } else {
    //     console.log("Sent:", "thisfile");
    //   }
    // });

    // res.json({ hello: "hi" });
    // fs.unlinkSync(path.join(__dirname + "/public/output.json"));
    // fs.unlinkSync(path.join(__dirname + `/${req.file.path}`));
    console.log("done");
  } catch (err) {
    console.log(err);
    res.json({ err });
  }
});
app.listen(5000);
