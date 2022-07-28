const assert = require("assert");
const Web3 = require("web3");
const ganache = require("ganache-cli");
const web3 = new Web3(ganache.provider());
const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: "1000000" });

  await factory.methods
    .createCampaign("100")
    .send({ from: accounts[0], gas: "1000000" });
  // [campaignAddress] store the first element of assigned array
  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
  );
});

describe("Campaigns", () => {
  it("deploys a factory and a campaigns", async () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it("mark caller as the campaign manager", async () => {
    assert.equal(accounts[0], await campaign.methods.manager().call());
  });

  it("Allow people to contribute money and mark them as a approvers", async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: "1000",
      gas: "1000000",
    });

    const isApprover = await campaign.methods.approvers(accounts[1]).call();
    assert(isApprover);
  });

  it("require a minimum contribution", async () => {
    try {
      await campaign.methods
        .contribute()
        .send({ from: accounts[1], value: "10", gas: "1000000" });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });
  it("Allow manager to create payment request", async () => {
    await campaign.methods
      .createRequest("Buy battery", 9999, accounts[2])
      .send({
        from: accounts[0],
        gas: "1000000",
      });
  });

  it("process request", async () => {
    await campaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei("5", "ether"),
      gas: "1000000",
    });
    await campaign.methods
      .createRequest("Buy battery", web3.utils.toWei("4", "ether"), accounts[1])
      .send({
        from: accounts[0],
        gas: "1000000",
      });

    await campaign.methods.approveRequest("0").send({
      from: accounts[0],
      gas: "1000000",
    });
    let initialBal = await web3.eth.getBalance(accounts[1]);
    initialBal = web3.utils.fromWei(initialBal, "ether");

    await campaign.methods.finalizeRequest("0").send({
      from: accounts[0],
      gas: "1000000",
    });

    let balance = await web3.eth.getBalance(accounts[1]);
    balance = web3.utils.fromWei(balance, "ether");
    balance = parseFloat(balance);
    const diff = balance - initialBal;
    console.log("initial Balance: ", initialBal, "\nbalance:", balance);
    assert(diff > 3.8);

    assert(await campaign.methods.approvers(accounts[0]).call()); // check address added to approver mapping
    const request = await campaign.methods.requests(0).call();
    assert.equal("Buy battery", request.description);
    assert.equal(1, request.approvalCount);
  });
});
