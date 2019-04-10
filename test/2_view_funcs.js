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

  describe("investor info", () => {
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

  describe("developers commission", () => {
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

  describe("other view funcs", () => {
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


  /*
  describe("withdrawDevCommission", () => {
    it("should transfer correct amount to dev account", async () => {
      //  invest
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

      const DEV_COMMISIION_CORRECT = ether("0.03");
      let balanceBefore = new web3.utils.BN(await web3.eth.getBalance(DEV_0_ESCROW));

      //  withdraw
      let withdrawTX = await onigiri.withdrawDevCommission({
        from: DEV_0_ESCROW
      });
      let gasUsed = withdrawTX.receipt.gasUsed;
      let gasPrice = (await web3.eth.getTransaction(withdrawTX.tx)).gasPrice;
      let weiUsed = new web3.utils.BN(gasUsed).mul(new web3.utils.BN(gasPrice));
      let balanceAfter = new web3.utils.BN(await web3.eth.getBalance(DEV_0_ESCROW));

      assert.equal(0, balanceAfter.sub(balanceBefore).sub(DEV_COMMISIION_CORRECT).add(weiUsed).toString(), "amount should be 0 for correct commision transferred");
    });

    it("should not allow to withrdawal if 0 amount", async () => {
      await shouldFail(onigiri.withdrawDevCommission({
        from: DEV_0_ESCROW
      }), "should fail if commission == 0");
    });

    it("should clear dev commission after withdrawal", async () => {
      //  invest
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

      //  check dev commission before
      assert.isTrue(new web3.utils.BN(await onigiri.devCommission.call(DEV_0_ESCROW, {
        from: DEV_0_ESCROW
      })) > 0);
      assert.isTrue(new web3.utils.BN(await onigiri.devCommission.call(DEV_1_ESCROW, {
        from: DEV_1_ESCROW
      })) > 0);

      //  withdraw DEV_0 commission  
      await onigiri.withdrawDevCommission({
        from: DEV_0_ESCROW
      });
      assert.isTrue(new web3.utils.BN(await onigiri.devCommission.call(DEV_0_ESCROW, {
        from: DEV_0_ESCROW
      })) == 0);
      assert.isTrue(new web3.utils.BN(await onigiri.devCommission.call(DEV_1_ESCROW, {
        from: DEV_1_ESCROW
      })) > 0);

      //  withdraw DEV_1 commission
      await onigiri.withdrawDevCommission({
        from: DEV_1_ESCROW
      });
      assert.isTrue(new web3.utils.BN(await onigiri.devCommission.call(DEV_0_ESCROW, {
        from: DEV_0_ESCROW
      })) == 0);
      assert.isTrue(new web3.utils.BN(await onigiri.devCommission.call(DEV_1_ESCROW, {
        from: DEV_1_ESCROW
      })) == 0);
    });

    it("should leave minimum balance during the withdrawal", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });
      await time.increase(time.duration.days(59));
      // console.log((new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_0))).toString());
      // console.log(await web3.eth.getBalance(onigiri.address));
      await onigiri.withdrawEarnings({
        from: INVESTOR_0
      });
      // console.log(await web3.eth.getBalance(onigiri.address));
      // console.log(new web3.utils.BN(await onigiri.devCommission.call(DEV_0, {
      //   from: DEV_0
      // })).toString());
      await shouldFail(onigiri.withdrawDevCommission({
        from: DEV_1_ESCROW
      }), "should fail, because balance will become less than minimum aloowed");
    });

    it("should update dev_0_escrow from dev_0_master", async () => {
      //  invest
      //  1
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      //  update
      await onigiri.updateDevEscrow(OTHER_ADDR, {
        from: DEV_0_MASTER
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

      const DEV_COMMISIION_CORRECT = ether("0.02");
      let balanceBefore_updatedEscrow = new web3.utils.BN(await web3.eth.getBalance(OTHER_ADDR));

      //  withdraw
      let withdrawTX = await onigiri.withdrawDevCommission({
        from: OTHER_ADDR
      });
      let gasUsed = withdrawTX.receipt.gasUsed;
      let gasPrice = (await web3.eth.getTransaction(withdrawTX.tx)).gasPrice;
      let weiUsed = new web3.utils.BN(gasUsed).mul(new web3.utils.BN(gasPrice));
      let balanceAfter_updatedEscrow = new web3.utils.BN(await web3.eth.getBalance(OTHER_ADDR));

      assert.equal(0, balanceAfter_updatedEscrow.sub(balanceBefore_updatedEscrow).sub(DEV_COMMISIION_CORRECT).add(weiUsed).toString(), "amount should be 0 for correct commision transferred");
    });
  });

  describe("withdrawAffiliateCommision", () => {
    it("should transfer correct amount to refferral account", async () => {
      //  invest
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

      const REFFERRAL_COMMISIION_CORRECT = ether("0.03");
      let balanceBefore = new web3.utils.BN(await web3.eth.getBalance(REFERRAL_0));

      //  withdraw
      let withdrawTX = await onigiri.withdrawAffiliateCommision({
        from: REFERRAL_0
      });
      let gasUsed = withdrawTX.receipt.gasUsed;
      let gasPrice = (await web3.eth.getTransaction(withdrawTX.tx)).gasPrice;
      let weiUsed = new web3.utils.BN(gasUsed).mul(new web3.utils.BN(gasPrice));
      let balanceAfter = new web3.utils.BN(await web3.eth.getBalance(REFERRAL_0));

      assert.equal(0, balanceAfter.sub(balanceBefore).sub(REFFERRAL_COMMISIION_CORRECT).add(weiUsed).toString(), "amount should be 0 for correct commision transferred");
    });

    it("should not allow to withrdawal if 0 amount", async () => {
      await shouldFail(onigiri.withdrawAffiliateCommision({
        from: REFERRAL_0
      }), "should fail if commission == 0");
    });

    it("should clear commission after withdrawal", async () => {
      //  invest
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

      //  check commission before
      assert.isTrue(new web3.utils.BN(await onigiri.affiliateCommision.call(REFERRAL_0)) > 0);

      //  withdraw REFERRAL_0 commission  
      await onigiri.withdrawAffiliateCommision({
        from: REFERRAL_0
      });
      assert.isTrue(new web3.utils.BN(await onigiri.affiliateCommision.call(REFERRAL_0)) == 0);
    });

    it("should leave minimum balance during the withdrawal", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      await time.increase(time.duration.days(59));
      await onigiri.withdrawEarnings({
        from: INVESTOR_0
      });
      await shouldFail(onigiri.withdrawAffiliateCommision({
        from: REFERRAL_0
      }), "should fail, because balance will become less than minimum allowed");
    });

    it("should update affiliateCommisionWithdrawnTotal", async () => {
      //  invest
      //  1
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      //  2
      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      //  2
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      assert.equal(0, new web3.utils.BN(ether("0")).cmp(new web3.utils.BN(await onigiri.affiliateCommisionWithdrawnTotal.call())), "affiliateCommisionWithdrawnTotal should be 0 before");

      //  withdraw affiliate commissions
      onigiri.withdrawAffiliateCommision({
        from: REFERRAL_0
      });
      assert.equal(0, new web3.utils.BN(ether("0.02")).cmp(new web3.utils.BN(await onigiri.affiliateCommisionWithdrawnTotal.call())), "affiliateCommisionWithdrawnTotal should be 0 before");

      onigiri.withdrawAffiliateCommision({
        from: REFERRAL_1
      });
      assert.equal(0, new web3.utils.BN(ether("0.03")).cmp(new web3.utils.BN(await onigiri.affiliateCommisionWithdrawnTotal.call())), "affiliateCommisionWithdrawnTotal should be 0 before");
    });
  });

  describe("withdrawEarnings", () => {
    it("should fail if no investments", async () => {
      await shouldFail(onigiri.withdrawEarnings({
        from: INVESTOR_0
      }), "should fail if not investments were done");
    });

    it("should leave minimum balance during the withdrawal", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      await time.increase(time.duration.weeks(9));
      await shouldFail(onigiri.withdrawEarnings({
        from: INVESTOR_0
      }), "should fail, because less than minimum balance left");
    });

    it("should update lastInvestment to now", async () => {
      let tx = await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("0.5")
      });

      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("0.5")
      });
      let blockNumber = (await web3.eth.getTransaction(tx.tx)).blockNumber;
      assert.equal((await web3.eth.getBlock(blockNumber)).timestamp, new web3.utils.BN(await onigiri.lastInvestment.call(INVESTOR_0)));

      await time.increase(time.duration.hours(2));
      let txWithdraw = await onigiri.withdrawEarnings({
        from: INVESTOR_0
      });
      let blockNumberWithdraw = (await web3.eth.getTransaction(txWithdraw.tx)).blockNumber;
      assert.equal((await web3.eth.getBlock(blockNumberWithdraw)).timestamp, new web3.utils.BN(await onigiri.lastInvestment.call(INVESTOR_0)));
    });

    it("should update withdrawnETH correctly after single withdrawal", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      await time.increase(time.duration.days(2));
      assert.equal(0, await onigiri.withdrawnETH.call(INVESTOR_0), "withdrawnETH should be 0 before");
      let earnings = await onigiri.calculateProfit.call(INVESTOR_0);

      onigiri.withdrawEarnings({
        from: INVESTOR_0
      })

      assert.equal(0, earnings.cmp(await onigiri.withdrawnETH.call(INVESTOR_0)), "wrong withdrawnETH after withdrawal");
    });

    it("should update withdrawnETH correctly after multiple withdrawals", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      //  1
      await time.increase(time.duration.days(2));
      assert.equal(0, await onigiri.withdrawnETH.call(INVESTOR_0), "withdrawnETH should be 0 before");
      let earnings_1 = await onigiri.calculateProfit.call(INVESTOR_0);
      onigiri.withdrawEarnings({
        from: INVESTOR_0
      })

      //  2
      await time.increase(time.duration.days(3));
      let earnings_2 = await onigiri.calculateProfit.call(INVESTOR_0);
      onigiri.withdrawEarnings({
        from: INVESTOR_0
      })

      assert.equal(0, earnings_1.add(earnings_2).cmp(await onigiri.withdrawnETH.call(INVESTOR_0)), "wrong withdrawnETH after withdrawal");

      // console.log(await onigiri.withdrawnETH.call(INVESTOR_0));
      // console.log((new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_0))).toString());

      // assert.equal(0, onigiri.withdrawnETH.call(INVESTOR_0).cmp());
    });

    it("should transfer earnings to withdrawal address", async () => {

    });


    it("should test", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("2")
      });

      await time.increase(time.duration.weeks(3));

      console.log((new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_0))).toString());
    });
  });
  */
});