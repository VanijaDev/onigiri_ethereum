import {
    OnigiriData
} from "../blockchain/contract";

//  TODO: remove console.logs
const App = {
    onigiriBankContract: null,
    rewardsAvailable: null,
    profitWithdrawalsTotal: null,
    lockBoxHolders: null,
    lockBoxAmountTotal: null,
    contractBalance: null,
    affiliateCommissionWithdrawnTotal: null,
    gamesIncomeTotal: null,
    donatedTotal: null,
    currentAddressProfitWithdrawals: null,

    currentAddress: null,
    currentAddressLockBox: null,
    currentAddressActiveProfit: null,
    currentAddressActivePersent: null,
    currentAddressActiveCommisiion: null,

    setup: async () => {
        console.log("           setup");
        App.currentAddress = await App.getCurrentAddress();
        document.getElementById("currentAddress").innerText = App.currentAddress;

        App.fetchAffiliateFromURL();
        App.createContract();
        App.setupEventListeners();
        App.updateUI();
    },

    fetchAffiliateFromURL: () => {
        let url = new URL(window.location.href);
        let searchParams = new URLSearchParams(url.search);
        let affiliate = searchParams.get('ref');
        console.log("affiliate: ", affiliate);

        if (!isNaN(affiliate) && affiliate != App.currentAddress) {
            document.getElementById("affiliateAddress").value = affiliate;
        } else {
            document.getElementById("affiliateAddress").value = "";
        }
    },

    createContract: () => {
        console.warn("TODO: use deployed contract");
        App.onigiriBankContract = OnigiriData.build();

        // console.log(App.onigiriBankContract);
        console.log("OnigiriBank contract was just created.");
    },

    getCurrentAddress: async () => {
        return new Promise(resolve => {
            web3.eth.getAccounts(function (err, res) {
                if (err) {
                    // console.error("getCurrentAddress: ", err);
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
                App.updateLockBox();
            }
        });

        App.onigiriBankContract.Renvested({
            from: App.currentAddress
        }, (err, res) => {
            if (err) {
                console.error(err);
            } else {
                App.updateLockBox();
            }
        });

        App.onigiriBankContract.WithdrawnLockbox({
            from: App.currentAddress
        }, (err, res) => {
            if (err) {
                console.error(err);
            } else {
                App.updateUI();
            }
        });

        App.onigiriBankContract.WithdrawnProfit({
            from: App.currentAddress
        }, (err, res) => {
            if (err) {
                console.error(err);
            } else {
                App.updateUI();
            }
        });

        App.onigiriBankContract.WithdrawnAffiliateCommission({
            from: App.currentAddress
        }, (err, res) => {
            if (err) {
                console.error(err);
            } else {
                App.updateUI();
            }
        });
    },

    //  Update UI
    updateUI: async () => {
        console.log("           updateUI");
        //  Dashboard
        await App.updateActiveProfit();
        await App.updateActiveCommission();
        await App.updateLockBox();
        await App.updatePercentRate(web3.toWei(App.currentAddressLockBox));
        await App.updateRewardsAvailable();
        await App.updateProfitWithdrawalsTotal();

        //  Stats
        await App.updateLockBoxHolders();
        await App.updateLockBoxAmountTotal();
        await App.updateContractBalance();
        await App.updateAffiliateCommissionWithdrawnTotal();
        await App.updateGamesIncomeTotal();
        await App.updateDonatedTotalTotal();
        await App.updateCurrentAddressProfitWithdrawals();
    },

    updateLockBox: async () => {
        App.currentAddressLockBox = web3.fromWei(await App.getLockBoxPromise(), 'ether');
        document.getElementById("activeLockBox").innerText = App.currentAddressLockBox.toFixed(4) + " ETH";
    },

    updateActiveProfit: async () => {
        App.currentAddressActiveProfit = web3.fromWei(await App.getActiveProfitPromise(), 'ether');
        document.getElementById("activeProfit").innerText = App.currentAddressActiveProfit.toFixed(4);
    },

    updateActiveCommission: async () => {
        App.currentAddressActiveCommisiion = web3.fromWei(await App.getActiveCommissionPromise(), 'ether');
        document.getElementById("activeCommision").innerText = App.currentAddressActiveCommisiion.toFixed(4);
    },

    updatePercentRate: async (lockBoxAmount) => {
        App.currentAddressActivePersent = parseInt(await App.getActivePercentRatePromise(lockBoxAmount)) / 100;
        document.getElementById("payoutPersent").innerText = App.currentAddressActivePersent;
    },

    updateRewardsAvailable: async () => {
        let contractBalance = web3.fromWei(await App.getContractBalancePromise(), 'ether');
        let guaranteedBalance = web3.fromWei(await App.getGuaranteedBalancesPromise(), 'ether');

        App.rewardsAvailable = contractBalance - guaranteedBalance;
        document.getElementById("totalRewardsPool").innerText = App.rewardsAvailable.toFixed(4);
    },

    updateProfitWithdrawalsTotal: async () => {
        App.profitWithdrawalsTotal = web3.fromWei(await App.getProfitWithdrawalsTotalPromise(), 'ether');
        document.getElementById("profitWithdrawalsTotal").innerText = App.profitWithdrawalsTotal.toFixed(4);
    },

    updateLockBoxHolders: async () => {
        App.lockBoxHolders = parseInt(await App.getLockBoxHoldersPromise());
        document.getElementById("members").innerText = App.lockBoxHolders;
    },

    updateLockBoxAmountTotal: async () => {
        App.lockBoxAmountTotal = web3.fromWei(await App.getUpdateLockBoxAmountTotalPromise(), 'ether');
        document.getElementById("lockBoxAmountTotal").innerText = App.lockBoxAmountTotal.toFixed(4);
    },

    updateContractBalance: async () => {
        App.contractBalance = web3.fromWei(await App.getContractBalancePromise(), 'ether');
        document.getElementById("contractBalance").innerText = App.contractBalance.toFixed(4);
    },

    updateAffiliateCommissionWithdrawnTotal: async () => {
        App.affiliateCommissionWithdrawnTotal = web3.fromWei(await App.getAffiliateCommissionWithdrawnTotalPromise(), 'ether');
        document.getElementById("affiliateCommissionWithdrawnTotal").innerText = App.affiliateCommissionWithdrawnTotal.toFixed(4);
    },

    updateGamesIncomeTotal: async () => {
        App.gamesIncomeTotal = web3.fromWei(await App.getGamesIncomeTotalPromise(), 'ether');
        document.getElementById("gamesIncomeTotal").innerText = App.gamesIncomeTotal.toFixed(4);
    },

    updateDonatedTotalTotal: async () => {
        App.donatedTotal = web3.fromWei(await App.getDonatedTotalPromise(), 'ether');
        document.getElementById("donatedTotal").innerText = App.donatedTotal.toFixed(4);
    },

    updateCurrentAddressProfitWithdrawals: async () => {
        App.currentAddressProfitWithdrawals = web3.fromWei(await App.getCurrentAddressProfitWithdrawals(), 'ether');
        document.getElementById("withdrawnByInvestor").innerText = App.currentAddressProfitWithdrawals.toFixed(4);
    },

    //  READ

    getLockBoxPromise: async () => {
        console.log("getLockBox start... ");
        return new Promise((resolve, reject) => {
            App.onigiriBankContract.getLockBox(App.currentAddress, (err, res) => {
                console.log("getLockBox finish... ");
                if (err) {
                    reject(err);
                } else {
                    // console.log("getLockBox res: ", res);
                    resolve(res);
                }
            });
        });
    },

    getActiveProfitPromise: async () => {
        console.log("getActiveProfit start... ");
        return new Promise((resolve, reject) => {
            App.onigiriBankContract.calculateProfit(App.currentAddress, (err, res) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log("getActiveProfit: ", res);
                    resolve(res)
                }
                console.log("getActiveProfit finish... ");
            });
        });
    },

    getActiveCommissionPromise: async () => {
        console.log("getActiveCommissionPromise start... ");
        return new Promise((resolve, reject) => {
            App.onigiriBankContract.affiliateCommission(App.currentAddress, (err, res) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(res)
                }
                console.log("getActiveCommissionPromise finish... ");
            });
        });
    },

    getActivePercentRatePromise: async (lockBoxAmount) => {
        console.log("getActivePercentRatePromise start... ");
        return new Promise((resolve, reject) => {
            App.onigiriBankContract.percentRatePublic(lockBoxAmount, (err, res) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(res)
                }
                console.log("getActivePercentRatePromise finish... ");
            });
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

    getContractBalancePromise: async () => {
        console.log("getContractBalancePromise start... ");
        return new Promise((resolve, reject) => {
            App.onigiriBankContract.getBalance((err, res) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(res)
                }
                console.log("getContractBalancePromise finish... ");
            });
        });
    },

    getGuaranteedBalancesPromise: async () => {
        console.log("getGuaranteedBalancesPromise start... ");
        return new Promise((resolve, reject) => {
            App.onigiriBankContract.guaranteedBalance((err, res) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(res)
                }
                console.log("getGuaranteedBalancesPromise finish... ");
            });
        });
    },

    getProfitWithdrawalsTotalPromise: async () => {
        console.log("getProfitWithdrawalsTotalPromise start... ");
        return new Promise((resolve, reject) => {
            App.onigiriBankContract.withdrawnProfitTotal((err, res) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(res)
                }
                console.log("getProfitWithdrawalsTotalPromise finish... ");
            });
        });
    },

    getLockBoxHoldersPromise: async () => {
        console.log("getLockBoxHoldersPromise start... ");
        return new Promise((resolve, reject) => {
            App.onigiriBankContract.investorsCount((err, res) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(res)
                }
                console.log("getLockBoxHoldersPromise finish... ");
            });
        });
    },

    getUpdateLockBoxAmountTotalPromise: async () => {
        console.log("getUpdateLockBoxAmountTotalPromise start... ");
        return new Promise((resolve, reject) => {
            App.onigiriBankContract.lockboxTotal((err, res) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(res)
                }
                console.log("getUpdateLockBoxAmountTotalPromise finish... ");
            });
        });
    },

    getAffiliateCommissionWithdrawnTotalPromise: async () => {
        console.log("getAffiliateCommissionWithdrawnTotalPromise start... ");
        return new Promise((resolve, reject) => {
            App.onigiriBankContract.affiliateCommissionWithdrawnTotal((err, res) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(res)
                }
                console.log("getAffiliateCommissionWithdrawnTotalPromise finish... ");
            });
        });
    },

    getGamesIncomeTotalPromise: async () => {
        console.log("getGamesIncomeTotalPromise start... ");
        return new Promise((resolve, reject) => {
            App.onigiriBankContract.gamesIncomeTotal((err, res) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(res)
                }
                console.log("getGamesIncomeTotalPromise finish... ");
            });
        });
    },

    getDonatedTotalPromise: async () => {
        console.log("getDonatedTotalPromise start... ");
        return new Promise((resolve, reject) => {
            App.onigiriBankContract.donatedTotal((err, res) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(res)
                }
                console.log("getDonatedTotalPromise finish... ");
            });
        });
    },

    getCurrentAddressProfitWithdrawals: async () => {
        console.log("getCurrentAddressProfitWithdrawals start... ");
        return new Promise((resolve, reject) => {
            App.onigiriBankContract.getWithdrawn(App.currentAddress, (err, res) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(res);
                }
                console.log("getCurrentAddressProfitWithdrawals finish... ");
            });
        });
    },


    //  WRITE
    investETH: async () => {
        let amountProvided = document.getElementById("investAmount").value;

        if (amountProvided.length == 0 || isNaN(amountProvided)) {
            alert("Wrong amount provided");
            return;
        }

        const MIN_AMOUNT = 0.025; //ETH
        if (amountProvided < MIN_AMOUNT) {
            alert("Minimum amount to invest is 0.025 ETH");
            return;
        }

        let affilaiateValid = "0x0000000000000000000000000000000000000000";
        let affiliateProvided = document.getElementById("affiliateAddress").value;

        if (affiliateProvided.length > 0) {
            let affiliateChecksummed = web3.toChecksumAddress(affiliateProvided);
            if (!web3.isAddress(affiliateChecksummed)) {
                alert("wrong affiliate provided");
                return;
            }

            affilaiateValid = affiliateChecksummed;
        }
        console.log("investETH start... ");
        return new Promise((resolve, reject) => {
            App.onigiriBankContract.invest(affilaiateValid, {
                value: web3.toWei(amountProvided, "ether")
            }, (err, res) => {
                if (err) {
                    console.error("investETH: ", err);
                    reject(err);
                } else {
                    resolve(res);
                }
                console.log("investETH finish... ");
            });
        });
    },

    withdrawLockbox: async () => {
        console.log("withdrawLockbox start... ");
        return new Promise((resolve, reject) => {
            App.onigiriBankContract.withdrawLockBoxAndClose((err, res) => {
                if (err) {
                    console.error("withdrawLockbox: ", err);
                    reject(err);
                } else {
                    resolve(res);
                }
                console.log("withdrawLockbox finish... ");
            });
        });
    },

    withdrawProfit: async () => {
        console.log("withdrawProfit start... ");
        return new Promise((resolve, reject) => {
            App.onigiriBankContract.withdrawProfit((err, res) => {
                if (err) {
                    console.error("withdrawProfit: ", err);
                    reject(err);
                } else {
                    resolve(res);
                }
                console.log("withdrawProfit finish... ");
            });
        });
    },

    reinvestProfit: async () => {
        console.log("reinvestProfit start... ");
        return new Promise((resolve, reject) => {
            App.onigiriBankContract.reinvestProfit((err, res) => {
                if (err) {
                    console.error("reinvestProfit: ", err);
                    reject(err);
                } else {
                    resolve(res);
                }
                console.log("reinvestProfit finish... ");
            });
        });
    },

    withdrawAffiliateCommision: async () => {
        console.log("withdrawAffiliateCommision start... ");
        return new Promise((resolve, reject) => {
            App.onigiriBankContract.withdrawAffiliateCommission((err, res) => {
                if (err) {
                    console.error("withdrawAffiliateCommision: ", err);
                    reject(err);
                } else {
                    resolve(res);
                }
                console.log("withdrawAffiliateCommision finish... ");
            });
        });
    },

    donateETH: async () => {
        let donateAmountProvided = document.getElementById("donateAmount").value;

        if (donateAmountProvided.length == 0 || isNaN(donateAmountProvided)) {
            alert("Wrong amount provided");
            return;
        }

        console.log("donateETH start... ");
        return new Promise((resolve, reject) => {

            web3.eth.sendTransaction({
                to: App.onigiriBankContract.address,
                value: web3.toWei(donateAmountProvided, "ether")
            }, (err, res) => {
                if (err) {
                    console.error("donateETH: ", err);
                    reject(err);
                } else {
                    App.updateUI();
                    resolve(res);
                }
                console.log("donateETH finish... ");
            });
        });
    }
}

window.App = App;

window.addEventListener('load', async () => {
    console.log("           load new");
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            // Request account access if needed
            await ethereum.enable();

            App.setup();
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
        console.warning('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
});

window.addEventListener("focus", async () => {
    console.log("           focus");

    if (await App.getCurrentAddress() != App.currentAddress) {
        App.setup();
    } else {
        App.updateUI();
    }
});