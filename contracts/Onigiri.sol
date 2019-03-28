pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/**

This is the ONIGIRI smart Contract 
85% to lockBox withdraw at anytime
    - on withdrawal stops paying daily 


 */

 /**
    investETH()
    1. user invests eth
    2. 100% - investedETH
    3. 86% - lockBox
    4.      no referral: 12% - stays in contract balance - contractPole
    4.1.    referral: 10% - stays in contract balance - contractPole, 2% - referrer address
    5. 4% - developers - immediately transferred (dev1, dev2)

    withdraw() - stays the same
    1. let h = get amount of hours after last deposit
    1.1 multiple deposits - TODO
    2. lockBoxAmount = lockBox[msg.sender]
    3. let percentRate: percentRate() - uint balance = address(this).balance; => uint balance = lockBox[msg.sender];
    4. calculateProfit() - investedETH[customer] => lockBox[customer]
    5. 
 


    contract will let withdraw if balance > 0.15 eth

  */

contract Onigiri {
    using SafeMath for uint256;
    
    mapping (address => uint256) public investedETH;
    mapping (address => uint256) public lockBox; // user can withdraw at anytime 
    mapping (address => uint256) public withdrawnETH;
    mapping (address => uint256) public lastInvestment;
    mapping (address => uint256) public affiliateCommisionTotal;
    mapping (address => uint256) private devCommission;
    
    address private constant dev1 = 0xBa21d01125D6932ce8ABf3625977899Fd2C7fa30;  //  TODO: Ronald's
    address private constant dev2 = 0xEDa159d4AD09bEdeB9fDE7124E0F5304c30F7790;  //  TODO: Ivan's

    /**
     * PUBLIC
     */
    
    /**
     * @dev User invests funds
     * @param _referral Referral address.
     */
    function invest(address _referral) public payable {
        require(msg.value >= 0.025 ether, "min 0.025 eth");
        
        uint256 profit = calculateProfit(msg.sender);
        if(profit > 0){
            msg.sender.transfer(profit);
        }
        
        if(_referral != msg.sender && _referral != address(0)) {
            uint256 commision = msg.value.mul(2).div(100);
            affiliateCommisionTotal[_referral] = affiliateCommisionTotal[_referral].add(commision);
        }
        
        uint256 devCommision = msg.value.div(100).mul(2);
        devCommission[dev1] = devCommission[dev1].add(devCommision);
        devCommission[dev2] = devCommission[dev2].add(devCommision);
        
        investedETH[msg.sender] = investedETH[msg.sender].add(msg.value);
        lastInvestment[msg.sender] = now;
        delete withdrawnETH[msg.sender];
    }

    /**
     * @dev Allows developer to withdraw commission.
     */
    function withdrawDevCommission() public {
        uint256 commission = devCommission[msg.sender];
        require(commission > 0, "no dev commission");

        delete devCommission[msg.sender];   //  TODO: test invest - withdraw - invest - withdraw
        msg.sender.transfer(profit);

    }
    
    //  TODO: should not used
    function withdraw() public{
        require(lastInvestment[msg.sender] > 0, "no investments");
        
        uint256 payoutAmount = calculateProfit(msg.sender);
        
        if(withdrawnETH[msg.sender].add(payoutAmount) <= investedETH[msg.sender]) { //  TODO: investedETH => lockBox
            withdrawnETH[msg.sender] = withdrawnETH[msg.sender].add(payoutAmount);
            msg.sender.transfer(payoutAmount);
        } else {
            uint256 payout = investedETH[msg.sender];
            delete investedETH[msg.sender];
            delete withdrawnETH[msg.sender];
            msg.sender.transfer(payout);
        }
    }

    /**
     * @dev Allows investor to withdraw earnings.
     */
    //  TODO
    function withdrawEarnings() public {
        require(lastInvestment[msg.sender] > 0, "no investments");
        uint256 payoutAmount = calculateProfit(msg.sender);
        msg.sender.transfer(payout);
    }

    /**
     * @dev Allows investor to withdraw lockBox funds.
     */
    //  TODO
    function withdrawlockBox() public {
        require(lastInvestment[msg.sender] > 0, "no investments");

        uint256 payoutAmount = calculateProfit(msg.sender);
        uint256 lockBoxAmount = lockBox[msg.sender];
        //  TODO decrease lockBoxAmount:
        //  3% - stays in contract
        //  2% - to developers
        msg.sender.transfer((lockBoxAmount + payoutAmount));

        //  TODO: remove user totally
    }

    //  should we remove and use calculateProfit(msg.sender) directly from JS?
    // function calculateProfitFromSender() public view returns(uint256){
    //     return calculateProfit(msg.sender);
    // }


    /**
     * @dev Calculates pending profit for provided customer.
     * @param _investor Address of investor.
     */
    function calculateProfit(address _investor) public view returns(uint256){
        uint256 hourDifference = now.sub(lastInvestment[_investor]).div(60);   // TODO: why 60
        uint256 rate = percentRate();
        uint256 calculatedPercent = hourDifference.mul(rate);
        return lockBox[_investor].div(100000).mul(calculatedPercent);
    }
    
    /**
     * @dev Reinvests pending profit.
     */
    function reinvestProfit() public {
        uint256 profit = calculateProfit(msg.sender);
        require(profit > 0, "no profit");

        lastInvestment[msg.sender] = now;
        investedETH[msg.sender] = investedETH[msg.sender].add(profit);
    }
    
    /**
     * @dev Withdraws affiliate commission for current address.
     */
    function withdrawAffiliateCommisionTotal() public {
        require(affiliateCommisionTotal[msg.sender] > 0);

        uint256 commision = affiliateCommisionTotal[msg.sender];
        delete affiliateCommisionTotal[msg.sender];
        msg.sender.transfer(commision);
    }
    
    /**
     * @dev Shows balance for current contract.
     */
    function getBalance() public view returns(uint256){
        return address(this).balance;
    }

    /**
     * PRIVATE
     */

    /**
     * @dev Calculates rate for lockBox balance for msg.sender.
     */
    function percentRate() private view returns(uint) {
        uint256 stepLow = .15 ether;    //  1.8%
        uint256 stepMiddle = 150 ether; //  3.6%
        uint256 stepHigh = 1000 ether;  // 8.4%

        //  0.075% per hour
        uint256 dailyLowPercent = 75;       // 1.8%
        uint256 dailyMiddlePercent = 150;   // 3.6%
        uint256 dailyHighPercent = 350;     // 8.4%
        
        uint balance = lockBox[msg.sender];
        if (balance >= stepLow && balance < stepMiddle) {
            return dailyLowPercent;
        } else if (balance >= stepMiddle && balance < stepHigh) {
            return dailyMiddlePercent;
        } else if (balance >= stepHigh) {
            return dailyHighPercent;
        }
    }
}