const Onigiri = artifacts.require("./Onigiri.sol");

const {
  time,
  ether,
  shouldFail
} = require("openzeppelin-test-helpers");

contract("Updating values", (accounts) => {
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

  describe("Invested", () => {
    it("should emit single event on invest function", async () => {
      let tx = await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("0.5")
      });

      assert.equal(1, tx.logs.length, "should be 1 event");
    });

    it("should validate Invested includes correct data", async () => {
      let tx = await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("0.5")
      });

      let event = tx.logs[0];
      assert.equal("Invested", event.event, "wrong event name");
      assert.equal(INVESTOR_1, event.args.investor, "wrong investor address");
      assert.equal(0, ether("0.5").cmp(new web3.utils.BN(event.args.amount)), "wrong amount");
    });
  });

  describe("Reinvested", () => {
    it("should emit single event on reinvest function", async () => {
      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("0.5")
      });

      await time.increase(time.duration.days(1));

      let tx = await onigiri.reinvestProfit({
        from: INVESTOR_1,
      });

      assert.equal(1, tx.logs.length, "should be 1 event");
    });

    it("should validate Reinvested includes correct data", async () => {
      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("0.5")
      });

      await time.increase(time.duration.days(1));

      let profit = await onigiri.calculateProfit.call(INVESTOR_1);
      let tx = await onigiri.reinvestProfit({
        from: INVESTOR_1,
      });

      let event = tx.logs[0];
      assert.equal("Reinvested", event.event, "wrong event name");
      assert.equal(INVESTOR_1, event.args.investor, "wrong investor address");
      assert.equal(0, profit.cmp(new web3.utils.BN(event.args.amount)), "wrong amount");
    });
  });

  describe("WithdrawnAffiliateCommission", () => {
    it("should emit single event on withdrawAffiliateCommission function", async () => {
      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("0.5")
      });

      await time.increase(time.duration.days(1));

      let tx = await onigiri.withdrawAffiliateCommission({
        from: REFERRAL_1,
      });

      assert.equal(1, tx.logs.length, "should be 1 event");
    });

    it("should validate WithdrawnAffiliateCommission includes correct data", async () => {
      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("0.5")
      });

      await time.increase(time.duration.days(1));
      let commission = await onigiri.affiliateCommission.call(REFERRAL_1);

      let tx = await onigiri.withdrawAffiliateCommission({
        from: REFERRAL_1,
      });

      let event = tx.logs[0];
      assert.equal("WithdrawnAffiliateCommission", event.event, "wrong event name");
      assert.equal(REFERRAL_1, event.args.affiliate, "wrong affiliate address");
      assert.equal(0, commission.cmp(new web3.utils.BN(event.args.amount)), "wrong amount");
    });
  });

  describe("WithdrawnProfit", () => {
    it("should emit single event on withdrawProfit function", async () => {
      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("0.5")
      });

      await time.increase(time.duration.days(1));

      let profit = await onigiri.calculateProfit.call(INVESTOR_1);
      let tx = await onigiri.withdrawProfit(profit, {
        from: INVESTOR_1,
      });

      assert.equal(1, tx.logs.length, "should be 1 event");
    });

    it("should validate WithdrawnProfit includes correct data", async () => {
      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("0.5")
      });

      await time.increase(time.duration.days(1));
      let profit = await onigiri.calculateProfit.call(INVESTOR_1);

      let tx = await onigiri.withdrawProfit(profit, {
        from: INVESTOR_1,
      });

      let event = tx.logs[0];
      assert.equal("WithdrawnProfit", event.event, "wrong event name");
      assert.equal(INVESTOR_1, event.args.investor, "wrong investor address");
      assert.equal(0, profit.cmp(new web3.utils.BN(event.args.amount)), "wrong amount");
    });
  });

  describe("WithdrawnLockbox", () => {
    it("should emit single event on withdrawLockBoxAndClose function", async () => {
      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("0.5")
      });

      await time.increase(time.duration.days(1));

      let tx = await onigiri.withdrawLockBoxAndClose({
        from: INVESTOR_1,
      });

      assert.equal(1, tx.logs.length, "should be 1 event");
    });

    it("should validate WithdrawnLockbox includes correct data", async () => {
      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("0.5")
      });

      await time.increase(time.duration.days(1));

      let lockboxAmount = (await onigiri.investors.call(INVESTOR_1)).lockbox;

      let tx = await onigiri.withdrawLockBoxAndClose({
        from: INVESTOR_1,
      });

      let event = tx.logs[0];
      assert.equal("WithdrawnLockbox", event.event, "wrong event name");
      assert.equal(INVESTOR_1, event.args.investor, "wrong investor address");
      assert.equal(0, lockboxAmount.cmp(new web3.utils.BN(event.args.amount)), "wrong amount");
    });
  });

  describe("Migrated", () => {
    it("should emit single event on migration function", async () => {
      let addresses = [INVESTOR_0, INVESTOR_1];
      let amounts = [ether("2.5"), ether("2")];
      await onigiri.addAddressesAndAmountsToMigrate(addresses, amounts);

      let tx = await onigiri.migrateFunds({
        from: INVESTOR_0,
        value: ether("2.5")
      });

      assert.equal(1, tx.logs.length, "should be 1 event");
    });

    it("should validate WithdrawnLockbox includes correct data", async () => {
      let addresses = [INVESTOR_0, INVESTOR_1];
      let amounts = [ether("2.5"), ether("2")];
      await onigiri.addAddressesAndAmountsToMigrate(addresses, amounts);

      let tx = await onigiri.migrateFunds({
        from: INVESTOR_0,
        value: ether("2.5")
      });

      let event = tx.logs[0];
      assert.equal("Migrated", event.event, "wrong event name");
      assert.equal(INVESTOR_0, event.args.investor, "wrong migrator address");
      assert.equal(ether("2.5").toString(), event.args.amount.toString(), "wrong amount");
    });
  });
});