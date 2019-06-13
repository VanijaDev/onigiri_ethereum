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
      await time.increase(time.duration.hours(570));
      await onigiri.withdrawProfit({
        from: INVESTOR_0
      });
      // console.log("getBalance: ", new web3.utils.BN(await web3.eth.getBalance(onigiri.address)).toString());
      // console.log("affiliateCommission: ", new web3.utils.BN(await await onigiri.affiliateCommission.call(REFERRAL_0)).toString());

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

  describe("withdrawProfit", () => {
    it("should fail if no profit", async () => {
      await shouldFail(onigiri.withdrawProfit(100, {
        from: INVESTOR_0
      }), "should fail if no profit");
    });

    it("should fail if left amount will be less, than guaranteedBalance", async () => {
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });
      await time.increase(time.duration.days(25));
      // console.log("balance:     ", new web3.utils.BN(await web3.eth.getBalance(onigiri.address)).toString());
      // console.log("guaranteed:  ", (await onigiri.guaranteedBalance.call()).toString());

      await shouldFail(onigiri.withdrawProfit({
        from: INVESTOR_0
      }), "should fail if left amount will be less, than guaranteedBalance");
    });

    it("should update investor's withdrawn", async () => {
      //  1 - invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      //  1 - withdraw
      await time.increase(time.duration.days(1));
      let profit_1 = new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_0));
      await onigiri.withdrawProfit({
        from: INVESTOR_0
      });
      let withdrawn_1 = (await onigiri.investors.call(INVESTOR_0)).withdrawn;
      assert.equal(0, profit_1.cmp(withdrawn_1), "profit_1 should be == withdrawn_1");

      //  2 - withdraw
      await time.increase(time.duration.days(2));
      let profit_2 = new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_0));
      await onigiri.withdrawProfit({
        from: INVESTOR_0
      });
      let withdrawn_2 = (await onigiri.investors.call(INVESTOR_0)).withdrawn;
      assert.equal(0, withdrawn_2.cmp(profit_1.add(profit_2)), "withdrawn_2 should be == (profit_1 + profit_2)");
    });

    it("should update withdrawnProfitTotal after multiple withdrawals", async () => {
      //  1 - invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("2")
      });

      //  1 - withdraw INVESTOR_0
      await time.increase(time.duration.days(1));
      let investor_0_profit_1 = new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_0));
      await onigiri.withdrawProfit({
        from: INVESTOR_0
      });
      let withdrawnProfitTotal = await onigiri.withdrawnProfitTotal.call();
      assert.equal(0, withdrawnProfitTotal.cmp(investor_0_profit_1), "wrong withdrawnProfitTotal after first withdrawal");

      //  1 - withdraw INVESTOR_1
      await time.increase(time.duration.days(1));
      let investor_1_profit_1 = new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_1));
      await onigiri.withdrawProfit({
        from: INVESTOR_1
      });
      withdrawnProfitTotal = await onigiri.withdrawnProfitTotal.call();
      assert.equal(0, withdrawnProfitTotal.cmp(investor_0_profit_1.add(investor_1_profit_1)), "wrong withdrawnProfitTotal after second withdrawal");

      //  2 - invest
      let investor_0_profit_2_before = new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_0));
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("3")
      });

      //  2 - withdraw INVESTOR_0
      await time.increase(time.duration.days(1));
      let investor_0_profit_2 = new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_0));
      await onigiri.withdrawProfit({
        from: INVESTOR_0
      });
      withdrawnProfitTotal = await onigiri.withdrawnProfitTotal.call();
      // console.log("withdrawnProfitTotal: ", withdrawnProfitTotal.toString());
      assert.equal(0, withdrawnProfitTotal.cmp(investor_0_profit_1.add(investor_1_profit_1).add(investor_0_profit_2).add(investor_0_profit_2_before)), "wrong withdrawnProfitTotal after third withdrawal");
    });

    it("should add 1% devCommission to each developer after multiple withdrawals", async () => {
      //  1 - invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("2")
      });

      //  1 - withdraw INVESTOR_0
      await time.increase(time.duration.days(1));

      let investor_0_profit_1 = new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_0));
      // console.log("investor_0_profit_1:    ", investor_0_profit_1.toString());
      let dev_escrow_0_1_before = new web3.utils.BN(await onigiri.devCommission.call(DEV_0_ESCROW));
      // console.log("dev_escrow_0_1_before: ", dev_escrow_0_1_before.toString());

      await onigiri.withdrawProfit({
        from: INVESTOR_0
      });
      let dev_escrow_0_1_after = new web3.utils.BN(await onigiri.devCommission.call(DEV_0_ESCROW));
      let dev_escrow_1_1_after = new web3.utils.BN(await onigiri.devCommission.call(DEV_1_ESCROW));
      // console.log("dev_escrow_0_1_after:  ", dev_escrow_0_1_after.toString());
      assert.equal(0, investor_0_profit_1.div(new web3.utils.BN(100)).cmp(dev_escrow_0_1_after.sub(dev_escrow_0_1_before)), "should be 1% of profit for INVESTOR_0");
      assert.equal(0, dev_escrow_0_1_after.cmp(dev_escrow_1_1_after), "DEV_0_ESCROW balance should be == DEV_1_ESCROW balance");

      //  2 - withdraw INVESTOR_1
      await time.increase(time.duration.days(1));

      let investor_1_profit_1 = new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_1));
      // console.log("investor_1_profit_1:   ", investor_1_profit_1.toString());
      let dev_escrow_0_2_before = new web3.utils.BN(await onigiri.devCommission.call(DEV_0_ESCROW));
      // console.log("dev_escrow_0_2_before: ", dev_escrow_0_2_before.toString());

      await onigiri.withdrawProfit({
        from: INVESTOR_1
      });
      let dev_escrow_0_2_after = new web3.utils.BN(await onigiri.devCommission.call(DEV_0_ESCROW));
      let dev_escrow_1_2_after = new web3.utils.BN(await onigiri.devCommission.call(DEV_1_ESCROW));
      // console.log("dev_escrow_0_2_after:  ", dev_escrow_0_2_after.toString());
      assert.equal(0, investor_1_profit_1.div(new web3.utils.BN(100)).cmp(dev_escrow_0_2_after.sub(dev_escrow_0_2_before)), "should be 1% of profit for INVESTOR_0 after second withdrawal");
      assert.equal(0, dev_escrow_0_2_after.cmp(dev_escrow_1_2_after), "DEV_0_ESCROW balance should be == DEV_1_ESCROW balance after second withdrawal");

      //  3 - invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("3")
      });

      //  4 - withdraw INVESTOR_0
      await time.increase(time.duration.days(1));

      let investor_0_profit_3 = new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_0));
      // console.log("investor_0_profit_3:    ", investor_0_profit_3.toString());
      let dev_escrow_0_3_before = new web3.utils.BN(await onigiri.devCommission.call(DEV_0_ESCROW));
      // console.log("dev_escrow_0_3_before: ", dev_escrow_0_3_before.toString());

      await onigiri.withdrawProfit({
        from: INVESTOR_0
      });

      let dev_escrow_0_3_after = new web3.utils.BN(await onigiri.devCommission.call(DEV_0_ESCROW));
      let dev_escrow_1_3_after = new web3.utils.BN(await onigiri.devCommission.call(DEV_1_ESCROW));
      // console.log("dev_escrow_0_3_after:  ", dev_escrow_0_3_after.toString());
      assert.equal(0, investor_0_profit_3.div(new web3.utils.BN(100)).cmp(dev_escrow_0_3_after.sub(dev_escrow_0_3_before)), "should be 1% of profit for INVESTOR_0");
      assert.equal(0, dev_escrow_0_3_after.cmp(dev_escrow_1_3_after), "DEV_0_ESCROW balance should be == DEV_1_ESCROW balance after third withdrawal");
    });

    it("should transfer 95% of profit to investor", async () => {
      //  1 - invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      await time.increase(time.duration.days(1));
      let profit = new web3.utils.BN(await onigiri.calculateProfit.call(INVESTOR_0));
      let balance_before = new web3.utils.BN(await web3.eth.getBalance(INVESTOR_0));

      let withdrawTX = await onigiri.withdrawProfit({
        from: INVESTOR_0
      });
      let gasUsed = withdrawTX.receipt.gasUsed;
      let gasPrice = (await web3.eth.getTransaction(withdrawTX.tx)).gasPrice;
      let weiUsed = new web3.utils.BN(gasUsed).mul(new web3.utils.BN(gasPrice));

      let balance_after = new web3.utils.BN(await web3.eth.getBalance(INVESTOR_0));

      assert.equal(0, (profit.div(new web3.utils.BN(100)).mul(new web3.utils.BN(95)).cmp(balance_after.add(weiUsed).sub(balance_before))), "95% of profit shouold be transferred as profit");
    });
  });

  describe("withdrawLockBoxAndClose", async () => {
    it("should fail if no lockbox", async () => {
      await shouldFail(onigiri.withdrawLockBoxAndClose({
        from: INVESTOR_0
      }), "should fail if no deposits made");
    });

    it("should remove all data about investor", async () => {
      //  1 - invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      //  2 withdraw
      await time.increase(time.duration.days(1));
      await onigiri.withdrawProfit({
        from: INVESTOR_0
      });

      //  3 investor data should be populated
      assert.isTrue((await onigiri.investors.call(INVESTOR_0)).invested > 0, "invested should be > 0");
      assert.isTrue((await onigiri.investors.call(INVESTOR_0)).lockbox > 0, "lockbox should be > 0");
      assert.isTrue((await onigiri.investors.call(INVESTOR_0)).withdrawn > 0, "withdrawn should be > 0");
      assert.isTrue((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime > 0, "lastInvestmentTime should be > 0");

      //  4 - withdrawLockBoxAndClose INVESTOR_0
      await time.increase(time.duration.days(1));
      await onigiri.withdrawLockBoxAndClose({
        from: INVESTOR_0
      });

      //  5 investor data should be populated
      assert.isTrue((await onigiri.investors.call(INVESTOR_0)).invested == 0, "invested should be == 0");
      assert.isTrue((await onigiri.investors.call(INVESTOR_0)).lockbox == 0, "lockbox should be == 0");
      assert.isTrue((await onigiri.investors.call(INVESTOR_0)).withdrawn == 0, "withdrawn should be == 0");
      assert.isTrue((await onigiri.investors.call(INVESTOR_0)).lastInvestmentTime == 0, "lastInvestmentTime should be == 0");
    });

    it("should substract investors total amount", async () => {
      //  1 - invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("1")
      });

      await onigiri.invest(REFERRAL_1, {
        from: OTHER_ADDR,
        value: ether("1")
      });

      assert.equal(0, (await onigiri.investorsCount.call()).cmp(new web3.utils.BN(3)), "should be 3 investors before");

      //  2 withdraw
      await time.increase(time.duration.days(1));
      await onigiri.withdrawLockBoxAndClose({
        from: INVESTOR_0
      });
      assert.equal(0, (await onigiri.investorsCount.call()).cmp(new web3.utils.BN(2)), "should be 2 investors after");
    });

    it("should transfer correct amount to investor", async () => {
      //  1 - invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      let investor_0_balance_before = new web3.utils.BN(await web3.eth.getBalance(INVESTOR_0));

      let lockboxAmount = (await onigiri.investors.call(INVESTOR_0)).lockbox;
      console.log();
      let closeTX = await onigiri.withdrawLockBoxAndClose({
        from: INVESTOR_0
      });
      let gasUsed = closeTX.receipt.gasUsed;
      let gasPrice = (await web3.eth.getTransaction(closeTX.tx)).gasPrice;
      let weiUsed = new web3.utils.BN(gasUsed).mul(new web3.utils.BN(gasPrice));

      let investor_0_balance_after = new web3.utils.BN(await web3.eth.getBalance(INVESTOR_0));

      assert.equal(0, lockboxAmount.cmp(investor_0_balance_after.add(weiUsed).sub(investor_0_balance_before)), "wrong lockbox transferred");
    });
  });
});