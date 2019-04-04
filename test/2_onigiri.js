const Onigiri = artifacts.require("./Onigiri.sol");

const {
  time,
  ether,
  shouldFail
} = require("openzeppelin-test-helpers");

contract("Withdraw functional", (accounts) => {
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
      let balanceBefore = new web3.utils.BN(await web3.eth.getBalance(DEV_0));

      //  withdraw
      let withdrawTX = await onigiri.withdrawDevCommission({
        from: DEV_0
      });
      let gasUsed = withdrawTX.receipt.gasUsed;
      let gasPrice = (await web3.eth.getTransaction(withdrawTX.tx)).gasPrice;
      let weiUsed = new web3.utils.BN(gasUsed).mul(new web3.utils.BN(gasPrice));
      let balanceAfter = new web3.utils.BN(await web3.eth.getBalance(DEV_0));

      assert.equal(0, balanceAfter.sub(balanceBefore).sub(DEV_COMMISIION_CORRECT).add(weiUsed).toString(), "amount should be 0 for correct commision transferred");
    });

    it("should not allow to withrdawal if 0 amount", async () => {
      await shouldFail(onigiri.withdrawDevCommission({
        from: DEV_0
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
      assert.isTrue(new web3.utils.BN(await onigiri.getDevCommission.call(DEV_0, {
        from: DEV_0
      })) > 0);
      assert.isTrue(new web3.utils.BN(await onigiri.getDevCommission.call(DEV_1, {
        from: DEV_1
      })) > 0);

      //  withdraw DEV_0 commission  
      await onigiri.withdrawDevCommission({
        from: DEV_0
      });
      assert.isTrue(new web3.utils.BN(await onigiri.getDevCommission.call(DEV_0, {
        from: DEV_0
      })) == 0);
      assert.isTrue(new web3.utils.BN(await onigiri.getDevCommission.call(DEV_1, {
        from: DEV_1
      })) > 0);

      //  withdraw DEV_1 commission
      await onigiri.withdrawDevCommission({
        from: DEV_1
      });
      assert.isTrue(new web3.utils.BN(await onigiri.getDevCommission.call(DEV_0, {
        from: DEV_0
      })) == 0);
      assert.isTrue(new web3.utils.BN(await onigiri.getDevCommission.call(DEV_1, {
        from: DEV_1
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
        from: DEV_1
      }), "should fail, because balance will become less than minimum aloowed");
    });
  });

  describe("withdrawAffiliateCommisionTotal", () => {
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
      let withdrawTX = await onigiri.withdrawAffiliateCommisionTotal({
        from: REFERRAL_0
      });
      let gasUsed = withdrawTX.receipt.gasUsed;
      let gasPrice = (await web3.eth.getTransaction(withdrawTX.tx)).gasPrice;
      let weiUsed = new web3.utils.BN(gasUsed).mul(new web3.utils.BN(gasPrice));
      let balanceAfter = new web3.utils.BN(await web3.eth.getBalance(REFERRAL_0));

      assert.equal(0, balanceAfter.sub(balanceBefore).sub(REFFERRAL_COMMISIION_CORRECT).add(weiUsed).toString(), "amount should be 0 for correct commision transferred");
    });

    it("should not allow to withrdawal if 0 amount", async () => {
      await shouldFail(onigiri.withdrawAffiliateCommisionTotal({
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
      assert.isTrue(new web3.utils.BN(await onigiri.affiliateCommisionTotal.call(REFERRAL_0)) > 0);

      //  withdraw REFERRAL_0 commission  
      await onigiri.withdrawAffiliateCommisionTotal({
        from: REFERRAL_0
      });
      assert.isTrue(new web3.utils.BN(await onigiri.affiliateCommisionTotal.call(REFERRAL_0)) == 0);
    });

    it("should leave minimum balance during the withdrawal", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      await time.increase(time.duration.days(49));
      await onigiri.withdrawEarnings({
        from: INVESTOR_0
      });
      await shouldFail(await onigiri.withdrawAffiliateCommisionTotal({
        from: REFERRAL_0
      }), "should fail, because balance will become less than minimum allowed");
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

    it("should update withdrawnETH correctly", async () => {

    });

    it("should transfer earnings to withdrawal address", async () => {

    });
  });
});