let OnigiriData = {
    address: "0xf506e23501a7Db26845c5069C9f019D13D48413d",
    abi: [{
            "constant": true,
            "inputs": [],
            "name": "lockboxTotal",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0x197748e0"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "investorsCount",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0x2b711051"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "minInvest",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0x63fd9e38"
        },
        {
            "constant": true,
            "inputs": [{
                "name": "",
                "type": "address"
            }],
            "name": "investors",
            "outputs": [{
                    "name": "invested",
                    "type": "uint256"
                },
                {
                    "name": "lockbox",
                    "type": "uint256"
                },
                {
                    "name": "withdrawn",
                    "type": "uint256"
                },
                {
                    "name": "lastInvestmentTime",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0x6f7bc9be"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "withdrawnProfitTotal",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0x7cc7310f"
        },
        {
            "constant": true,
            "inputs": [{
                "name": "",
                "type": "address"
            }],
            "name": "devCommission",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0x98f3f8e6"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "donatedTotal",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0xc831ae03"
        },
        {
            "constant": true,
            "inputs": [{
                "name": "",
                "type": "address"
            }],
            "name": "affiliateCommission",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0xc8582572"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "affiliateCommissionWithdrawnTotal",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0xcc38c8ee"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "gamesIncomeTotal",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0xd6b9bf26"
        },
        {
            "payable": true,
            "stateMutability": "payable",
            "type": "fallback"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": false,
                    "name": "investor",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "Invested",
            "type": "event",
            "signature": "0xc3f75dfc78f6efac88ad5abb5e606276b903647d97b2a62a1ef89840a658bbc3"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": false,
                    "name": "investor",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "Renvested",
            "type": "event",
            "signature": "0x31b79d553a711214890a10f851808f023529bb2f0ce14b7954818f3746c8f174"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": false,
                    "name": "affiliate",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "WithdrawnAffiliateCommission",
            "type": "event",
            "signature": "0xf00b94e6d3eae70f13396fc1316a95fffe65e4e4268f517278311cd9618e75e3"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": false,
                    "name": "investor",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "WithdrawnProfit",
            "type": "event",
            "signature": "0x9acd446c7c5d67289e9ab24bf8d274c3e60b36709aad13c9ccefec55a25c00bb"
        },
        {
            "anonymous": false,
            "inputs": [{
                    "indexed": false,
                    "name": "investor",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "WithdrawnLockbox",
            "type": "event",
            "signature": "0x2a14c6c4baf70f0f57eb7d8bed4856b2a7f80a238a2dce681b404e0cae9dce7b"
        },
        {
            "constant": false,
            "inputs": [],
            "name": "fromGame",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function",
            "signature": "0xa360fea7"
        },
        {
            "constant": true,
            "inputs": [{
                "name": "_address",
                "type": "address"
            }],
            "name": "getInvested",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0x2ae2b643"
        },
        {
            "constant": true,
            "inputs": [{
                "name": "_address",
                "type": "address"
            }],
            "name": "getLockBox",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0x5e70dec5"
        },
        {
            "constant": true,
            "inputs": [{
                "name": "_address",
                "type": "address"
            }],
            "name": "getWithdrawn",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0xae66d948"
        },
        {
            "constant": true,
            "inputs": [{
                "name": "_address",
                "type": "address"
            }],
            "name": "getLastInvestmentTime",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0x6c116a2e"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "getBalance",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0x12065fe0"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "guaranteedBalance",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0x550dd212"
        },
        {
            "constant": false,
            "inputs": [{
                "name": "_affiliate",
                "type": "address"
            }],
            "name": "invest",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function",
            "signature": "0x03f9c793"
        },
        {
            "constant": false,
            "inputs": [{
                "name": "_address",
                "type": "address"
            }],
            "name": "updateDevEscrow",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function",
            "signature": "0x15682cc9"
        },
        {
            "constant": false,
            "inputs": [],
            "name": "withdrawDevCommission",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function",
            "signature": "0x699333aa"
        },
        {
            "constant": false,
            "inputs": [],
            "name": "withdrawAffiliateCommission",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function",
            "signature": "0xb77fc549"
        },
        {
            "constant": false,
            "inputs": [],
            "name": "withdrawProfit",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function",
            "signature": "0x959499b6"
        },
        {
            "constant": false,
            "inputs": [],
            "name": "withdrawLockBoxAndClose",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function",
            "signature": "0xc1a63517"
        },
        {
            "constant": false,
            "inputs": [],
            "name": "reinvestProfit",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function",
            "signature": "0xe3b61135"
        },
        {
            "constant": true,
            "inputs": [{
                "name": "_investor",
                "type": "address"
            }],
            "name": "calculateProfit",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function",
            "signature": "0xb1c17506"
        },
        {
            "constant": true,
            "inputs": [{
                "name": "_balance",
                "type": "uint256"
            }],
            "name": "percentRateInternal",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "pure",
            "type": "function",
            "signature": "0x567541a9"
        },
        {
            "constant": true,
            "inputs": [{
                "name": "_balance",
                "type": "uint256"
            }],
            "name": "percentRatePublic",
            "outputs": [{
                "name": "",
                "type": "uint256"
            }],
            "payable": false,
            "stateMutability": "pure",
            "type": "function",
            "signature": "0xe1f4e68d"
        }
    ],






    build: function () {
        return web3.eth.contract(this.abi).at(this.address);
    }
}

export {
    OnigiriData
};