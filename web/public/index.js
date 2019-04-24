/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./js/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./blockchain/contract.js":
/*!********************************!*\
  !*** ./blockchain/contract.js ***!
  \********************************/
/*! exports provided: OnigiriData */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"OnigiriData\", function() { return OnigiriData; });\nlet OnigiriData = {\n    address: \"0x5ffd2e6Bc7893A3940a3221F984A001f59f04E8B\",\n    abi: [{\n            \"constant\": true,\n            \"inputs\": [],\n            \"name\": \"lockboxTotal\",\n            \"outputs\": [{\n                \"name\": \"\",\n                \"type\": \"uint256\"\n            }],\n            \"payable\": false,\n            \"stateMutability\": \"view\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": true,\n            \"inputs\": [],\n            \"name\": \"investorsCount\",\n            \"outputs\": [{\n                \"name\": \"\",\n                \"type\": \"uint256\"\n            }],\n            \"payable\": false,\n            \"stateMutability\": \"view\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": true,\n            \"inputs\": [],\n            \"name\": \"minInvest\",\n            \"outputs\": [{\n                \"name\": \"\",\n                \"type\": \"uint256\"\n            }],\n            \"payable\": false,\n            \"stateMutability\": \"view\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": true,\n            \"inputs\": [{\n                \"name\": \"\",\n                \"type\": \"address\"\n            }],\n            \"name\": \"investors\",\n            \"outputs\": [{\n                    \"name\": \"invested\",\n                    \"type\": \"uint256\"\n                },\n                {\n                    \"name\": \"lockbox\",\n                    \"type\": \"uint256\"\n                },\n                {\n                    \"name\": \"withdrawn\",\n                    \"type\": \"uint256\"\n                },\n                {\n                    \"name\": \"lastInvestmentTime\",\n                    \"type\": \"uint256\"\n                }\n            ],\n            \"payable\": false,\n            \"stateMutability\": \"view\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": true,\n            \"inputs\": [],\n            \"name\": \"withdrawnProfitTotal\",\n            \"outputs\": [{\n                \"name\": \"\",\n                \"type\": \"uint256\"\n            }],\n            \"payable\": false,\n            \"stateMutability\": \"view\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": true,\n            \"inputs\": [{\n                \"name\": \"\",\n                \"type\": \"address\"\n            }],\n            \"name\": \"devCommission\",\n            \"outputs\": [{\n                \"name\": \"\",\n                \"type\": \"uint256\"\n            }],\n            \"payable\": false,\n            \"stateMutability\": \"view\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": true,\n            \"inputs\": [],\n            \"name\": \"donatedTotal\",\n            \"outputs\": [{\n                \"name\": \"\",\n                \"type\": \"uint256\"\n            }],\n            \"payable\": false,\n            \"stateMutability\": \"view\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": true,\n            \"inputs\": [{\n                \"name\": \"\",\n                \"type\": \"address\"\n            }],\n            \"name\": \"affiliateCommission\",\n            \"outputs\": [{\n                \"name\": \"\",\n                \"type\": \"uint256\"\n            }],\n            \"payable\": false,\n            \"stateMutability\": \"view\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": true,\n            \"inputs\": [],\n            \"name\": \"affiliateCommissionWithdrawnTotal\",\n            \"outputs\": [{\n                \"name\": \"\",\n                \"type\": \"uint256\"\n            }],\n            \"payable\": false,\n            \"stateMutability\": \"view\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": true,\n            \"inputs\": [],\n            \"name\": \"gamesIncomeTotal\",\n            \"outputs\": [{\n                \"name\": \"\",\n                \"type\": \"uint256\"\n            }],\n            \"payable\": false,\n            \"stateMutability\": \"view\",\n            \"type\": \"function\"\n        },\n        {\n            \"payable\": true,\n            \"stateMutability\": \"payable\",\n            \"type\": \"fallback\"\n        },\n        {\n            \"anonymous\": false,\n            \"inputs\": [{\n                    \"indexed\": false,\n                    \"name\": \"investor\",\n                    \"type\": \"address\"\n                },\n                {\n                    \"indexed\": false,\n                    \"name\": \"amount\",\n                    \"type\": \"uint256\"\n                }\n            ],\n            \"name\": \"Invested\",\n            \"type\": \"event\"\n        },\n        {\n            \"anonymous\": false,\n            \"inputs\": [{\n                    \"indexed\": false,\n                    \"name\": \"investor\",\n                    \"type\": \"address\"\n                },\n                {\n                    \"indexed\": false,\n                    \"name\": \"amount\",\n                    \"type\": \"uint256\"\n                }\n            ],\n            \"name\": \"Renvested\",\n            \"type\": \"event\"\n        },\n        {\n            \"anonymous\": false,\n            \"inputs\": [{\n                    \"indexed\": false,\n                    \"name\": \"affiliate\",\n                    \"type\": \"address\"\n                },\n                {\n                    \"indexed\": false,\n                    \"name\": \"amount\",\n                    \"type\": \"uint256\"\n                }\n            ],\n            \"name\": \"WithdrawnAffiliateCommission\",\n            \"type\": \"event\"\n        },\n        {\n            \"anonymous\": false,\n            \"inputs\": [{\n                    \"indexed\": false,\n                    \"name\": \"investor\",\n                    \"type\": \"address\"\n                },\n                {\n                    \"indexed\": false,\n                    \"name\": \"amount\",\n                    \"type\": \"uint256\"\n                }\n            ],\n            \"name\": \"WithdrawnProfit\",\n            \"type\": \"event\"\n        },\n        {\n            \"anonymous\": false,\n            \"inputs\": [{\n                    \"indexed\": false,\n                    \"name\": \"investor\",\n                    \"type\": \"address\"\n                },\n                {\n                    \"indexed\": false,\n                    \"name\": \"amount\",\n                    \"type\": \"uint256\"\n                }\n            ],\n            \"name\": \"WithdrawnLockbox\",\n            \"type\": \"event\"\n        },\n        {\n            \"constant\": false,\n            \"inputs\": [],\n            \"name\": \"fromGame\",\n            \"outputs\": [],\n            \"payable\": true,\n            \"stateMutability\": \"payable\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": true,\n            \"inputs\": [{\n                \"name\": \"_address\",\n                \"type\": \"address\"\n            }],\n            \"name\": \"getInvested\",\n            \"outputs\": [{\n                \"name\": \"\",\n                \"type\": \"uint256\"\n            }],\n            \"payable\": false,\n            \"stateMutability\": \"view\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": true,\n            \"inputs\": [{\n                \"name\": \"_address\",\n                \"type\": \"address\"\n            }],\n            \"name\": \"getLockBox\",\n            \"outputs\": [{\n                \"name\": \"\",\n                \"type\": \"uint256\"\n            }],\n            \"payable\": false,\n            \"stateMutability\": \"view\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": true,\n            \"inputs\": [{\n                \"name\": \"_address\",\n                \"type\": \"address\"\n            }],\n            \"name\": \"getWithdrawn\",\n            \"outputs\": [{\n                \"name\": \"\",\n                \"type\": \"uint256\"\n            }],\n            \"payable\": false,\n            \"stateMutability\": \"view\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": true,\n            \"inputs\": [{\n                \"name\": \"_address\",\n                \"type\": \"address\"\n            }],\n            \"name\": \"getLastInvestmentTime\",\n            \"outputs\": [{\n                \"name\": \"\",\n                \"type\": \"uint256\"\n            }],\n            \"payable\": false,\n            \"stateMutability\": \"view\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": true,\n            \"inputs\": [],\n            \"name\": \"getBalance\",\n            \"outputs\": [{\n                \"name\": \"\",\n                \"type\": \"uint256\"\n            }],\n            \"payable\": false,\n            \"stateMutability\": \"view\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": true,\n            \"inputs\": [],\n            \"name\": \"guaranteedBalance\",\n            \"outputs\": [{\n                \"name\": \"\",\n                \"type\": \"uint256\"\n            }],\n            \"payable\": false,\n            \"stateMutability\": \"view\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": false,\n            \"inputs\": [{\n                \"name\": \"_affiliate\",\n                \"type\": \"address\"\n            }],\n            \"name\": \"invest\",\n            \"outputs\": [],\n            \"payable\": true,\n            \"stateMutability\": \"payable\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": false,\n            \"inputs\": [{\n                \"name\": \"_address\",\n                \"type\": \"address\"\n            }],\n            \"name\": \"updateDevEscrow\",\n            \"outputs\": [],\n            \"payable\": false,\n            \"stateMutability\": \"nonpayable\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": false,\n            \"inputs\": [],\n            \"name\": \"withdrawDevCommission\",\n            \"outputs\": [],\n            \"payable\": false,\n            \"stateMutability\": \"nonpayable\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": false,\n            \"inputs\": [],\n            \"name\": \"withdrawAffiliateCommission\",\n            \"outputs\": [],\n            \"payable\": false,\n            \"stateMutability\": \"nonpayable\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": false,\n            \"inputs\": [],\n            \"name\": \"withdrawProfit\",\n            \"outputs\": [],\n            \"payable\": false,\n            \"stateMutability\": \"nonpayable\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": false,\n            \"inputs\": [],\n            \"name\": \"withdrawLockBoxAndClose\",\n            \"outputs\": [],\n            \"payable\": false,\n            \"stateMutability\": \"nonpayable\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": false,\n            \"inputs\": [],\n            \"name\": \"reinvestProfit\",\n            \"outputs\": [],\n            \"payable\": false,\n            \"stateMutability\": \"nonpayable\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": true,\n            \"inputs\": [{\n                \"name\": \"_investor\",\n                \"type\": \"address\"\n            }],\n            \"name\": \"calculateProfit\",\n            \"outputs\": [{\n                \"name\": \"\",\n                \"type\": \"uint256\"\n            }],\n            \"payable\": false,\n            \"stateMutability\": \"view\",\n            \"type\": \"function\"\n        },\n        {\n            \"constant\": true,\n            \"inputs\": [{\n                \"name\": \"_balance\",\n                \"type\": \"uint256\"\n            }],\n            \"name\": \"percentRate\",\n            \"outputs\": [{\n                \"name\": \"\",\n                \"type\": \"uint256\"\n            }],\n            \"payable\": false,\n            \"stateMutability\": \"pure\",\n            \"type\": \"function\"\n        }\n    ],\n\n    build: function () {\n        return web3.eth.contract(this.abi).at(this.address);\n    }\n}\n\n\n\n//# sourceURL=webpack:///./blockchain/contract.js?");

