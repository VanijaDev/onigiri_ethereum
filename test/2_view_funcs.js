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

  describe("Investor info", () => {
    it("should get correct getInvested after single investment", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });
      assert.equal(0, ether("0.5").cmp(await onigiri.getInvested.call(INVESTOR_0)), "wrong value after single investment");
    });

    it("should get correct getInvested after multiple investments", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      assert.equal(0, ether("1").cmp(await onigiri.getInvested.call(INVESTOR_0)), "wrong value after multiple investments");
    });

    it("should get correct getLockBox after single investment", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });
      assert.equal(0, ether("0.84").cmp(await onigiri.getLockBox.call(INVESTOR_0)), "wrong value after single investment");
    });

    it("should get correct getLockBox after multiple investments", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      assert.equal(0, ether("1.26").cmp(await onigiri.getLockBox.call(INVESTOR_0)), "wrong value after multiple investments");
    });

    it("should return correct getWithdrawn after single withdrawal", async () => {
      //  1 - invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("1")
      });

      //  2 - withdraw profit
      await time.increase(time.duration.days(1));
      let profit = new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_0));

      await onigiri.withdrawProfit({
        from: INVESTOR_0
      });

      assert.equal(0, profit.cmp(await onigiri.getWithdrawn.call(INVESTOR_0)), "wrong withdrawn value after single withdrawal");
    });

    it("should return correct getWithdrawn after multiple withdrawals", async () => {
      //  1 - invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("1")
      });

      //  2 - withdraw profit
      await time.increase(time.duration.days(1));
      let profit_0 = new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_0));
      await onigiri.withdrawProfit({
        from: INVESTOR_0
      });

      //  3 - withdraw profit
      await time.increase(time.duration.days(2));
      let profit_1 = new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_0));
      await onigiri.withdrawProfit({
        from: INVESTOR_0
      });

      assert.equal(0, (profit_0.add(profit_1)).cmp(await onigiri.getWithdrawn.call(INVESTOR_0)), "wrong withdrawn value after multiple withdrawals");
    });

    it("should return correct getLastInvestmentTime after single investment", async () => {
      //  1 - invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });
      let investTime = await time.latest();

      await time.increase(time.duration.days(1));

      assert.equal(0, investTime.cmp(await onigiri.getLastInvestmentTime.call(INVESTOR_0)), "wrong getLastInvestmentTime value after single investment");
    });

    it("should return correct getLastInvestmentTime after multiple investments", async () => {
      //  1 - invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });
      await time.increase(time.duration.days(1));

      //  2 - invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });
      let investTime = await time.latest();

      assert.equal(0, investTime.cmp(await onigiri.getLastInvestmentTime.call(INVESTOR_0)), "wrong getLastInvestmentTime value after multiple investments");
    });
  });

  describe("Developers commission", () => {
    it("should update devCommission after after all types of dev income: 1) invest; 2) donate; 3) from game; 4) user withdraw", async () => {
      //  1 - invest == 0.02
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      //  2 - donation == 0.01
      await web3.eth.sendTransaction({
        from: OTHER_ADDR,
        to: onigiri.address,
        value: ether("1")
      });

      //  3 - from game == 0.02
      await onigiri.fromGame({
        from: OTHER_ADDR,
        value: ether("1")
      });

      await time.increase(time.duration.days(1));

      //  4 - withdraw
      let profit = new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_0));
      let devCommissionFromProfit = profit.div(new web3.utils.BN(100));
      await onigiri.withdrawProfit({
        from: INVESTOR_0
      });

      assert.equal(0, (ether("0.05").add(devCommissionFromProfit)).cmp(await onigiri.devCommission.call(DEV_0_ESCROW, {
        from: DEV_0_ESCROW
      })), "DEV_0_ESCROW is wrong");
      assert.equal(0, (ether("0.05").add(devCommissionFromProfit)).cmp(await onigiri.devCommission.call(DEV_1_ESCROW, {
        from: DEV_1_ESCROW
      })), "DEV_1_ESCROW is wrong");
    });
  });

  describe("Contract balance", () => {
    it("should validate getBalance after single investment", async () => {
      assert.equal(0, new web3.utils.BN(0).cmp(await onigiri.getBalance.call()), "contract balance should be 0");

      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      assert.equal(0, ether("0.5").cmp(await onigiri.getBalance.call()), "contract balance should be 0.5 eth");
    });

    it("should validate getBalance after multiple investments", async () => {
      assert.equal(0, new web3.utils.BN(0).cmp(await onigiri.getBalance.call()), "contract balance should be 0");

      //  1 - invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      //  2 - invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      assert.equal(0, ether("1").cmp(await onigiri.getBalance.call()), "contract balance should be 1 eth");
    });

    it("should validate getBalance after all types of investment and donating", async () => {
      assert.equal(0, new web3.utils.BN(0).cmp(await onigiri.getBalance.call()), "contract balance should be 0");

      //  1 - invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      //  2 - donation
      await web3.eth.sendTransaction({
        from: OTHER_ADDR,
        to: onigiri.address,
        value: ether("1")
      });

      //  3 - from game
      await onigiri.fromGame({
        from: OTHER_ADDR,
        value: ether("2")
      });

      assert.equal(0, ether("3.5").cmp(await onigiri.getBalance.call()), "contract balance should be 2.5 eth");
    });
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

    it.only("should get correct calculateProfit for 1 year", async () => {
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
    /**
            25 = .6% || .025 ~ .99
            40 = .96% || 1 ~ 100 
            50 = 1.2% || 101 ~ 250 
            75 = 1.8% || 251 ~ 500
            100 = 2.4% 501 ~ 

            return investors[_investor].lockbox.div(100000).mul(calculatedPercent);
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

  describe("CalculateProfit - 0.5 ETH", () => {
    /**
            25 = .6% || .025 ~ .99
            40 = .96% || 1 ~ 100 
            50 = 1.2% || 101 ~ 250 
            75 = 1.8% || 251 ~ 500
            100 = 2.4% 501 ~ 

            return investors[_investor].lockbox.div(100000).mul(calculatedPercent);
         */
    it("should get correct calculateProfit for 1 hour", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("2")
      });

      await time.increase(time.duration.hours(1));
      assert.equal(0, ether("0.00042").cmp(await onigiri.calculateProfit.call(INVESTOR_0)), "1 hour profit should be 0.00042 eth");
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

  describe("GuaranteedBalance", () => {
    it("should increase after single investment", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("2")
      });

      let guaranteedBal = await onigiri.guaranteedBalance.call();
      let guaranteedBalExpected = ether("1.68").add(ether("0.08"));
      assert.equal(0, guaranteedBal.cmp(guaranteedBalExpected), "wrong guaranteed balance after single investment");
    });

    it("should increase after multiple investments", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("2")
      });

      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("2")
      });

      let guaranteedBal = await onigiri.guaranteedBalance.call();
      let guaranteedBalExpected = ether("1.68").add(ether("1.68")).add(ether("0.16"));
      assert.equal(0, guaranteedBal.cmp(guaranteedBalExpected), "wrong guaranteed balance after multiple investments");
    });

    it("should increase after multiple donations", async () => {
      await web3.eth.sendTransaction({
        from: OTHER_ADDR,
        to: onigiri.address,
        value: ether("1")
      });

      await web3.eth.sendTransaction({
        from: OTHER_ADDR,
        to: onigiri.address,
        value: ether("2")
      });

      let guaranteedBal = await onigiri.guaranteedBalance.call();
      let guaranteedBalExpected = ether("0.06");
      assert.equal(0, guaranteedBal.cmp(guaranteedBalExpected), "wrong guaranteed balance after multiple donations");
    });

    it("should increase after multiple from games", async () => {
      await onigiri.fromGame({
        from: OTHER_ADDR,
        value: ether("1")
      });

      await onigiri.fromGame({
        from: OTHER_ADDR,
        value: ether("2")
      });

      let guaranteedBal = await onigiri.guaranteedBalance.call();
      let guaranteedBalExpected = ether("0.12");
      assert.equal(0, guaranteedBal.cmp(guaranteedBalExpected), "wrong guaranteed balance after multiple from games");
    });

    it("should increase after single reinvest", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      await time.increase(time.duration.weeks(2));
      let profit = new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_0));
      let profit_lockbox = profit.div(new web3.utils.BN(100)).mul(new web3.utils.BN(84));

      await onigiri.reinvestProfit({
        from: INVESTOR_0
      });

      let guaranteedBal = await onigiri.guaranteedBalance.call();
      let guaranteedBalExpected = ether("0.84").add(ether("0.04")).add(profit_lockbox);
      assert.equal(0, guaranteedBal.cmp(guaranteedBalExpected), "wrong guaranteed balance after single reinvest");
    });
  });

  describe("investors variable", () => {
    it("should get correct data", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });
      let investmentTime = await time.latest();
      await time.increase(time.duration.hours(1));

      let investorData = await onigiri.investors.call(INVESTOR_0);
      assert.equal(0, ether("1").cmp(investorData.invested), "wrong invested");
      assert.equal(0, ether("0.84").cmp(investorData.lockbox), "wrong lockbox");
      assert.equal(0, ether("0").cmp(investorData.withdrawn), "wrong withdrawn");
      assert.equal(0, investmentTime.cmp(investorData.lastInvestmentTime), "wrong lastInvestmentTime");
    });

    it("should get correct withdrawn data after withdrawal", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });
      await time.increase(time.duration.hours(1));

      await onigiri.withdrawProfit({
        from: INVESTOR_0
      });

      let investorData = await onigiri.investors.call(INVESTOR_0);
      assert.equal(-1, ether("0").cmp(investorData.withdrawn), "wrong withdrawn after withdrawal");
    });
  });

  describe("affiliateCommission variable", () => {
    it("should update affiliateCommission correctly after investment", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      assert.equal(0, ether("0.01").cmp(await onigiri.affiliateCommission.call(REFERRAL_0)), "wrong affiliateCommission");
    });

    it("should update affiliateCommission correctly after withdraval", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      await onigiri.withdrawAffiliateCommission({
        from: REFERRAL_0
      });

      assert.equal(0, ether("0").cmp(await onigiri.affiliateCommission.call(REFERRAL_0)), "wrong affiliateCommission, should be 0");
    });
  });

  describe("devCommission variable", () => {
    it("should update devCommission correctly after single investment", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("2")
      });

      assert.equal(0, ether("0.04").cmp(await onigiri.devCommission.call(DEV_0_ESCROW)), "wrong DEV_0_ESCROW");
    });

    it("should update devCommission correctly after multiple investments", async () => {
      //  1
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("2")
      });

      assert.equal(0, ether("0.04").cmp(await onigiri.devCommission.call(DEV_0_ESCROW)), "wrong DEV_0_ESCROW 1");

      //  2
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      assert.equal(0, ether("0.06").cmp(await onigiri.devCommission.call(DEV_0_ESCROW)), "wrong DEV_0_ESCROW 2");

      //  3
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      assert.equal(0, ether("0.07").cmp(await onigiri.devCommission.call(DEV_0_ESCROW)), "wrong DEV_0_ESCROW 3");
    });

    it("should update devCommission correctly after withdraval", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      await onigiri.withdrawDevCommission({
        from: DEV_0_ESCROW
      });

      assert.equal(0, ether("0").cmp(await onigiri.devCommission.call(DEV_0_ESCROW)), "wrong devCommission, should be 0");
    });
  });
});