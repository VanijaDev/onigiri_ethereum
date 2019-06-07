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

  describe("CalculateProfit - 0.42 ETH in lockbox", () => {
    /**
      ~ .99 -    - 0.6% = 25
      1 ~ 50     - 0.96% = 40
      51 ~ 100   - 1.2% = 50
      100 ~ 250  - 1.44% = 60
      250 ~      - 1.8% = 75 
    */
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

  describe("CalculateProfit - 1.68 ETH in lockbox", () => {
    /**
      ~ .99 -    - 0.6% = 25
      1 ~ 50     - 0.96% = 40
      51 ~ 100   - 1.2% = 50
      100 ~ 250  - 1.44% = 60
      250 ~      - 1.8% = 75
    */
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
  describe("CalculateProfit - 50.4 ETH in lockbox", () => {
    /**
      ~ .99 -    - 0.6% = 25
      1 ~ 50     - 0.96% = 40
      51 ~ 100   - 1.2% = 50
      100 ~ 250  - 1.44% = 60
      250 ~      - 1.8% = 75

      return investors[_investor].lockbox.div(100000).mul(calculatedPercent);
    */

    /*
    it.only("should get correct calculateProfit for 1 hour", async () => {
      //  1 - invest to get above 500 ETH
      for (let i = 0; i < 14; i++) {
        let addr;
        if (i < 2) {
          addr = OTHER_ADDR
        } else if (i < 4) {
          addr = REFERRAL_0;
        } else if (i < 6) {
          addr = REFERRAL_1;
        } else if (i < 8) {
          addr = DEV_0_ESCROW;
        } else if (i < 10) {
          addr = DEV_1_ESCROW;
        } else if (i < 12) {
          addr = DEV_0_MASTER;
        } else if (i < 14) {
          addr = INVESTOR_1;
        }

        await onigiri.invest(REFERRAL_0, {
          from: addr,
          value: ether("45")
        });
      }

      //  2 - test
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("60")
      });

      await time.increase(time.duration.hours(1));

      // console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("0.0252").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 0.0252 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 day", async () => {
      //  1 - invest to get above 500 ETH
      for (let i = 0; i < 14; i++) {
        let addr;
        if (i < 2) {
          addr = OTHER_ADDR
        } else if (i < 4) {
          addr = REFERRAL_0;
        } else if (i < 6) {
          addr = REFERRAL_1;
        } else if (i < 8) {
          addr = DEV_0_ESCROW;
        } else if (i < 10) {
          addr = DEV_1_ESCROW;
        } else if (i < 12) {
          addr = DEV_0_MASTER;
        } else if (i < 14) {
          addr = INVESTOR_1;
        }

        await onigiri.invest(REFERRAL_0, {
          from: addr,
          value: ether("45")
        });
      }

      //  2 - test
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("60") //  50.4 in lockbox
      });

      await time.increase(time.duration.days(1));

      // console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("0.6048").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 day profit should be 0.6048 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 week", async () => {
      //  1 - invest to get above 500 ETH
      for (let i = 0; i < 14; i++) {
        let addr;
        if (i < 2) {
          addr = OTHER_ADDR
        } else if (i < 4) {
          addr = REFERRAL_0;
        } else if (i < 6) {
          addr = REFERRAL_1;
        } else if (i < 8) {
          addr = DEV_0_ESCROW;
        } else if (i < 10) {
          addr = DEV_1_ESCROW;
        } else if (i < 12) {
          addr = DEV_0_MASTER;
        } else if (i < 14) {
          addr = INVESTOR_1;
        }

        await onigiri.invest(REFERRAL_0, {
          from: addr,
          value: ether("45")
        });
      }

      //  2 - test
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("60") //  50.4 in lockbox
      });

      await time.increase(time.duration.weeks(1));

      // console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("4.2336").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 week profit should be 4.2336 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 year", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("60") //  50.4 in lockbox
      });

      await time.increase(time.duration.years(1));

      // console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("220.752").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 year profit should be 220.752 eth");
    });
    */
  });

  describe("CalculateProfit - 105 ETH in lockbox", () => {
    /**
      ~ .99 -    - 0.6% = 25
      1 ~ 50     - 0.96% = 40
      51 ~ 100   - 1.2% = 50
      100 ~ 250  - 1.44% = 60
      250 ~      - 1.8% = 75

      return investors[_investor].lockbox.div(100000).mul(calculatedPercent);
    */

    /*
    it.only("should get correct calculateProfit for 1 hour", async () => {
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
        value: ether("125") //  260.4 in lockbox
      });

      await time.increase(time.duration.hours(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("0.063").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 0.063 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 day", async () => {
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
        value: ether("125") //  260.4 in lockbox
      });

      await time.increase(time.duration.days(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("1.512").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 1.512 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 week", async () => {
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
        value: ether("125") //  260.4 in lockbox
      });

      await time.increase(time.duration.weeks(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("10.584").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 10.584 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 year", async () => {
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
        value: ether("125") //  260.4 in lockbox
      });

      await time.increase(time.duration.years(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("551.88").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 551.88 eth");
    });
    */
  });


  describe("CalculateProfit - 214.2 ETH in lockbox", () => {
    /**
      ~ .99 -    - 0.6% = 25
      1 ~ 50     - 0.96% = 40
      51 ~ 100   - 1.2% = 50
      100 ~ 250  - 1.44% = 60
      250 ~      - 1.8% = 75

      return investors[_investor].lockbox.div(100000).mul(calculatedPercent);
    */

    /*
    it.only("should get correct calculateProfit for 1 hour", async () => {
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
        value: ether("300") //  512.4 in lockbox
      });

      await time.increase(time.duration.hours(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("0.189").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 0.189 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 day", async () => {
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
        value: ether("300") //  512.4 in lockbox
      });

      await time.increase(time.duration.days(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("4.536").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 4.536 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 week", async () => {
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
        value: ether("300") //  512.4 in lockbox
      });

      await time.increase(time.duration.weeks(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("31.752").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 31.752 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 year", async () => {
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
        value: ether("300") //  512.4 in lockbox
      });

      await time.increase(time.duration.years(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("1655.64").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 1,655.64 eth");
    });
    */
  });
});