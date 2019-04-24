import {
    OnigiriData
} from "../blockchain/contract";

const App = {
    onigiriBankContract: null,
    currentAddress: null,
    currentAddressLockBox: null,

    start: async () => {
        App.createContract();
        App.setupEventListeners();

        App.currentAddress = await App.getCurrentAddress();
    },

    createContract: () => {
        console.warn("TODO: use deployed contract");
        App.onigiriBankContract = OnigiriData.build();

        console.log(App.onigiriBankContract);
        console.log("OnigiriBank contract was just created.");
    },

    getCurrentAddress: async () => {
        return new Promise(resolve => {
            web3.eth.getAccounts(function (err, res) {
                if (err) {
                    console.error("getCurrentAddress: ", err);
                } else {
                    resolve(res[0]);
                }
            });
        });
    },

    setupEventListeners: () => {
        console.log("setupEventListeners");

        App.onigiriBankContract.Invested({
            from: App.currentAddress
        }, (err, res) => {
            if (err) {
                console.error(err);
            } else {
                console.log("Transfer event caught with res: ", res);
                document.getElementById("ActiveLockBox").innerText = res;
            }
        });
    },

    //  READ

    getLockBox: async () => {
        console.log("getLockBox start... ");
        App.onigiriBankContract.getLockBox((err, res) => {
            if (err) {
                console.error(err);
            } else {
                App.currentAddressLockBox = res;
                document.getElementById("ActiveLockBox").innerText = web3.fromWei(res, 'ether') + " ETH";
            }
            console.log("getLockBox finish... ");
        });
    },

    getActiveProfit: async () => {
        console.log("getActiveProfit start... ");
        App.onigiriBankContract.calculateProfit(App.currentAddress, (err, res) => {
            if (err) {
                console.error(err);
            } else {
                document.getElementById("activeProfit").innerText = web3.fromWei(res, 'ether') + " ETH";
            }
            console.log("getActiveProfit finish... ");
        });
    },

    getUserwithdrawnTotal: async () => {
        console.log("getUserwithdrawnTotal start... ");
        App.onigiriBankContract.withdrawnProfitTotal((err, res) => {
            if (err) {
                console.error(err);
            } else {
                document.getElementById("userwithdrawnTotal").innerText = web3.fromWei(res, 'ether') + " ETH";
            }
            console.log("getUserwithdrawnTotal finish... ");
        });
    },

    getActiveCommision: async () => {
        console.log("getActiveCommision start... ");
        App.onigiriBankContract.affiliateCommission(App.currentAddress, (err, res) => {
            if (err) {
                console.error(err);
            } else {
                document.getElementById("activeCommision").innerText = web3.fromWei(res, 'ether') + " ETH";
            }
            console.log("getActiveCommision finish... ");
        });
    },

    getPayoutPersent: async () => {
        console.log("getPayoutPersent start... ");
        App.onigiriBankContract.percentRate(App.currentAddressLockBox, (err, res) => {
            if (err) {
                console.error(err);
            } else {
                document.getElementById("payoutPersent").innerText = web3.fromWei(res, 'ether') + " ETH";
            }
            console.log("getPayoutPersent finish... ");
        });
    },

    //  WRITE
    investETH: async () => {
        let parsedAmount = parseFloat(document.getElementById("investAmount").value);
        if (parsedAmount > 0) {
            let affiliate = "0x000000000000000000000000000000";

            console.log("investETH start... ");
            return new Promise(resolve => {
                App.onigiriBankContract.invest(affiliate, (err, res) => {
                    if (err) {
                        console.error("invest: ", err);
                    } else {
                        resolve(res);
                    }

                    console.log("investETH finish... ");
                });
            });

        } else {
            alert("wrong amount of ETH");
        }
    },

    withdrawLockbox: async () => {
        console.log("withdrawLockbox start... ");
    },

    withdrawProfit: async () => {
        console.log("withdrawProfit start... ");
    },

    reinvestProfit: async () => {
        console.log("reinvestProfit start... ");
    },

    withdrawAffiliateCommision: async () => {
        console.log("withdrawAffiliateCommision start... ");
    }
}

window.App = App;

window.addEventListener('load', async () => {
    console.log("load new");
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            await ethereum.enable();

            App.start();
        } catch (error) {
            console.error("ethereum.enable() ERROR: ", error);
            alert(error);
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
    }
    // Non-dapp browsers...
    else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
});

window.addEventListener("focus", async () => {
    console.log("focus");

    App.currentAddress = await App.getCurrentAddress();
});