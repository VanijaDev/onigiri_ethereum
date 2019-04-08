pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";


contract Onigiri {
    using SafeMath for uint256;

    struct InvestorInfo {
        uint256 invested;
        uint256 lockBox;
        uint256 withdrawn;
        uint256 lastInvestmentTime;
    }
    
    mapping (address => InvestorInfo) public investors;
    mapping (address => uint256) public affiliateCommission;
    mapping (address => uint256) private devCommission;

    uint256 public investorsTotal;
    uint256 public lockBoxTotal;
    uint256 public withdrawnEarningsTotal;
    uint256 public affiliateCommissionWithdrawnTotal;
    
    uint256 public donatedTotal;
    uint256 public gamesIncomeTotal;
    
    address private constant dev_0_master = 0xc9d76DB051245846254d3aF4949f1094bEEeE3CE;  //  TODO: Ronald's master
    address private constant dev_1_master = 0xb37277d6558D41fAdd2a291AB0bD398D4564Be40;  //  TODO: Ivan's master
    address private dev_0_escrow = 0x92ff09fe4EB65103c7A85c43CbBeafd345Ad41ee;  //  TODO: Ronald's escrow, empty in PROD
    address private dev_1_escrow = 0xA8265C1f1e158519C96A182fdAf14913D21e31E0;  //  TODO: Ivan's escrow, empty in PROD

    uint256 public constant minInvest = 0.025 ether;

    /**
     * PUBLIC
     */

     /**
     * @dev Donation for Onigiry ecosystem.
     */
    function() external payable {
        uint256 devFee = msg.value.div(100);
        devCommission[dev_0_escrow] = devCommission[dev_0_escrow].add(devFee);
        devCommission[dev_1_escrow] = devCommission[dev_1_escrow].add(devFee);
        
        donatedTotal = donatedTotal.add(msg.value);
    }

    /**
     * @dev Accepts income from games for Onigiry ecosystem.
     */
    function fromGame() external payable {
        uint256 devFee = msg.value.div(100).mul(2);
        devCommission[dev_0_escrow] = devCommission[dev_0_escrow].add(devFee);
        devCommission[dev_1_escrow] = devCommission[dev_1_escrow].add(devFee);
        
        gamesIncomeTotal = gamesIncomeTotal.add(msg.value);
    }

    /**
     * @dev Returns invested amount for investor.
     * @param _address Investor address.
     * @return invested amount.
     */
    function getInvested(address _address) public view returns(uint256) {
        return investors[_address].invested;
    }

    /**
     * @dev Returns lockbox amount for investor.
     * @param _address Investor address.
     * @return lockbox amount.
     */
    function getLockBox(address _address) public view returns(uint256) {
        return investors[_address].lockBox;
    }

    /**
     * @dev Returns withdrawn amount for investor.
     * @param _address Investor address.
     * @return withdrawn amount.
     */
    function getWithdrawn(address _address) public view returns(uint256) {
        return investors[_address].withdrawn;
    }

    /**
     * @dev Returns last investment time amount for investor.
     * @param _address Investor address.
     * @return last investment time.
     */
    function getLastInvestmentTime(address _address) public view returns(uint256) {
        return investors[_address].lastInvestmentTime;
    }

    /**
     * @dev User invests funds.
     * @param _affiliate affiliate address.
     */
    function invest(address _affiliate) public payable {
        require(msg.value >= minInvest, "min 0.025 eth");

        uint256 profit = calculateProfit(msg.sender);
        if(profit > 0){
            msg.sender.transfer(profit);
        }

        if(_affiliate != msg.sender && _affiliate != address(0)) {
            uint256 commission = msg.value.mul(2).div(100);
            affiliateCommission[_affiliate] = affiliateCommission[_affiliate].add(commission);
        }

        if(getLockBox(msg.sender) == 0) {
            investorsTotal = investorsTotal.add(1);
        }

        uint256 lockBoxAmount = msg.value.div(100).mul(84);
        investors[msg.sender].lockBox = investors[msg.sender].lockBox.add(lockBoxAmount);
        investors[msg.sender].invested = investors[msg.sender].invested.add(msg.value);
        investors[msg.sender].lastInvestmentTime = now;
        delete investors[msg.sender].withdrawn;
        
        lockBoxTotal = lockBoxTotal.add(lockBoxAmount);
        
        //  4% - to developers
        uint256 devFee = msg.value.div(100).mul(2);
        devCommission[dev_0_escrow] = devCommission[dev_0_escrow].add(devFee);
        devCommission[dev_1_escrow] = devCommission[dev_1_escrow].add(devFee);
    }
    
    /**
     * @dev Calculates commission for developer.
     * @return commission for developer.
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
        require(address(this).balance.sub(commission) >= lockBoxTotal, "not enough funds");

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
    function withdrawAffiliateCommission() public {
        uint256 commission = affiliateCommission[msg.sender];
        require(commission > 0, "no commission");
        require(address(this).balance.sub(commission) >= lockBoxTotal, "not enough funds");

        delete affiliateCommission[msg.sender];
        msg.sender.transfer(commission);
        
        affiliateCommissionWithdrawnTotal = affiliateCommissionWithdrawnTotal.add(commission);
    }

    /**
     * @dev Allows investor to withdraw earnings.
     */
    function withdrawEarnings() public {
        uint256 profit = calculateProfit(msg.sender);
        require(profit > 0, "no profit");
        require(address(this).balance.sub(profit) >= lockBoxTotal, "not enough funds");

        investors[msg.sender].lastInvestmentTime = now;
        investors[msg.sender].withdrawn = investors[msg.sender].withdrawn.add(profit);

        withdrawnEarningsTotal = withdrawnEarningsTotal.add(profit);
        
        //  2% - to developers
        uint256 devFee = profit.div(100);
        devCommission[dev_0_escrow] = devCommission[dev_0_escrow].add(devFee);
        devCommission[dev_1_escrow] = devCommission[dev_1_escrow].add(devFee);
        
        //  3% - stays in contract
        msg.sender.transfer(profit.mul(95));
    }

    /**
     * @dev Allows investor to withdraw lockBox funds, close deposit and clear all data.
     * @notice Pending profit stays in contract.
     */
    function withdrawLockBoxAndClose() public {
        uint256 lockBoxAmount = investors[msg.sender].lockBox;
        require(lockBoxAmount > 0, "no investments");

        msg.sender.transfer(lockBoxAmount);

        delete investors[msg.sender];
        investorsTotal = investorsTotal.sub(1);
        lockBoxTotal = lockBoxTotal.sub(lockBoxAmount);
    }

    /**
     * @dev Calculates pending profit for provided customer.
     * @param _investor Address of investor.
     * @return pending profit.
     */
    function calculateProfit(address _investor) public view returns(uint256){
        uint256 hourDifference = now.sub(investors[_investor].lastInvestmentTime).div(3600);
        uint256 rate = percentRate(_investor);
        uint256 calculatedPercent = hourDifference.mul(rate);
        return investors[_investor].lockBox.div(100000).mul(calculatedPercent);
    }
    
    /**
     * @dev Reinvests pending profit.
     */
    function reinvestProfit() public {
        uint256 profit = calculateProfit(msg.sender);
        require(profit > 0, "no profit");
        require(address(this).balance.sub(profit) >= lockBoxTotal, "not enough funds");
        
        uint256 lockBoxFromProfit = profit.div(100).mul(84);
        investors[msg.sender].lockBox = investors[msg.sender].lockBox.add(lockBoxFromProfit);
        investors[msg.sender].lastInvestmentTime = now;
        investors[msg.sender].invested = investors[msg.sender].invested.add(profit);

        lockBoxTotal = lockBoxTotal.add(lockBoxFromProfit);
    }
    
    /**
     * @dev Gets balance for current contract.
     * @return balance for current contract.
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
     * @return rate for lockBox balance.
     */
    function percentRate(address _investor) private view returns(uint) {
        uint256 stepLow = .15 ether;    //  1.8%
        uint256 stepMiddle = 150 ether; //  3.6%
        uint256 stepHigh = 1000 ether;  // 8.4%

        uint256 dailyLowPercent = 75;       // 1.8%
        uint256 dailyMiddlePercent = 150;   // 3.6%
        uint256 dailyHighPercent = 350;     // 8.4%
        
        uint balance = investors[_investor].lockBox;
        if (balance >= stepHigh) {
            return dailyHighPercent;
        } else if (balance >= stepMiddle && balance < stepHigh) {
            return dailyMiddlePercent;
        } else if (balance >= stepLow && balance < stepMiddle) {
            return dailyLowPercent;
        }
    }
}