import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  "0xAe93e31F222f0674FA67c5Ca86c46F285CDc3b0f"
);
export default instance;
