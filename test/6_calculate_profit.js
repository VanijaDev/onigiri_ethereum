/**
 * IMPORTANT - this file should be the last test.
 * In case of errors, just test this file ONLY.
 */


const Onigiri = artifacts.require("./Onigiri.sol");

const {
  time,
  ether,
  shouldFail
} = require("openzeppelin-test-helpers");

contract("View functions", (accounts) => {
  const DEV_0_MASTER = accounts[9];
  const DEV_1_MASTER = accounts[8];
  const DEV_0_ESCROW = accounts[7];
  const DEV_1_ESCROW = accounts[6];

  const INVESTOR_0 = accounts[5];
  const INVESTOR_1 = accounts[4];

  const REFERRAL_0 = accounts[3];
  const REFERRAL_1 = accounts[2];

  const OTHER_ADDR = accounts[1];

  let onigiri;

  beforeEach("setup", async () => {
    await time.advanceBlock();
    onigiri = await Onigiri.new();
  });

  describe("CalculateProfit - 0.5 ETH", () => {
    it("should get correct calculateProfit for 1 hour", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      await time.increase(time.duration.hours(1));
      assert.equal(0, ether("0.000105").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 0.000105 eth");
    });

    it("should get correct calculateProfit for 1 day", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      await time.increase(time.duration.days(1));
      assert.equal(0, ether("0.00252").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 day profit should be 0.00252 eth");
    });

    it("should get correct calculateProfit for 1 week", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      await time.increase(time.duration.weeks(1));
      assert.equal(0, ether("0.01764").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 week profit should be 0.01764 eth");
    });

    it("should get correct calculateProfit for 1 year", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      await time.increase(time.duration.years(1));
      // console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      assert.equal(0, ether("0.9198").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 year profit should be 0.9198 eth");
    });
  });

  describe("CalculateProfit - 2 ETH", () => {
    it("should get correct calculateProfit for 1 hour", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("2")
      });

      await time.increase(time.duration.hours(1));
      assert.equal(0, ether("0.000672").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 0.000672 eth");
    });

    it("should get correct calculateProfit for 1 day", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("2")
      });

      await time.increase(time.duration.days(1));
      assert.equal(0, ether("0.016128").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 day profit should be 0.016128 eth");
    });

    it("should get correct calculateProfit for 1 week", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("2")
      });

      await time.increase(time.duration.weeks(1));
      assert.equal(0, ether("0.112896").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 week profit should be 0.112896 eth");
    });

    it("should get correct calculateProfit for 1 year", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("2")
      });

      await time.increase(time.duration.years(1));
      assert.equal(0, ether("5.88672").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 year profit should be 5.88672 eth");
    });
  });


  /**
   * IMPORTANT: each of further tests should be run separately using "only".
   * 
   */
  describe("CalculateProfit - 105 ETH", () => {
    /**
      25 = .6% || .025 ~ .99
      40 = .96% || 1 ~ 100 
      50 = 1.2% || 101 ~ 250 
      75 = 1.8% || 251 ~ 500
      100 = 2.4% 501 ~ 

      return investors[_investor].lockbox.div(100000).mul(calculatedPercent);
    */

    /*
    it.only("should get correct calculateProfit for 1 hour", async () => {
      await web3.eth.sendTransaction({
        from: OTHER_ADDR,
        to: INVESTOR_0,
        value: ether("30")
      });
      await time.increase(time.duration.hours(1));

      // console.log((await web3.eth.getBalance(DEV_0_ESCROW)).toString());
      // console.log((await web3.eth.getBalance(OTHER_ADDR)).toString());

      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("125") //  105 in lockbox
      });

      await time.increase(time.duration.hours(1));

      // console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("0.0525").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 0.0525 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 day", async () => {
      await web3.eth.sendTransaction({
        from: OTHER_ADDR,
        to: INVESTOR_0,
        value: ether("30")
      });
      await time.increase(time.duration.hours(1));

      // console.log((await web3.eth.getBalance(DEV_0_ESCROW)).toString());
      // console.log((await web3.eth.getBalance(OTHER_ADDR)).toString());

      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("125") //  105 in lockbox
      });

      await time.increase(time.duration.days(1));

      // console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("1.26").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 day profit should be 1.26 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 week", async () => {
      await web3.eth.sendTransaction({
        from: OTHER_ADDR,
        to: INVESTOR_0,
        value: ether("30")
      });
      await time.increase(time.duration.hours(1));

      // console.log((await web3.eth.getBalance(DEV_0_ESCROW)).toString());
      // console.log((await web3.eth.getBalance(OTHER_ADDR)).toString());

      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("125") //  105 in lockbox
      });

      await time.increase(time.duration.weeks(1));

      // console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("8.82").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 week profit should be 8.82 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 year", async () => {
      await web3.eth.sendTransaction({
        from: OTHER_ADDR,
        to: INVESTOR_0,
        value: ether("30")
      });
      await time.increase(time.duration.hours(1));

      // console.log((await web3.eth.getBalance(DEV_0_ESCROW)).toString());
      // console.log((await web3.eth.getBalance(OTHER_ADDR)).toString());

      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("125") //  105 in lockbox
      });

      await time.increase(time.duration.years(1));

      // console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("459.9").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 year profit should be 459.9 eth");
    });
    */
  });

  describe("CalculateProfit - 260.4 ETH", () => {
    /**
      25 = .6% || .025 ~ .99
      40 = .96% || 1 ~ 100 
      50 = 1.2% || 101 ~ 250 
      75 = 1.8% || 251 ~ 500
      100 = 2.4% 501 ~ 

      return investors[_investor].lockbox.div(100000).mul(calculatedPercent);
    */

    /*
    it.only("should get correct calculateProfit for 1 hour", async () => {
      await web3.eth.sendTransaction({
        from: DEV_0_ESCROW,
        to: INVESTOR_0,
        value: ether("90")
      });

      await web3.eth.sendTransaction({
        from: DEV_1_ESCROW,
        to: INVESTOR_0,
        value: ether("90")
      });

      await web3.eth.sendTransaction({
        from: DEV_0_MASTER,
        to: INVESTOR_0,
        value: ether("90")
      });

      await time.increase(time.duration.hours(1));

      // console.log((await web3.eth.getBalance(DEV_0_ESCROW)).toString());
      // console.log((await web3.eth.getBalance(OTHER_ADDR)).toString());

      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("310") //  260.4 in lockbox
      });

      await time.increase(time.duration.hours(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("0.1953").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 0.1953 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 day", async () => {
      await web3.eth.sendTransaction({
        from: DEV_0_ESCROW,
        to: INVESTOR_0,
        value: ether("90")
      });

      await web3.eth.sendTransaction({
        from: DEV_1_ESCROW,
        to: INVESTOR_0,
        value: ether("90")
      });

      await web3.eth.sendTransaction({
        from: DEV_0_MASTER,
        to: INVESTOR_0,
        value: ether("90")
      });

      await time.increase(time.duration.hours(1));

      // console.log((await web3.eth.getBalance(DEV_0_ESCROW)).toString());
      // console.log((await web3.eth.getBalance(OTHER_ADDR)).toString());

      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("310") //  105 in lockbox
      });

      await time.increase(time.duration.days(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("4.6872").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 day profit should be 4.6872 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 week", async () => {
      await web3.eth.sendTransaction({
        from: DEV_0_ESCROW,
        to: INVESTOR_0,
        value: ether("90")
      });

      await web3.eth.sendTransaction({
        from: DEV_1_ESCROW,
        to: INVESTOR_0,
        value: ether("90")
      });

      await web3.eth.sendTransaction({
        from: DEV_0_MASTER,
        to: INVESTOR_0,
        value: ether("90")
      });

      await time.increase(time.duration.hours(1));

      // console.log((await web3.eth.getBalance(DEV_0_ESCROW)).toString());
      // console.log((await web3.eth.getBalance(OTHER_ADDR)).toString());

      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("310") //  105 in lockbox
      });

      await time.increase(time.duration.weeks(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("32.8104").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 week profit should be 32.8104 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 year", async () => {
      await web3.eth.sendTransaction({
        from: DEV_0_ESCROW,
        to: INVESTOR_0,
        value: ether("90")
      });

      await web3.eth.sendTransaction({
        from: DEV_1_ESCROW,
        to: INVESTOR_0,
        value: ether("90")
      });

      await web3.eth.sendTransaction({
        from: DEV_0_MASTER,
        to: INVESTOR_0,
        value: ether("90")
      });

      await time.increase(time.duration.hours(1));

      // console.log((await web3.eth.getBalance(DEV_0_ESCROW)).toString());
      // console.log((await web3.eth.getBalance(OTHER_ADDR)).toString());

      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("310") //  105 in lockbox
      });

      await time.increase(time.duration.years(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("1710.828").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 year profit should be 1,710.828 eth");
    });
    */
  });


  describe("CalculateProfit - 512.4 ETH", () => {
    /**
      25 = .6% || .025 ~ .99
      40 = .96% || 1 ~ 100 
      50 = 1.2% || 101 ~ 250 
      75 = 1.8% || 251 ~ 500
      100 = 2.4% 501 ~ 

      return investors[_investor].lockbox.div(100000).mul(calculatedPercent);
    */

    /*
    it.only("should get correct calculateProfit for 1 hour", async () => {
      await web3.eth.sendTransaction({
        from: DEV_0_ESCROW,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: DEV_1_ESCROW,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: DEV_0_MASTER,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: DEV_1_MASTER,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: REFERRAL_0,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: REFERRAL_1,
        to: INVESTOR_0,
        value: ether("99")
      });

      await time.increase(time.duration.hours(1));

      // console.log((await web3.eth.getBalance(DEV_0_ESCROW)).toString());
      // console.log((await web3.eth.getBalance(OTHER_ADDR)).toString());

      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("610") //  512.4 in lockbox
      });

      await time.increase(time.duration.hours(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("0.5124").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 0.5124 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 day", async () => {
      await web3.eth.sendTransaction({
        from: DEV_0_ESCROW,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: DEV_1_ESCROW,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: DEV_0_MASTER,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: DEV_1_MASTER,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: REFERRAL_0,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: REFERRAL_1,
        to: INVESTOR_0,
        value: ether("99")
      });

      await time.increase(time.duration.hours(1));

      // console.log((await web3.eth.getBalance(DEV_0_ESCROW)).toString());
      // console.log((await web3.eth.getBalance(OTHER_ADDR)).toString());

      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("610") //  105 in lockbox
      });

      await time.increase(time.duration.days(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("12.2976").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 day profit should be 12.2976 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 week", async () => {
      await web3.eth.sendTransaction({
        from: DEV_0_ESCROW,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: DEV_1_ESCROW,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: DEV_0_MASTER,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: DEV_1_MASTER,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: REFERRAL_0,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: REFERRAL_1,
        to: INVESTOR_0,
        value: ether("99")
      });

      await time.increase(time.duration.hours(1));

      // console.log((await web3.eth.getBalance(DEV_0_ESCROW)).toString());
      // console.log((await web3.eth.getBalance(OTHER_ADDR)).toString());

      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("610") //  105 in lockbox
      });

      await time.increase(time.duration.weeks(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("86.0832").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 week profit should be 86.0832 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 year", async () => {
      await web3.eth.sendTransaction({
        from: DEV_0_ESCROW,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: DEV_1_ESCROW,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: DEV_0_MASTER,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: DEV_1_MASTER,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: REFERRAL_0,
        to: INVESTOR_0,
        value: ether("99")
      });

      await web3.eth.sendTransaction({
        from: REFERRAL_1,
        to: INVESTOR_0,
        value: ether("99")
      });

      await time.increase(time.duration.hours(1));

      // console.log((await web3.eth.getBalance(DEV_0_ESCROW)).toString());
      // console.log((await web3.eth.getBalance(OTHER_ADDR)).toString());

      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("610") //  105 in lockbox
      });

      await time.increase(time.duration.years(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("4488.624").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 year profit should be 4,488.624 eth");
    });
    */
  });
});