const Onigiri = artifacts.require("./Onigiri.sol");
const BigNumber = require("bignumber.js");

const {
  time,
  ether,
  shouldFail
} = require("openzeppelin-test-helpers");

/**
 * IMPORTANT:
 * Separate Blockchain should be run for each test.
 */

contract("Investments and donations", (accounts) => {
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

  it("should fail on invest > 50 ETH if balance is < 500 ETH", async () => {
    console.log("\n\n UNCOMMENT FOR TESTS\n\n");
    // //  test
    // await shouldFail(onigiri.invest(REFERRAL_0, {
    //   from: INVESTOR_0,
    //   value: ether("51")
    // }), "0 - should fail on invest > 50 ETH if balance is < 500 ETH");

    // //  50
    // await onigiri.invest(REFERRAL_0, {
    //   from: OTHER_ADDR,
    //   value: ether("50")
    // });

    // //  95
    // await onigiri.invest(REFERRAL_0, {
    //   from: OTHER_ADDR,
    //   value: ether("45")
    // });

    // //  140
    // await onigiri.invest(REFERRAL_0, {
    //   from: REFERRAL_1,
    //   value: ether("50")
    // });

    // //  185
    // await onigiri.invest(REFERRAL_0, {
    //   from: REFERRAL_1,
    //   value: ether("45")
    // });

    // //  test
    // await shouldFail(onigiri.invest(REFERRAL_0, {
    //   from: INVESTOR_0,
    //   value: ether("51")
    // }), "1 - should fail on invest > 50 ETH if balance is < 500 ETH");

    // //  235
    // await onigiri.invest(REFERRAL_0, {
    //   from: DEV_0_ESCROW,
    //   value: ether("50")
    // });

    // //  280
    // await onigiri.invest(REFERRAL_0, {
    //   from: DEV_0_ESCROW,
    //   value: ether("45")
    // });

    // //  330
    // await onigiri.invest(REFERRAL_0, {
    //   from: DEV_1_ESCROW,
    //   value: ether("50")
    // });

    // //  375
    // await onigiri.invest(REFERRAL_0, {
    //   from: DEV_1_ESCROW,
    //   value: ether("45")
    // });

    // //  425
    // await onigiri.invest(REFERRAL_0, {
    //   from: DEV_0_MASTER,
    //   value: ether("50")
    // });

    // //  470
    // await onigiri.invest(REFERRAL_0, {
    //   from: DEV_0_MASTER,
    //   value: ether("45")
    // });

    // //  test
    // await shouldFail(onigiri.invest(REFERRAL_0, {
    //   from: INVESTOR_0,
    //   value: ether("51")
    // }), "3 - should fail on invest > 50 ETH if balance is < 500 ETH");

    // //  520
    // await onigiri.invest(REFERRAL_0, {
    //   from: DEV_1_MASTER,
    //   value: ether("50")
    // });

    // //  570
    // await onigiri.invest(REFERRAL_0, {
    //   from: INVESTOR_1,
    //   value: ether("50")
    // });

    // //  625
    // await onigiri.invest(REFERRAL_0, {
    //   from: INVESTOR_1,
    //   value: ether("45")
    // });

    // console.log(BigNumber(await onigiri.lockboxTotal.call()).toNumber());

    // //  test
    // await onigiri.invest(REFERRAL_0, {
    //   from: INVESTOR_0,
    //   value: ether("51")
    // });
  });
});