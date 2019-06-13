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

  describe("addAddressesAndAmountsToMigrate", () => {
    it("should fail if not owner calls ", async () => {
      let addresses = [INVESTOR_0, INVESTOR_1];
      let amounts = [ether("2.5"), ether("2")];

      await shouldFail(onigiri.addAddressesAndAmountsToMigrate(addresses, amounts, {
        from: REFERRAL_0
      }), "should fail if not owner");
    });

    it("should fail if arrays length are different", async () => {
      let addresses = [INVESTOR_0, INVESTOR_1, REFERRAL_0];
      let amounts = [ether("2.5"), ether("2")];

      await shouldFail(onigiri.addAddressesAndAmountsToMigrate(addresses, amounts), "should fail if arrays length are different");
    });

    it("should update amountForAddressToMigrate with correct values", async () => {
      let addresses = [INVESTOR_0, INVESTOR_1];
      let amounts = [ether("2.5"), ether("2")];
      await onigiri.addAddressesAndAmountsToMigrate(addresses, amounts);

      assert.equal((await onigiri.amountForAddressToMigrate(addresses[0])).toString(), amounts[0].toString(), "wrong amount for 0 index values");
      assert.equal((await onigiri.amountForAddressToMigrate(addresses[1])).toString(), amounts[1].toString(), "wrong amount for 1 index values");
    });
  });

  describe("migrateFunds", () => {
    it("should fail if address balance in migration list is 0", async () => {
      await shouldFail(onigiri.migrateFunds({
        from: INVESTOR_0,
        value: ether("2")
      }), "should fail if no balance to migrate");
    });

    it("should fail is sent amount != to value in amountForAddressToMigrate", async () => {
      let addresses = [INVESTOR_0, INVESTOR_1];
      let amounts = [ether("2.5"), ether("2")];
      await onigiri.addAddressesAndAmountsToMigrate(addresses, amounts);

      await shouldFail(onigiri.migrateFunds({
        from: INVESTOR_0,
        value: ether("2")
      }), "should fail if wrong amount sent");
    });

    it("should set amountForAddressToMigrate to 0 after migration", async () => {
      let addresses = [INVESTOR_0, INVESTOR_1];
      let amounts = [ether("2.5"), ether("2")];
      await onigiri.addAddressesAndAmountsToMigrate(addresses, amounts);

      //  1
      assert.equal(amounts[0].toString(), (await onigiri.amountForAddressToMigrate(addresses[0])).toString(), "wrong migration value before migration");

      await onigiri.migrateFunds({
        from: INVESTOR_0,
        value: ether("2.5")
      });

      //  2
      assert.equal(0, (await onigiri.amountForAddressToMigrate(addresses[0])).toString(), "migration value should be 0 after migration");
    });

    it("should increment investorsCount if first time deposit", async () => {
      let addresses = [INVESTOR_0, INVESTOR_1];
      let amounts = [ether("2.5"), ether("2")];
      await onigiri.addAddressesAndAmountsToMigrate(addresses, amounts);

      //  1
      assert.equal(0, (await onigiri.investorsCount.call()).toString(), "investorsCount should be 0 before migration");

      await onigiri.migrateFunds({
        from: INVESTOR_0,
        value: ether("2.5")
      });

      //  2
      assert.equal(1, (await onigiri.investorsCount.call()).toString(), "investorsCount should be 1 after migration");
    });

    it("should not increment investorsCount if not first time deposit", async () => {
      let addresses = [INVESTOR_0, INVESTOR_1];
      let amounts = [ether("2.5"), ether("2")];
      await onigiri.addAddressesAndAmountsToMigrate(addresses, amounts);

      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("1")
      });

      //  1
      assert.equal(1, (await onigiri.investorsCount.call()).toString(), "investorsCount should be 1 before migration");

      await onigiri.migrateFunds({
        from: INVESTOR_0,
        value: ether("2.5")
      });

      //  2
      assert.equal(1, (await onigiri.investorsCount.call()).toString(), "investorsCount should still be 1 after migration");
    });

    it("should correctly update lockbox on first time deposit", async () => {
      let addresses = [INVESTOR_0, INVESTOR_1];
      let amounts = [ether("2.5"), ether("2")];
      await onigiri.addAddressesAndAmountsToMigrate(addresses, amounts);

      //  1
      assert.equal(0, (await onigiri.getLockBox.call(INVESTOR_1)).toString(), "lockbox for INVESTOR_1 should be 0 before migration");

      await onigiri.migrateFunds({
        from: INVESTOR_1,
        value: ether("2")
      });

      //  2
      assert.equal(ether("2").toString(), (await onigiri.getLockBox.call(INVESTOR_1)).toString(), "lockbox for INVESTOR_1 should be 2 ETH after migration");
    });

    it("should correctly update lockbox on not first time deposit", async () => {
      let addresses = [INVESTOR_0, INVESTOR_1];
      let amounts = [ether("2.5"), ether("2")];
      await onigiri.addAddressesAndAmountsToMigrate(addresses, amounts);

      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("1")
      });

      //  1
      assert.equal(ether("0.84").toString(), (await onigiri.getLockBox.call(INVESTOR_1)).toString(), "lockbox for INVESTOR_1 should be 0.84 ETH before migration");

      await onigiri.migrateFunds({
        from: INVESTOR_1,
        value: ether("2")
      });

      //  2
      assert.equal(ether("2.84").toString(), (await onigiri.getLockBox.call(INVESTOR_1)).toString(), "lockbox for INVESTOR_1 should be 2.84 ETH after migration");
    });

    it("should correctly update invested on first time deposit", async () => {
      let addresses = [INVESTOR_0, INVESTOR_1];
      let amounts = [ether("2.5"), ether("2")];
      await onigiri.addAddressesAndAmountsToMigrate(addresses, amounts);

      //  1
      assert.equal(0, (await onigiri.getLockBox.call(INVESTOR_1)).toString(), "invested for INVESTOR_1 should be 0 before migration");

      await onigiri.migrateFunds({
        from: INVESTOR_1,
        value: ether("2")
      });

      //  2
      assert.equal(ether("2").toString(), (await onigiri.getInvested.call(INVESTOR_1)).toString(), "invested for INVESTOR_1 should be 2 ETH after migration");
    });

    it("should correctly update invested on not first time deposit", async () => {
      let addresses = [INVESTOR_0, INVESTOR_1];
      let amounts = [ether("2.5"), ether("2")];
      await onigiri.addAddressesAndAmountsToMigrate(addresses, amounts);

      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("1")
      });

      //  1
      assert.equal(ether("1").toString(), (await onigiri.getInvested.call(INVESTOR_1)).toString(), "invested for INVESTOR_1 should be 1 ETH before migration");

      await onigiri.migrateFunds({
        from: INVESTOR_1,
        value: ether("2")
      });

      //  2
      assert.equal(ether("3").toString(), (await onigiri.getInvested.call(INVESTOR_1)).toString(), "invested for INVESTOR_1 should be 3 ETH after migration");
    });

    it("should update lastInvestmentTime to now after migration", async () => {
      let addresses = [INVESTOR_0, INVESTOR_1];
      let amounts = [ether("2.5"), ether("2")];
      await onigiri.addAddressesAndAmountsToMigrate(addresses, amounts);

      await onigiri.migrateFunds({
        from: INVESTOR_1,
        value: ether("2")
      });

      assert.equal(0, (await time.latest()).cmp((await onigiri.investors.call(INVESTOR_1)).lastInvestmentTime), "lastInvestmentTime should be 0 before");
    });

    it("should delete withdrawn if were after migration", async () => {
      let addresses = [INVESTOR_0, INVESTOR_1];
      let amounts = [ether("2.5"), ether("2")];
      await onigiri.addAddressesAndAmountsToMigrate(addresses, amounts);

      //  1 - invest
      await onigiri.invest(REFERRAL_0, {
        from: INVESTOR_0,
        value: ether("0.5")
      });

      //  2 - withdraw profit
      await time.increase(time.duration.days(1));
      await onigiri.withdrawProfit({
        from: INVESTOR_0
      });
      assert.isTrue(await onigiri.getWithdrawn.call(INVESTOR_0) > 0, "withdrawn should be > 0");

      //  3 - migrate
      await onigiri.migrateFunds({
        from: INVESTOR_0,
        value: ether("2.5")
      });
      assert.isTrue(await onigiri.getWithdrawn.call(INVESTOR_0) == 0, "withdrawn should be == 0");
    });

    it("should correctly update lockboxTotal on first time deposit", async () => {
      let addresses = [INVESTOR_0, INVESTOR_1];
      let amounts = [ether("2.5"), ether("2")];
      await onigiri.addAddressesAndAmountsToMigrate(addresses, amounts);

      //  1
      assert.equal(0, (await onigiri.lockboxTotal.call()).toString(), "lockboxTotal should be 0 before migration");

      await onigiri.migrateFunds({
        from: INVESTOR_1,
        value: ether("2")
      });

      //  2
      assert.equal(ether("2").toString(), (await onigiri.lockboxTotal.call()).toString(), "lockboxTotal should be 2 ETH after migration");
    });

    it("should correctly update lockboxTotal on not first time deposit", async () => {
      let addresses = [INVESTOR_0, INVESTOR_1];
      let amounts = [ether("2.5"), ether("2")];
      await onigiri.addAddressesAndAmountsToMigrate(addresses, amounts);

      await onigiri.invest(REFERRAL_1, {
        from: INVESTOR_1,
        value: ether("1")
      });

      //  1
      assert.equal(ether("0.84").toString(), (await onigiri.lockboxTotal.call()).toString(), "lockboxTotal should be 0.84 ETH before migration");

      await onigiri.migrateFunds({
        from: INVESTOR_1,
        value: ether("2")
      });

      //  2
      assert.equal(ether("2.84").toString(), (await onigiri.lockboxTotal.call()).toString(), "lockboxTotal should be 2.84 ETH after migration");
    });
  });
});