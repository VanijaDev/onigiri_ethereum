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
    mapping (address => uint256) public lastInvestmentTime;
    mapping (address => uint256) public affiliateCommision;
    mapping (address => uint256) private devCommission;

    //  TODO: test total lockbox (84% form all investmaents) should always be present in contract

    uint256 public lockBoxTotal;                    //  TODO test in withdrawLockBox
    uint256 public lockBoxPlayers;                  //  TODO test in withdrawLockBox
    uint256 public withdrawnEarningsTotal;          //  TODO test
    uint256 public affiliateCommisionWithdrawnTotal;
    uint256 public donatedTotal;
    
    address private dev_0_master = 0xc9d76DB051245846254d3aF4949f1094bEEeE3CE;  //  TODO: Ronald's master
    address private dev_1_master = 0xb37277d6558D41fAdd2a291AB0bD398D4564Be40;  //  TODO: Ivan's master
    address private dev_0_escrow = 0x92ff09fe4EB65103c7A85c43CbBeafd345Ad41ee;  //  TODO: Ronald's escrow, empty in PROD
    address private dev_1_escrow = 0xA8265C1f1e158519C96A182fdAf14913D21e31E0;  //  TODO: Ivan's escrow, empty in PROD

    uint256 private constant minBalance = 0.05 ether;
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
            affiliateCommision[_referral] = affiliateCommision[_referral].add(commision);
        }

        if(lockBox[msg.sender] == 0) {
            lockBoxPlayers = lockBoxPlayers.add(1);
        }

        uint256 lockBoxAmount = lockBox[msg.sender].add(msg.value.div(100).mul(84));
        lockBox[msg.sender] = lockBoxAmount;
        lockBoxTotal = lockBoxTotal.add(lockBoxAmount);
        
        uint256 devCommision = msg.value.div(100).mul(2);
        devCommission[dev_0_escrow] = devCommission[dev_0_escrow].add(devCommision);
        devCommission[dev_1_escrow] = devCommission[dev_1_escrow].add(devCommision);
        
        lastInvestment[msg.sender] = now;
        investedETH[msg.sender] = investedETH[msg.sender].add(msg.value);
        delete withdrawnETH[msg.sender];
    }

    //  TODO: check lockbox is always available to withdraw.
    
    /**
     * Onigiry ecosystem.
     */
    function() external payable {
        uint256 devCommision = msg.value.div(100).mul(2);
        devCommission[dev_0_escrow] = devCommission[dev_0_escrow].add(devCommision);
        devCommission[dev_1_escrow] = devCommission[dev_1_escrow].add(devCommision);
        
        donatedTotal = donatedTotal.add(msg.value);
    }

    /**
     * @dev Returns commission for developer.
     */
    function getDevCommission() public view returns(uint256) {
        require(msg.sender == dev_0_escrow || msg.sender == dev_1_escrow , "not escrow");
        return devCommission[msg.sender];
    }

    /**
     * @dev Allows developer to withdraw commission.
     */
    function withdrawDevCommission() public {
        uint256 commission = devCommission[msg.sender];
        require(commission > 0, "no dev commission");
        require(address(this).balance.sub(commission) > minBalance, "not enough funds");

        delete devCommission[msg.sender];
        msg.sender.transfer(commission);
    }

    /**
     * @dev Updates escrow address for developer.
     * @param _address Address of escrow to be used.
     */
    function updateDevEscrow(address _address) public {
        require(msg.sender == dev_0_master || msg.sender == dev_1_master, "not dev");
        (msg.sender == dev_0_master) ? dev_0_escrow = _address : dev_1_escrow = _address;
    }
    
    /**
     * @dev Withdraws affiliate commission for current address.
     */
    function withdrawAffiliateCommision() public {
        uint256 commision = affiliateCommision[msg.sender];
        require(commision > 0, "no commission");
        require(address(this).balance.sub(commision) > minBalance, "not enough funds");

        delete affiliateCommision[msg.sender];
        msg.sender.transfer(commision);
        
        affiliateCommisionWithdrawnTotal = affiliateCommisionWithdrawnTotal.add(commision);
    }

    /**
     * @dev Allows investor to withdraw earnings.
     */
     // TODO: test for limit - lockboxTotal should be always available
    function withdrawEarnings() public {
        uint256 profit = calculateProfit(msg.sender);
        require(profit > 0, "no profit");
        require(address(this).balance.sub(profit) > minBalance, "not enough funds");

        lastInvestment[msg.sender] = now;
        withdrawnETH[msg.sender] = withdrawnETH[msg.sender].add(profit);
        msg.sender.transfer(profit);

        withdrawnEarningsTotal = withdrawnEarningsTotal.add(profit);
    }

    /**
     * @dev Allows investor to withdraw lockBox funds.
     */
     // TODO: withdraws lockbox + earnings - not possible. Suggest to make separate functions
    function withdrawLockBox() public {
        require(lastInvestment[msg.sender] > 0, "no investments");

        uint256 profit = calculateProfit(msg.sender);
        uint256 lockBoxAmount = lockBox[msg.sender];
        require(address(this).balance.sub(profit).sub(lockBoxAmount) > minBalance, "not enough funds");

        //  2% - to developers
        uint256 devCommision = lockBoxAmount.div(100);
        devCommission[dev_0_escrow] = devCommission[dev_0_escrow].add(devCommision);
        devCommission[dev_1_escrow] = devCommission[dev_1_escrow].add(devCommision);

        //  3% - stays in contract
        uint256 lockBoxWithdraw = lockBoxAmount.div(100).mul(95);

        uint256 payoutTotal = lockBoxWithdraw + profit;
        withdrawnETH[msg.sender] = withdrawnETH[msg.sender].add(payoutTotal);
        msg.sender.transfer(payoutTotal);

        lockBoxPlayers = lockBoxPlayers.sub(1);
        lockBoxTotal = lockBoxTotal.sub(lockBoxAmount);

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
        uint256 hourDifference = now.sub(lastInvestment[_investor]).div(3600);
        uint256 rate = percentRate(_investor);
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
        
        uint256 lockBoxFromProfit = profit.div(100).mul(84);
        lockBox[msg.sender] = lockBox[msg.sender].add(lockBoxFromProfit);
        lockBoxTotal = lockBoxTotal.add(lockBoxFromProfit);
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
     * @param _investor Address of investor.
     */
    function percentRate(address _investor) private view returns(uint) {
        uint256 stepLow = .15 ether;    //  1.8%
        uint256 stepMiddle = 150 ether; //  3.6%
        uint256 stepHigh = 1000 ether;  // 8.4%

        //  0.075% per hour
        uint256 dailyLowPercent = 75;       // 1.8%
        uint256 dailyMiddlePercent = 150;   // 3.6%
        uint256 dailyHighPercent = 350;     // 8.4%
        
        uint balance = lockBox[_investor];
        if (balance >= stepHigh) {
            return dailyHighPercent;
        } else if (balance >= stepMiddle && balance < stepHigh) {
            return dailyMiddlePercent;
        } else if (balance >= stepLow && balance < stepMiddle) {
            return dailyLowPercent;
        }
    }
}