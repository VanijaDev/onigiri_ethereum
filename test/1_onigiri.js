const Onigiri = artifacts.require("./Onigiri.sol");

const {
  time,
  ether,
  shouldFail
} = require("openzeppelin-test-helpers");


contract("During investment", (accounts) => {
  const DEV_0 = accounts[9];
  const DEV_1 = accounts[8];

  const INVESTOR_0 = accounts[7];
  const INVESTOR_1 = accounts[6];

  const REFERRAL_0 = accounts[5];
  const REFERRAL_1 = accounts[4];

  const OTHER_ADDR = accounts[3];

  let onigiri;

  beforeEach("setup", async () => {
    await time.advanceBlock();
    onigiri = await Onigiri.new();
  });

  describe("General functional", () => {
    it("should return correct balance", async () => {
      let amount = ether("0.5");
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: amount
      });

      assert.equal(0, amount.cmp(await onigiri.getBalance.call()), "wrong balance after investment");
    });

    it("should calculateProfit correctly", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      await time.increase(time.duration.hours(2));
      const CORRECT_VALUE = ether("0.42").div(new web3.utils.BN(100000)).mul(new web3.utils.BN(150));
      assert.equal(0, CORRECT_VALUE.cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "wrong calculateProfit value");
    });
  });

  describe("invest", () => {
    it("should not allow investmaent less than 0.025 ether", async () => {
      await shouldFail(onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("0.01")
      }), "should throw if less than minimum investment");
    });

    it("should update lastInvestment", async () => {
      assert.equal(0, new web3.utils.BN(0).cmp(await onigiri.lastInvestment.call(INVESTOR_0)), "lastInvestment should be 0 before");
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });
      assert.equal(0, (await time.latest()).cmp(await onigiri.lastInvestment.call(INVESTOR_0)), "lastInvestment should be changed after");
    });

    it("should update investedETH on single investment", async () => {
      assert.equal(0, ether("0").cmp(await onigiri.investedETH.call(INVESTOR_0)), "investedETH should be 0 before");
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });
      assert.equal(0, ether("0.5").cmp(await onigiri.investedETH.call(INVESTOR_0)), "investedETH should be 0.5 after");
    });

    it("should update investedETH on multiple investments", async () => {
      assert.equal(0, ether("0").cmp(await onigiri.investedETH.call(INVESTOR_0)), "investedETH should be 0 before");

      //  1
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      //  2
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      //  2
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      assert.equal(0, ether("1.5").cmp(await onigiri.investedETH.call(INVESTOR_0)), "investedETH should be 1.5 after");
    });

    it("should not send any ptofit on first investment", async () => {
      assert.equal(0, ether("0").cmp(await onigiri.calculateProfit.call(INVESTOR_1)), "balance should 0 before");
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });
      assert.equal(0, ether("0").cmp(await onigiri.calculateProfit.call(INVESTOR_1)), "balance should be 0 right after");
    });

    it.only("should send correct ptofit on second investment, 1 hour after first investment", async () => {
      assert.equal(0, new web3.utils.BN(0).cmp(await onigiri.calculateProfit.call(INVESTOR_1)), "balance should be 0 before");
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });
      await time.increase(time.duration.hours(1));
      let balanceBefore = new web3.utils.BN(await web3.eth.getBalance(INVESTOR_0));
      console.log("balanceBefore: ", balanceBefore.toString());

      const CORRECT_PROFIT = new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_0));
      console.log("CORRECT_PROFIT: ", CORRECT_PROFIT.toString());

      let investTX = await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1.5")
      });
      let gasUsed = investTX.receipt.gasUsed;
      let gasPrice = (await web3.eth.getTransaction(investTX.tx)).gasPrice;
      let weiUsed = new web3.utils.BN(gasUsed).mul(new web3.utils.BN(gasPrice));
      let balanceAfter = new web3.utils.BN(await web3.eth.getBalance(INVESTOR_0));
      console.log("balanceAfter: ", balanceAfter.toString());

      assert.equal(0, balanceBefore.add(CORRECT_PROFIT).sub(weiUsed).sub(ether("1.5")).cmp(balanceAfter), "amount should be 0 for correct commision transferred");

    });
  });

  describe("lockBox", () => {
    it("should update lockBox correctly", async () => {
      assert.equal(0, new web3.utils.BN(0).cmp(await onigiri.lockBox.call(INVESTOR_0)), "lockBox should be 0 before");
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });
      assert.equal(0, ether("0.84").cmp(await onigiri.lockBox.call(INVESTOR_0)), "lockBox should be 0.84 after");
    });

    it("should update lockBox correctly", async () => {
      assert.equal(0, new web3.utils.BN(0).cmp(await onigiri.lockBox.call(INVESTOR_0)), "lockBox should be 0 before");
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      await time.increase(time.duration.hours(2));

      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      assert.equal(0, ether("1.68").cmp(await onigiri.lockBox.call(INVESTOR_0)), "lockBox should be 1.72 after");
    });
  });

  describe("devCommission", () => {
    it("should update devCommission correctly on single investment", async () => {
      assert.equal(0, ether("0").cmp(await onigiri.getDevCommission.call(DEV_0, {
        from: DEV_0
      })), "devCommission for DEV_0 should be 0 before");
      assert.equal(0, ether("0").cmp(await onigiri.getDevCommission.call(DEV_1, {
        from: DEV_1
      })), "devCommission for DEV_1 should be 0 before");

      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      assert.equal(0, ether("0.02").cmp(await onigiri.getDevCommission.call(DEV_0, {
        from: DEV_0
      })), "devCommission for DEV_0 should be 0.02 after");
      assert.equal(0, ether("0.02").cmp(await onigiri.getDevCommission.call(DEV_1, {
        from: DEV_1
      })), "devCommission for DEV_1 should be 0.02 after");
    });

    it("should update devCommission correctly on multiple investments", async () => {
      assert.equal(0, ether("0").cmp(await onigiri.getDevCommission.call(DEV_0, {
        from: DEV_0
      })), "devCommission for DEV_0 should be 0 before");
      assert.equal(0, ether("0").cmp(await onigiri.getDevCommission.call(DEV_1, {
        from: DEV_1
      })), "devCommission for DEV_1 should be 0 before");

      //  1
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      //  2
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      //  3
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      assert.equal(0, ether("0.06").cmp(await onigiri.getDevCommission.call(DEV_0, {
        from: DEV_0
      })), "devCommission for DEV_0 should be 0.06 after");
      assert.equal(0, ether("0.06").cmp(await onigiri.getDevCommission.call(DEV_1, {
        from: DEV_1
      })), "devCommission for DEV_1 should be 0.06 after");
    });
  });

  describe("refferral", () => {
    it("should update refferral's balance if provided during investment", async () => {
      assert.equal(0, ether("0").cmp(await onigiri.affiliateCommisionTotal.call(REFERRAL_0)), "REFERRAL_0 should be 0 before");

      //  1
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      //  2
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      //  3
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      assert.equal(0, ether("0.06").cmp(await onigiri.affiliateCommisionTotal.call(REFERRAL_0)), "REFERRAL_0 should be 0.06 after");
    });
  });

  describe("fallback function", () => {
    it("dev commisiion should be updated", async () => {
      assert.equal(0, ether("0").cmp(await onigiri.getDevCommission.call(DEV_0, {
        from: DEV_0
      })), "devCommission for DEV_0 should be 0 before");
      assert.equal(0, ether("0").cmp(await onigiri.getDevCommission.call(DEV_1, {
        from: DEV_1
      })), "devCommission for DEV_1 should be 0 before");

      await onigiri.send(ether("2"), {
        from: OTHER_ADDR
      });

      assert.equal(0, ether("0.04").cmp(await onigiri.getDevCommission.call(DEV_0, {
        from: DEV_0
      })), "devCommission for DEV_0 should be 0.04 after");
      assert.equal(0, ether("0.04").cmp(await onigiri.getDevCommission.call(DEV_1, {
        from: DEV_1
      })), "devCommission for DEV_1 should be 0.04 after");
    });
  });
});