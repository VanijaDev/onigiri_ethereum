import {
    OnigiriData
} from "../blockchain/contract";

const App = {
    currentAddress: null,
    currentBalance: null,
    tokenContract: null,
    tokenOwnerAddr: null,

    start: async () => {
        App.createContract();
        App.setupEventListeners();
    },

    createContract: () => {
        App.tokenContract = web3.eth.contract(OnigiriData.abi).at(OnigiriData.address);
        console.log(App.tokenContract);
    },

    setupEventListeners: () => {
        console.log("setup");
    },

    //  OWNER

    getTokenOwner: async () => {
        return new Promise(resolve => {
            App.tokenContract.owner((err, res) => {
                if (err) {
                    console.error(err);
                } else {
                    resolve(res);
                }
            });
        });
    },

    getTokenBalance: async (addr) => {
        return new Promise(resolve => {
            App.tokenContract.balanceOf(addr, (err, res) => {
                if (err) {
                    console.error(err);
                } else {
                    resolve(web3.fromWei(res, "wei"));
                }
            });
        });
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

    getCurrentAddressBalance_eth: async () => {
        return new Promise(resolve => {
            web3.eth.getBalance(App.currentAddress, function (err, res) {
                if (err) {
                    console.error("getCurrentAddressBalance_eth: ", err);
                } else {
                    resolve(web3.fromWei(res.toNumber(), 'ether'));
                }
            });
        });
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

window.addEventListener("focus", function () {
    console.log("focus");
});