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
    4. getProfit() - investedETH[customer] => lockBox[customer]
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
    
    /** Creator */
    address dev1 = 0xBa21d01125D6932ce8ABf3625977899Fd2C7fa30;  //  TODO: Ronald's
     /** Future  */
    address dev2 = 0xEDa159d4AD09bEdeB9fDE7124E0F5304c30F7790;  //  TODO: Ivan's
    
    //  0.075% per hour
    uint public dailyStartPercent = 0;      //  0% - this stops contract from paying out 
    uint public dailyLowPercent = 75;       // 1.8%
    uint public dailyMiddlePercent = 150;   // 3.6%
    uint public dailyHighPercent = 350;     // 8.4%

    uint public stepLow = .15 ether;    //  1.8%
    uint public stepMiddle = 150 ether; //  3.6%
    uint public stepHigh = 1000 ether;  // 8.4%
    
    function percentRate() public view returns(uint) {
        uint balance = lockBox.balance;
        
        if (balance < stepLow) {
            return dailyStartPercent;
        } else if (balance >= stepLow && balance < stepMiddle) {
            return dailyLowPercent;
        } else if (balance >= stepMiddle && balance < stepHigh) {
            return dailyMiddlePercent;
        } else {
            return dailyHighPercent;
        }
    }
    
    function investETH(address referral) public payable {
        require(msg.value >= 0.025 ether, "min investment == 0.025 eth");
        
        if(getProfit(msg.sender) > 0){
            uint256 profit = getProfit(msg.sender);
            lastInvestment[msg.sender] = now;
            msg.sender.transfer(profit);
        }
        
        uint256 amount = msg.value;
        //  TODO: update to 2%
        uint256 commision = amount.div(40);
        if(referral != msg.sender && referral != address(0)){
            // affiliateCommisionTotal[referral] = SafeMath.add(affiliateCommisionTotal[referral], commision);
            affiliateCommisionTotal[referral] = affiliateCommisionTotal[referral].add(commision);
        }
        
        //  TODO: use mapping for each dev; each dev should withdraw by himself
        dev1.transfer(msg.value.div(100).mul(2));
        dev2.transfer(msg.value.div(100).mul(2));

        
        investedETH[msg.sender] = investedETH[msg.sender].add(amount);
        withdrawnETH[msg.sender] = 0;
        lastInvestment[msg.sender] = now;
    }

    function withdrawDev() public {
        //  if dev
        //  get amount for current dev
        //  transfer to dev
    }
    
    //  TODO: not used
    function withdraw() public{
        require(lastInvestment[msg.sender] > 0, "ERROR: no investments");
        
        uint256 payoutAmount = getProfit(msg.sender);
        
        if(withdrawnETH[msg.sender].add(payoutAmount) <= investedETH[msg.sender]) { //  TODO: investedETH => lockBox
            withdrawnETH[msg.sender] = withdrawnETH[msg.sender].add(payoutAmount);
            msg.sender.transfer(payoutAmount);
        } else {
            uint256 payout = investedETH[msg.sender];
            investedETH[msg.sender] = 0;
            withdrawnETH[msg.sender] = 0;
            msg.sender.transfer(payout);
        }
    }

    //  TODO
    function withdrawEarnings() public {
        require(lastInvestment[msg.sender] > 0, "ERROR: no investments");
        uint256 payoutAmount = getProfit(msg.sender);
        msg.sender.transfer(payout);
    }

    //  TODO: 
    function withdrawlockBox() public {
        require(lastInvestment[msg.sender] > 0, "ERROR: no investments");

        uint256 payoutAmount = getProfit(msg.sender);
        uint256 lockBoxAmount = lockBox[msg.sender];
        //  TODO decrease lockBoxAmount:
        //  3% - stays in contract
        //  2% - to developers
        msg.sender.transfer((lockBoxAmount + payoutAmount));

        //  TODO: remove user totally
    }

    //  suggest to remove and use getProfit(msg.sender) directly from JS
    function getProfitFromSender() public view returns(uint256){
        return getProfit(msg.sender);
    }

    function getProfit(address customer) public view returns(uint256){
        uint256 hourDifference = now.sub(lastInvestment[customer]).div(60);   // TODO: 3600 
        uint256 rate = percentRate();
        uint256 calculatedPercent = hourDifference.mul(rate);
        return investedETH[customer].div(100000).mul(calculatedPercent);
    }
    
    function reinvestProfit() public {
        uint256 profit = getProfit(msg.sender);
        require(profit > 0);
        lastInvestment[msg.sender] = now;
        investedETH[msg.sender] = SafeMath.add(investedETH[msg.sender], profit);
    }
    
    function getaffiliateCommisionTotal() public view returns(uint256){
        return affiliateCommisionTotal[msg.sender];
    }
    
    function withdrawaffiliateCommisionTotal() public {
        require(affiliateCommisionTotal[msg.sender] > 0);
        uint256 commision = affiliateCommisionTotal[msg.sender];
        affiliateCommisionTotal[msg.sender] = 0;
        msg.sender.transfer(commision);
    }
    
    function getBalance() public view returns(uint256){
        return address(this).balance;
    }

    /**
     * PRIVATE
     */

    function percentRate() private view returns(uint) {
        uint balance = lockBox.balance;
        
        if (balance < stepLow) {
            return dailyStartPercent;
        } else if (balance >= stepLow && balance < stepMiddle) {
            return dailyLowPercent;
        } else if (balance >= stepMiddle && balance < stepHigh) {
            return dailyMiddlePercent;
        } else {
            return dailyHighPercent;
        }
    }
}