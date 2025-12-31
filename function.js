import fs from "node:fs/promises";
import {randomShuffle} from "chatujs";

let nums = "";
let arr =[];

for(let i = 500; i <= 5000; i++){
   arr.push(i);
}

randomShuffle(arr);

nums = arr.join(" ");

fs.writeFile("./loadFile.txt", nums, "utf-8");


