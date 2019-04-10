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

    assert.equal(0, ether("0.02").cmp(await onigiri.devCommission.call(OTHER_ADDR, {
      from: OTHER_ADDR
    })), "OTHER_ADDR dev commission is wrong");
  });

  it("should fail if not developer escrow tries to update", async () => {
    await shouldFail(onigiri.updateDevEscrow(OTHER_ADDR, {
      from: OTHER_ADDR
    }), "should fail, because not developer escrow tries to update");
  });
});