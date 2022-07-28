const path = require("path");
const solc = require("solc");
const fs = require("fs-extra"); // fs-extra have some extra functionallity from fs that's why we use fx-extra

const buildPath = path.resolve(__dirname, "build"); // resolve the path of directory build
fs.removeSync(buildPath); // before compile we remove whole compiled code present in build folder

const campaignPath = path.resolve(__dirname, "contracts", "Campaign.sol"); // contract address

const source = fs.readFileSync(campaignPath, "utf-8"); // read contract file
const output = solc.compile(source, 1).contracts; // compile the contract and store in output

fs.ensureDirSync(buildPath); // create folder build if folder not exiest

for (let contract in output) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(":", "") + ".JSON"), //address with file name
    output[contract] // this is content that store in above specified path and file name
  );
}
