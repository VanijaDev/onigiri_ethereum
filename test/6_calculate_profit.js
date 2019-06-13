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
  const OTHER_ADDR_1 = accounts[10];
  const OTHER_ADDR_2 = accounts[11];
  const OTHER_ADDR_3 = accounts[12];
  const OTHER_ADDR_4 = accounts[13];
  const OTHER_ADDR_5 = accounts[14];
  const OTHER_ADDR_6 = accounts[15];

  let onigiri;

  beforeEach("setup", async () => {
    await time.advanceBlock();
    onigiri = await Onigiri.new();
  });

  describe("CalculateProfit - 0.42 ETH in lockbox", () => {
    /**
      ~ .99 -    - 0.6%   ==  25
      1 ~ 50     - 0.72%  ==  30
      51 ~ 100   - 0.84%  ==  35
      100 ~ 250  - 0.96%  ==  40
      250 ~      - 1.08%  ==  45
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
      ~ .99 -    - 0.6%   ==  25
      1 ~ 50     - 0.72%  ==  30
      51 ~ 100   - 0.84%  ==  35
      100 ~ 250  - 0.96%  ==  40
      250 ~      - 1.08%  ==  45
    */
    it("should get correct calculateProfit for 1 hour", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("2")
      });

      await time.increase(time.duration.hours(1));
      assert.equal(0, ether("0.000504").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 0.000504 eth");
    });

    it("should get correct calculateProfit for 1 day", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("2")
      });

      await time.increase(time.duration.days(1));
      assert.equal(0, ether("0.012096").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 day profit should be 0.012096 eth");
    });

    it("should get correct calculateProfit for 1 week", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("2")
      });

      await time.increase(time.duration.weeks(1));
      assert.equal(0, ether("0.084672").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 week profit should be 0.084672 eth");
    });

    it("should get correct calculateProfit for 1 year", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("2")
      });

      await time.increase(time.duration.years(1));
      assert.equal(0, ether("4.41504").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 year profit should be 4.41504 eth");
    });
  });


  /**
   * IMPORTANT: each of further tests should be run separately using "only".
   * 
   */
  describe("CalculateProfit - 50.4 ETH in lockbox", () => {
    /**
      ~ .99 -    - 0.6%   ==  25
      1 ~ 50     - 0.72%  ==  30
      51 ~ 100   - 0.84%  ==  35
      100 ~ 250  - 0.96%  ==  40
      250 ~      - 1.08%  ==  45
    */

    /*
    it.only("should get correct calculateProfit for 1 hour", async () => {
      //  1 - invest to get above 500 ETH
      for (let i = 0; i < 14; i++) {
        let addr;
        if (i < 2) {
          addr = OTHER_ADDR_1
        } else if (i < 4) {
          addr = OTHER_ADDR_2;
        } else if (i < 6) {
          addr = OTHER_ADDR_3;
        } else if (i < 8) {
          addr = OTHER_ADDR_4;
        } else if (i < 10) {
          addr = OTHER_ADDR_5;
        } else if (i < 12) {
          addr = OTHER_ADDR_6;
        } else if (i < 14) {
          addr = OTHER_ADDR;
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
      assert.equal(0, ether("0.01764").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 0.01764 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 day", async () => {
      //  1 - invest to get above 500 ETH
      for (let i = 0; i < 14; i++) {
        let addr;
        if (i < 2) {
          addr = OTHER_ADDR_1
        } else if (i < 4) {
          addr = OTHER_ADDR_2;
        } else if (i < 6) {
          addr = OTHER_ADDR_3;
        } else if (i < 8) {
          addr = OTHER_ADDR_4;
        } else if (i < 10) {
          addr = OTHER_ADDR_5;
        } else if (i < 12) {
          addr = OTHER_ADDR_6;
        } else if (i < 14) {
          addr = OTHER_ADDR;
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
      assert.equal(0, ether("0.42336").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 day profit should be 0.42336 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 week", async () => {
      //  1 - invest to get above 500 ETH
      for (let i = 0; i < 14; i++) {
        let addr;
        if (i < 2) {
          addr = OTHER_ADDR_1
        } else if (i < 4) {
          addr = OTHER_ADDR_2;
        } else if (i < 6) {
          addr = OTHER_ADDR_3;
        } else if (i < 8) {
          addr = OTHER_ADDR_4;
        } else if (i < 10) {
          addr = OTHER_ADDR_5;
        } else if (i < 12) {
          addr = OTHER_ADDR_6;
        } else if (i < 14) {
          addr = OTHER_ADDR;
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
      assert.equal(0, ether("2.96352").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 week profit should be 2.96352 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 year", async () => {
      //  1 - invest to get above 500 ETH
      for (let i = 0; i < 14; i++) {
        let addr;
        if (i < 2) {
          addr = OTHER_ADDR_1
        } else if (i < 4) {
          addr = OTHER_ADDR_2;
        } else if (i < 6) {
          addr = OTHER_ADDR_3;
        } else if (i < 8) {
          addr = OTHER_ADDR_4;
        } else if (i < 10) {
          addr = OTHER_ADDR_5;
        } else if (i < 12) {
          addr = OTHER_ADDR_6;
        } else if (i < 14) {
          addr = OTHER_ADDR;
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

      await time.increase(time.duration.years(1));

      // console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("154.5264").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 year profit should be 154.5264 eth");
    });
    */

  });

  describe("CalculateProfit - 105 ETH in lockbox", () => {
    /**
      ~ .99 -    - 0.6%   ==  25
      1 ~ 50     - 0.72%  ==  30
      51 ~ 100   - 0.84%  ==  35
      100 ~ 250  - 0.96%  ==  40
      250 ~      - 1.08%  ==  45

      return investors[_investor].lockbox.div(100000).mul(calculatedPercent);
    */

    /*
    it.only("should get correct calculateProfit for 1 hour", async () => { 
      //  1 - invest to get above 500 ETH
      for (let i = 0; i < 14; i++) {
        let addr;
        if (i < 2) {
          addr = OTHER_ADDR_1
        } else if (i < 4) {
          addr = OTHER_ADDR_2;
        } else if (i < 6) {
          addr = OTHER_ADDR_3;
        } else if (i < 8) {
          addr = OTHER_ADDR_4;
        } else if (i < 10) {
          addr = OTHER_ADDR_5;
        } else if (i < 12) {
          addr = OTHER_ADDR_6;
        } else if (i < 14) {
          addr = OTHER_ADDR;
        }

        await onigiri.invest(REFERRAL_0, {
          from: addr,
          value: ether("45")
        });
      }

      //  2 - test
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
        value: ether("125") //  105 in lockbox
      });

      await time.increase(time.duration.hours(1));

      // console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("0.042").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 0.042 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 day", async () => {
      //  1 - invest to get above 500 ETH
      for (let i = 0; i < 14; i++) {
        let addr;
        if (i < 2) {
          addr = OTHER_ADDR_1
        } else if (i < 4) {
          addr = OTHER_ADDR_2;
        } else if (i < 6) {
          addr = OTHER_ADDR_3;
        } else if (i < 8) {
          addr = OTHER_ADDR_4;
        } else if (i < 10) {
          addr = OTHER_ADDR_5;
        } else if (i < 12) {
          addr = OTHER_ADDR_6;
        } else if (i < 14) {
          addr = OTHER_ADDR;
        }

        await onigiri.invest(REFERRAL_0, {
          from: addr,
          value: ether("45")
        });
      }

      //  2 - test
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
        value: ether("125") //  105 in lockbox
      });

      await time.increase(time.duration.days(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("1.008").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 1.008 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 week", async () => {
      //  1 - invest to get above 500 ETH
      for (let i = 0; i < 14; i++) {
        let addr;
        if (i < 2) {
          addr = OTHER_ADDR_1
        } else if (i < 4) {
          addr = OTHER_ADDR_2;
        } else if (i < 6) {
          addr = OTHER_ADDR_3;
        } else if (i < 8) {
          addr = OTHER_ADDR_4;
        } else if (i < 10) {
          addr = OTHER_ADDR_5;
        } else if (i < 12) {
          addr = OTHER_ADDR_6;
        } else if (i < 14) {
          addr = OTHER_ADDR;
        }

        await onigiri.invest(REFERRAL_0, {
          from: addr,
          value: ether("45")
        });
      }

      //  2 - test
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
        value: ether("125") //  105 in lockbox
      });

      await time.increase(time.duration.weeks(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("7.056").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 7.056 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 year", async () => {
      //  1 - invest to get above 500 ETH
      for (let i = 0; i < 14; i++) {
        let addr;
        if (i < 2) {
          addr = OTHER_ADDR_1
        } else if (i < 4) {
          addr = OTHER_ADDR_2;
        } else if (i < 6) {
          addr = OTHER_ADDR_3;
        } else if (i < 8) {
          addr = OTHER_ADDR_4;
        } else if (i < 10) {
          addr = OTHER_ADDR_5;
        } else if (i < 12) {
          addr = OTHER_ADDR_6;
        } else if (i < 14) {
          addr = OTHER_ADDR;
        }

        await onigiri.invest(REFERRAL_0, {
          from: addr,
          value: ether("45")
        });
      }

      //  2 - test
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
        value: ether("125") //  105 in lockbox
      });

      await time.increase(time.duration.years(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("367.92").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 367.92 eth");
    });
    */
  });

  describe("CalculateProfit - 214.2 ETH in lockbox", () => {
    /**
      ~ .99 -    - 0.6%   ==  25
      1 ~ 50     - 0.72%  ==  30
      51 ~ 100   - 0.84%  ==  35
      100 ~ 250  - 0.96%  ==  40
      250 ~      - 1.08%  ==  45

      return investors[_investor].lockbox.div(100000).mul(calculatedPercent);
    */

    /*
    it.only("should get correct calculateProfit for 1 hour", async () => {
      //  1 - invest to get above 500 ETH
      for (let i = 0; i < 14; i++) {
        let addr;
        if (i < 2) {
          addr = OTHER_ADDR_1
        } else if (i < 4) {
          addr = OTHER_ADDR_2;
        } else if (i < 6) {
          addr = OTHER_ADDR_3;
        } else if (i < 8) {
          addr = OTHER_ADDR_4;
        } else if (i < 10) {
          addr = OTHER_ADDR_5;
        } else if (i < 12) {
          addr = OTHER_ADDR_6;
        } else if (i < 14) {
          addr = OTHER_ADDR;
        }

        await onigiri.invest(REFERRAL_0, {
          from: addr,
          value: ether("45")
        });
      }

      //  2 - test
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("300") //  252 in lockbox
      });

      await time.increase(time.duration.hours(1));

      // console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("0.1134").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 0.1134 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 day", async () => {
      //  1 - invest to get above 500 ETH
      for (let i = 0; i < 14; i++) {
        let addr;
        if (i < 2) {
          addr = OTHER_ADDR_1
        } else if (i < 4) {
          addr = OTHER_ADDR_2;
        } else if (i < 6) {
          addr = OTHER_ADDR_3;
        } else if (i < 8) {
          addr = OTHER_ADDR_4;
        } else if (i < 10) {
          addr = OTHER_ADDR_5;
        } else if (i < 12) {
          addr = OTHER_ADDR_6;
        } else if (i < 14) {
          addr = OTHER_ADDR;
        }

        await onigiri.invest(REFERRAL_0, {
          from: addr,
          value: ether("45")
        });
      }

      //  2 - test
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("300") //  252 in lockbox
      });

      await time.increase(time.duration.days(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("2.7216").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 2.7216 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 week", async () => {
      //  1 - invest to get above 500 ETH
      for (let i = 0; i < 14; i++) {
        let addr;
        if (i < 2) {
          addr = OTHER_ADDR_1
        } else if (i < 4) {
          addr = OTHER_ADDR_2;
        } else if (i < 6) {
          addr = OTHER_ADDR_3;
        } else if (i < 8) {
          addr = OTHER_ADDR_4;
        } else if (i < 10) {
          addr = OTHER_ADDR_5;
        } else if (i < 12) {
          addr = OTHER_ADDR_6;
        } else if (i < 14) {
          addr = OTHER_ADDR;
        }

        await onigiri.invest(REFERRAL_0, {
          from: addr,
          value: ether("45")
        });
      }

      //  2 - test
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("300") //  252 in lockbox
      });

      await time.increase(time.duration.weeks(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("19.0512").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 19.0512 eth");
    });
    */

    /*
    it.only("should get correct calculateProfit for 1 year", async () => {
      //  1 - invest to get above 500 ETH
      for (let i = 0; i < 14; i++) {
        let addr;
        if (i < 2) {
          addr = OTHER_ADDR_1
        } else if (i < 4) {
          addr = OTHER_ADDR_2;
        } else if (i < 6) {
          addr = OTHER_ADDR_3;
        } else if (i < 8) {
          addr = OTHER_ADDR_4;
        } else if (i < 10) {
          addr = OTHER_ADDR_5;
        } else if (i < 12) {
          addr = OTHER_ADDR_6;
        } else if (i < 14) {
          addr = OTHER_ADDR;
        }

        await onigiri.invest(REFERRAL_0, {
          from: addr,
          value: ether("45")
        });
      }

      //  2 - test
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("300") //  252 in lockbox
      });

      await time.increase(time.duration.years(1));

      console.log((await onigiri.calculateProfit.call(INVESTOR_0)).toString());
      // console.log(((await onigiri.investors.call(INVESTOR_0)).lockbox).toString());
      // console.log((await onigiri.percentRate.call(ether("102"))).toString());

      // console.log((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime.toString());
      // console.log((await time.latest()).toString());
      assert.equal(0, ether("993.384").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 993.384 eth");
    });
    */
  });
});