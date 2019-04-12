const Onigiri = artifacts.require("Onigiri.sol");

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

  describe("withdrawDevCommission", () => {
    it("should fail if no dev commission", async () => {
      await shouldFail(onigiri.withdrawDevCommission({
        from: DEV_0_ESCROW
      }), "no dev commission, so fail");
    });

    it("should fail if not from dev escrow", async () => {
      //  invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      await web3.eth.sendTransaction({
        from: OTHER_ADDR,
        to: onigiri.address,
        value: ether("1")
      });

      //  withdraw
      await shouldFail(onigiri.withdrawDevCommission({
        from: OTHER_ADDR
      }), "not dev escrow, so fail");
    });

    it("should be able to withdraw when no active investors after thier deposits", async () => {
      //  invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("1")
      });

      //  withdraw
      await onigiri.withdrawDevCommission({
        from: DEV_0_ESCROW
      });

      await onigiri.withdrawDevCommission({
        from: DEV_1_ESCROW
      });
    });

    it("should delete devCommission after successful withdrawal", async () => {
      //  invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      assert.isTrue(await onigiri.devCommission.call(DEV_0_ESCROW) > 0, "dev commission should be > 0 before dev withdrawal");

      // withdraw
      await onigiri.withdrawDevCommission({
        from: DEV_0_ESCROW
      });

      assert.isTrue(await onigiri.devCommission.call(DEV_0_ESCROW) == 0, "dev commission should be == 0 after dev withdrawal");
    });

    it("should delete only DEV_0_ESCROW if called from DEV_0_ESCROW", async () => {
      //  invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      let dev_1_escrow_balance = await onigiri.devCommission.call(DEV_1_ESCROW);

      // withdraw
      await onigiri.withdrawDevCommission({
        from: DEV_0_ESCROW
      });

      assert.equal(0, dev_1_escrow_balance.cmp(await onigiri.devCommission.call(DEV_1_ESCROW)), "DEV_1_ESCROW should not be changed after DEV_0_ESCROW withdrawal");
    });

    it("should delete only DEV_1_ESCROW if called from DEV_1_ESCROW", async () => {
      //  invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      let dev_0_escrow_commission_balance = await onigiri.devCommission.call(DEV_0_ESCROW);

      // withdraw
      await onigiri.withdrawDevCommission({
        from: DEV_1_ESCROW
      });

      assert.equal(0, dev_0_escrow_commission_balance.cmp(await onigiri.devCommission.call(DEV_0_ESCROW)), "DEV_0_ESCROW should not be changed after DEV_1_ESCROW withdrawal");
    });

    it("should transfer correct amount of eth", async () => {
      //  invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      let dev_0_escrow_commission_balance = await onigiri.devCommission.call(DEV_0_ESCROW);
      let dev_0_escrow_contract_balance_before = new web3.utils.BN(await web3.eth.getBalance(DEV_0_ESCROW));

      // withdraw
      let withdrawTX = await onigiri.withdrawDevCommission({
        from: DEV_0_ESCROW
      });
      let gasUsed = withdrawTX.receipt.gasUsed;
      let gasPrice = (await web3.eth.getTransaction(withdrawTX.tx)).gasPrice;
      let weiUsed = new web3.utils.BN(gasUsed).mul(new web3.utils.BN(gasPrice));

      let dev_0_escrow_contract_balance_after = new web3.utils.BN(await web3.eth.getBalance(DEV_0_ESCROW));

      assert.equal(0, dev_0_escrow_commission_balance.cmp(dev_0_escrow_contract_balance_after.add(weiUsed).sub(dev_0_escrow_contract_balance_before)), "wrong commission was transferred");
    });
  });

  describe("withdrawAffiliateCommission", () => {
    it("should fail if no commission", async () => {
      await shouldFail(onigiri.withdrawAffiliateCommission({
        from: REFERRAL_0
      }), "should fail if no commission");
    });

    it("should fail if left amount will be less, than guaranteedBalance", async () => {
      //  invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      // console.log("guaranteedBalance: ", (await onigiri.guaranteedBalance.call()).toString());
      await time.increase(time.duration.hours(355));
      let profit = new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_0)); //  0.11928 ETH + 0.84 ETH lockbox + 0.04 ETH dev commission = 0.99928 ETH
      // console.log("profit: ", profit.toString());
      await onigiri.withdrawProfit({
        from: INVESTOR_0
      });
      // console.log("getBalance: ", new web3.utils.BN(await web3.eth.getBalance(onigiri.address)).toString());

      //  withdraw
      await shouldFail(onigiri.withdrawAffiliateCommission({
        from: REFERRAL_0
      }), "should fail if left amount will be less, than guaranteedBalance");
    });

    it("should delete commission balance after withdrawal", async () => {
      //  invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      await assert.isTrue(await onigiri.affiliateCommission.call(REFERRAL_0) > 0, "affiliateCommission should be > 0");

      //  withdraw
      await onigiri.withdrawAffiliateCommission({
        from: REFERRAL_0
      });

      await assert.isTrue(await onigiri.affiliateCommission.call(REFERRAL_0) == 0, "affiliateCommission should be == 0");
    });

    it("should update affiliateCommissionWithdrawnTotal after withdrawals", async () => {
      // 1 - invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      let referral_0_commission = await onigiri.affiliateCommission.call(REFERRAL_0);

      // 1 - withdraw
      await onigiri.withdrawAffiliateCommission({
        from: REFERRAL_0
      });

      assert.equal(0, new web3.utils.BN(await onigiri.affiliateCommissionWithdrawnTotal.call()).cmp(referral_0_commission), "wrong affiliateCommissionWithdrawnTotal after first withdrawal");

      // 2 - invest
      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("0.5")
      });

      let referral_1_commission = await onigiri.affiliateCommission.call(REFERRAL_1);

      // 2 - withdraw
      await onigiri.withdrawAffiliateCommission({
        from: REFERRAL_1
      });

      assert.equal(0, new web3.utils.BN(await onigiri.affiliateCommissionWithdrawnTotal.call()).cmp(referral_0_commission.add(referral_1_commission)), "wrong affiliateCommissionWithdrawnTotal after second withdrawal");
    });

    it("should transfer correct amount of eth", async () => {
      //  invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      let dev_0_escrow_commission_balance = await onigiri.devCommission.call(DEV_0_ESCROW);
      let dev_0_escrow_contract_balance_before = new web3.utils.BN(await web3.eth.getBalance(DEV_0_ESCROW));

      // withdraw
      let withdrawTX = await onigiri.withdrawDevCommission({
        from: DEV_0_ESCROW
      });
      let gasUsed = withdrawTX.receipt.gasUsed;
      let gasPrice = (await web3.eth.getTransaction(withdrawTX.tx)).gasPrice;
      let weiUsed = new web3.utils.BN(gasUsed).mul(new web3.utils.BN(gasPrice));

      let dev_0_escrow_contract_balance_after = new web3.utils.BN(await web3.eth.getBalance(DEV_0_ESCROW));

      assert.equal(0, dev_0_escrow_commission_balance.cmp(dev_0_escrow_contract_balance_after.add(weiUsed).sub(dev_0_escrow_contract_balance_before)), "wrong commission was transferred");
    });
  });
});