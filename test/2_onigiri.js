const Onigiri = artifacts.require("./Onigiri.sol");

const {
  time,
  ether,
  shouldFail
} = require("openzeppelin-test-helpers");

contract("Withdraw functional", (accounts) => {
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
      assert.isTrue(new web3.utils.BN(await onigiri.getDevCommission.call(DEV_0_ESCROW, {
        from: DEV_0_ESCROW
      })) > 0);
      assert.isTrue(new web3.utils.BN(await onigiri.getDevCommission.call(DEV_1_ESCROW, {
        from: DEV_1_ESCROW
      })) > 0);

      //  withdraw DEV_0 commission  
      await onigiri.withdrawDevCommission({
        from: DEV_0_ESCROW
      });
      assert.isTrue(new web3.utils.BN(await onigiri.getDevCommission.call(DEV_0_ESCROW, {
        from: DEV_0_ESCROW
      })) == 0);
      assert.isTrue(new web3.utils.BN(await onigiri.getDevCommission.call(DEV_1_ESCROW, {
        from: DEV_1_ESCROW
      })) > 0);

      //  withdraw DEV_1 commission
      await onigiri.withdrawDevCommission({
        from: DEV_1_ESCROW
      });
      assert.isTrue(new web3.utils.BN(await onigiri.getDevCommission.call(DEV_0_ESCROW, {
        from: DEV_0_ESCROW
      })) == 0);
      assert.isTrue(new web3.utils.BN(await onigiri.getDevCommission.call(DEV_1_ESCROW, {
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
      // console.log(new web3.utils.BN(await onigiri.getDevCommission.call(DEV_0, {
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
});