/***/ }),

/***/ "./js/index.js":
/*!*********************!*\
  !*** ./js/index.js ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _blockchain_contract__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../blockchain/contract */ \"./blockchain/contract.js\");\n\n\nconst App = {\n    currentAddress: null,\n    currentBalance: null,\n    tokenContract: null,\n    tokenOwnerAddr: null,\n\n    start: async () => {\n        App.createContract();\n        App.setupEventListeners();\n    },\n\n    createContract: () => {\n        App.tokenContract = web3.eth.contract(_blockchain_contract__WEBPACK_IMPORTED_MODULE_0__[\"OnigiriData\"].abi).at(_blockchain_contract__WEBPACK_IMPORTED_MODULE_0__[\"OnigiriData\"].address);\n        console.log(App.tokenContract);\n    },\n\n    setupEventListeners: () => {\n        console.log(\"setup\");\n    },\n\n    //  OWNER\n\n    getTokenOwner: async () => {\n        return new Promise(resolve => {\n            App.tokenContract.owner((err, res) => {\n                if (err) {\n                    console.error(err);\n                } else {\n                    resolve(res);\n                }\n            });\n        });\n    },\n\n    getTokenBalance: async (addr) => {\n        return new Promise(resolve => {\n            App.tokenContract.balanceOf(addr, (err, res) => {\n                if (err) {\n                    console.error(err);\n                } else {\n                    resolve(web3.fromWei(res, \"wei\"));\n                }\n            });\n        });\n    },\n\n    getCurrentAddress: async () => {\n        return new Promise(resolve => {\n            web3.eth.getAccounts(function (err, res) {\n                if (err) {\n                    console.error(\"getCurrentAddress: \", err);\n                } else {\n                    resolve(res[0]);\n                }\n            });\n        });\n    },\n\n    getCurrentAddressBalance_eth: async () => {\n        return new Promise(resolve => {\n            web3.eth.getBalance(App.currentAddress, function (err, res) {\n                if (err) {\n                    console.error(\"getCurrentAddressBalance_eth: \", err);\n                } else {\n                    resolve(web3.fromWei(res.toNumber(), 'ether'));\n                }\n            });\n        });\n    }\n}\n\nwindow.App = App;\n\nwindow.addEventListener('load', async () => {\n    console.log(\"load new\");\n    // Modern dapp browsers...\n    if (window.ethereum) {\n        window.web3 = new Web3(ethereum);\n        try {\n            // Request account access if needed\n            await ethereum.enable();\n\n            App.start();\n        } catch (error) {\n            console.error(\"ethereum.enable() ERROR: \", error);\n            alert(error);\n        }\n    }\n    // Legacy dapp browsers...\n    else if (window.web3) {\n        window.web3 = new Web3(web3.currentProvider);\n    }\n    // Non-dapp browsers...\n    else {\n        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');\n    }\n});\n\nwindow.addEventListener(\"focus\", function () {\n    console.log(\"focus\");\n});\n\n//# sourceURL=webpack:///./js/index.js?");

/***/ })

/******/ });