pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @dev This is the ONIGIRI smart Contract. 85% to lockBox withdraw at anytime - on withdrawal stops paying daily 
 */

contract Onigiri {
    using SafeMath for uint256;
    
    mapping (address => uint256) public investedETH;
    mapping (address => uint256) public lockBox; // user can withdraw at anytime 
    mapping (address => uint256) public withdrawnETH;
    mapping (address => uint256) public lastInvestment;
    mapping (address => uint256) public affiliateCommisionTotal;
    mapping (address => uint256) private devCommission;
    
    address private constant dev_0 = 0xc9d76DB051245846254d3aF4949f1094bEEeE3CE;  //  TODO: Ronald's
    address private constant dev_1 = 0xb37277d6558D41fAdd2a291AB0bD398D4564Be40;  //  TODO: Ivan's

    uint256 private constant minBalance = 0.15 ether;
    uint256 public constant minInvest = 0.025 ether;

    /**
     * PUBLIC
     */
    
    /**
     * @dev User invests funds
     * @param _referral Referral address.
     */
    function invest(address _referral) public payable {
        require(msg.value >= minInvest, "min 0.025 eth");

        uint256 profit = calculateProfit(msg.sender);
        if(profit > 0){
            msg.sender.transfer(profit);
        }

        if(_referral != msg.sender && _referral != address(0)) {
            uint256 commision = msg.value.mul(2).div(100);
            affiliateCommisionTotal[_referral] = affiliateCommisionTotal[_referral].add(commision);
        }

        lockBox[msg.sender] = lockBox[msg.sender].add(msg.value.div(100).mul(84));
        
        uint256 devCommision = msg.value.div(100).mul(2);
        devCommission[dev_0] = devCommission[dev_0].add(devCommision);
        devCommission[dev_1] = devCommission[dev_1].add(devCommision);
        
        lastInvestment[msg.sender] = now;
        investedETH[msg.sender] = investedETH[msg.sender].add(msg.value);
        delete withdrawnETH[msg.sender];    //  TODO:
    }
    
    /**
     * Onigiry ecosystem.
     */
    function() external payable {
        //  logic for 50/50 loser game

        uint256 devCommision = msg.value.div(100).mul(2);
        devCommission[dev_0] = devCommission[dev_0].add(devCommision);
        devCommission[dev_1] = devCommission[dev_1].add(devCommision);
    }

    /**
     * @dev Returns commission for developer.
     */
    function getDevCommission() public view returns(uint256) {
        require(msg.sender == dev_0 || msg.sender == dev_1, "not dev");
        return devCommission[msg.sender];
    }

    /**
     * @dev Allows developer to withdraw commission.
     */
    function withdrawDevCommission() public {
        uint256 commission = devCommission[msg.sender];
        require(commission > 0, "no dev commission");
        require(address(this).balance.sub(commission) > minBalance, "not enough funds");

        delete devCommission[msg.sender];   //  TODO: test invest - withdraw - invest - withdraw
        msg.sender.transfer(commission);
    }
    
    /**
     * @dev Withdraws affiliate commission for current address.
     */
    function withdrawAffiliateCommisionTotal() public {
        uint256 commision = affiliateCommisionTotal[msg.sender];
        require(commision > 0, "no commission");
        require(address(this).balance.sub(commision) > minBalance, "not enough funds");

        delete affiliateCommisionTotal[msg.sender];
        msg.sender.transfer(commision);
    }

    /**
     * @dev Allows investor to withdraw earnings.
     */
    function withdrawEarnings() public {
        require(lastInvestment[msg.sender] > 0, "no investments");
        uint256 payoutAmount = calculateProfit(msg.sender);
        require(address(this).balance.sub(payoutAmount) > minBalance, "not enough funds");

        lastInvestment[msg.sender] = now;
        withdrawnETH[msg.sender] = withdrawnETH[msg.sender].add(payoutAmount);
        msg.sender.transfer(payoutAmount);
    }

    /**
     * @dev Allows investor to withdraw lockBox funds.
     */
    function withdrawLockBox() public {
        require(lastInvestment[msg.sender] > 0, "no investments");

        uint256 payoutAmount = calculateProfit(msg.sender);
        uint256 lockBoxAmount = lockBox[msg.sender];
        require(address(this).balance.sub(payoutAmount).sub(lockBoxAmount) > minBalance, "not enough funds");

        //  2% - to developers
        uint256 devFee = lockBoxAmount.div(100);
        devCommission[dev_0] = devCommission[dev_0].add(devFee);
        devCommission[dev_1] = devCommission[dev_1].add(devFee);

        //  3% - stays in contract
        uint256 lockBoxWithdraw = lockBoxAmount.div(100).mul(95);

        uint256 payoutTotal = lockBoxWithdraw + payoutAmount;
        withdrawnETH[msg.sender] = withdrawnETH[msg.sender].add(payoutTotal);
        msg.sender.transfer(payoutTotal);

        //  remove user totally
        delete investedETH[msg.sender];
        delete lockBox[msg.sender];
        delete lastInvestment[msg.sender];
    }

    /**
     * @dev Calculates pending profit for provided customer.
     * @param _investor Address of investor.
     */
    function calculateProfit(address _investor) public view returns(uint256){
        uint256 hourDifference = now.sub(lastInvestment[_investor]).div(60);   // TODO: 60 - for test only. PROD - 3600
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
        lockBox[msg.sender] = lockBox[msg.sender].add(profit.div(100).mul(85));
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