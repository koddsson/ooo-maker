#! /usr/bin/env node

const ArgumentParser = require("argparse").ArgumentParser;
const request = require("request");
const fs = require("fs");
const path = require("path");
const tmp = require("tmp");
const Canvas = require("canvas");
const Image = Canvas.Image;

let tmpImg = tmp.fileSync();
let tmpImagePath = tmpImg.name;

let parser = new ArgumentParser({
  addHelp: true,
  description: "OOO maker"
});
parser.addArgument(
  [ "-u", "--username" ],
  {
    help: "Your GitHub username",
    required: true
  }
);
parser.addArgument(
  [ "-d", "--date" ],
  {
    help: "The date in a month/day format",
    required: true
  }
);
let args = parser.parseArgs();
let username = args["username"];
let date = args["date"];

request.get(`http://www.github.com/${username}.png`)
       .on("error", function(error) {
         console.error("Something went wrong!");
         throw new error;
       })
       .on("response", function(response) {
         if (response.statusCode !== 200) {
           throw new TypeError(`Couldn't find a GitHub user called ${username}`);
         }
       })
       .pipe(fs.createWriteStream(tmpImagePath))
       .on("finish", function() {
         fs.readFile(tmpImagePath, function(err, avatar) {
           if (err) throw err;
           let img = new Image();
           img.src = avatar;
           let width = img.width;
           let height = img.height;

           let canvas = Canvas.createCanvas(width, height);
           let ctx = canvas.getContext("2d");
           ctx.globalAlpha = 0.6;
           ctx.drawImage(img, 0, 0);

           ctx.strokeStyle = "black";
           ctx.fillStyle = "black";
           ctx.fillRect(0, 0, width, height);

           ctx.globalAlpha = 1;
           ctx.font = "160px Helvetica";
           ctx.fillStyle = "rgba(255, 255, 255, 1)";

           ctx.fillText("OOO", 50, 130);
           ctx.fillText("until", 85, 270);

           let dateLen = date.length;
           let xPos = 0;

           switch (dateLen) {
             case 3: // like, 3/6
              xPos = 120;
              break;
             case 4: // like, 7/22
              xPos = 80;
              break;
             case 5: // like, 12/25 or 2/Jan
              xPos = 40;
              break;
             case 6: // like, 14/Dec
              ctx.font = "130px Helvetica";
              xPos = 40;
              break;
           }
           ctx.fillText(date, xPos, 430);

           let out = fs.createWriteStream(path.join(process.cwd(), `${username}.png`));

          //  ctx.drawImage(img, 0, 0);

           canvas.pngStream().pipe(out);
         });
       });
