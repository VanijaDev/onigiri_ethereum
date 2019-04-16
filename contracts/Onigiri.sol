pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
// import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/math/SafeMath.sol";  //  use in remix

contract Onigiri {
    using SafeMath for uint256;

    struct InvestorInfo {
        uint256 invested;
        uint256 lockbox;
        uint256 withdrawn;
        uint256 lastInvestmentTime;
    }
    
    mapping (address => InvestorInfo) public investors;
    mapping (address => uint256) public affiliateCommission;
    mapping (address => uint256) public devCommission;

    uint256 public investorsCount;
    uint256 public lockboxTotal;
    uint256 public withdrawnProfitTotal;
    uint256 public affiliateCommissionWithdrawnTotal;
    
    uint256 public donatedTotal;
    uint256 public gamesIncomeTotal;
    
    address private constant dev_0_master = 0xc9d76DB051245846254d3aF4949f1094bEEeE3CE;  //  TODO: Ronald's master
    address private constant dev_1_master = 0xb37277d6558D41fAdd2a291AB0bD398D4564Be40;  //  TODO: Ivan's master
    address private dev_0_escrow = 0x92ff09fe4EB65103c7A85c43CbBeafd345Ad41ee;           //  TODO: Ronald's escrow, empty in PROD
    address private dev_1_escrow = 0xA8265C1f1e158519C96A182fdAf14913D21e31E0;           //  TODO: Ivan's escrow, empty in PROD

    uint256 public constant minInvest = 0.025 ether;

    event Invested(address investor, uint256 amount);
    event Renvested(address investor, uint256 amount);
    event WithdrawnAffiliateCommission(address affiliate, uint256 amount);
    event WithdrawnProfit(address investor, uint256 amount);
    event WithdrawnLockbox(address investor, uint256 amount);

    /**
     * PUBLIC
     */

     /**
     * @dev Donation for Onigiry ecosystem.
     * TESTED
     */
    function() external payable {
        //  2% - to developers
        uint256 devFee = msg.value.div(100);
        devCommission[dev_0_escrow] = devCommission[dev_0_escrow].add(devFee);
        devCommission[dev_1_escrow] = devCommission[dev_1_escrow].add(devFee);
        
        donatedTotal = donatedTotal.add(msg.value);
    }

    /**
     * @dev Accepts income from games for Onigiry ecosystem.
     * TESTED
     */
    function fromGame() external payable {
        //  4% - to developers
        uint256 devFee = msg.value.div(100).mul(2);
        devCommission[dev_0_escrow] = devCommission[dev_0_escrow].add(devFee);
        devCommission[dev_1_escrow] = devCommission[dev_1_escrow].add(devFee);
        
        gamesIncomeTotal = gamesIncomeTotal.add(msg.value);
    }

    /**
     * @dev Returns invested amount for investor.
     * @param _address Investor address.
     * @return invested amount.
     * TESTED
     */
    function getInvested(address _address) public view returns(uint256) {
        return investors[_address].invested;
    }

    /**
     * @dev Returns lockbox amount for investor.
     * @param _address Investor address.
     * @return lockbox amount.
     * TESTED
     */
    function getLockBox(address _address) public view returns(uint256) {
        return investors[_address].lockbox;
    }

    /**
     * @dev Returns withdrawn amount for investor.
     * @param _address Investor address.
     * @return withdrawn amount.
     * TESTED
     */
    function getWithdrawn(address _address) public view returns(uint256) {
        return investors[_address].withdrawn;
    }

    /**
     * @dev Returns last investment time amount for investor.
     * @param _address Investor address.
     * @return last investment time.
     * TESTED
     */
    function getLastInvestmentTime(address _address) public view returns(uint256) {
        return investors[_address].lastInvestmentTime;
    }

    /**
     * @dev Gets balance for current contract.
     * @return balance for current contract.
     * TESTED
     */
    function getBalance() public view returns(uint256){
        return address(this).balance;
    }

    /**
     * @dev Calculates sum for lockboxes and dev fees.
     * @return Amount of guaranteed balance by constract.
     * TESTED
     */
    function guaranteedBalance() public view returns(uint256) {
        return lockboxTotal.add(devCommission[dev_0_escrow]).add(devCommission[dev_1_escrow]);
    }

    /**
     * @dev User invests funds.
     * @param _affiliate affiliate address.
     * TESTED
     */
    function invest(address _affiliate) public payable {
        require(msg.value >= minInvest, "min 0.025 eth");

        uint256 profit = calculateProfit(msg.sender);
        if(profit > 0){
            msg.sender.transfer(profit);
        }

        //  1% - to affiliateCommission
        if(_affiliate != msg.sender && _affiliate != address(0)) {
            uint256 commission = msg.value.div(100);
            affiliateCommission[_affiliate] = affiliateCommission[_affiliate].add(commission);
        }

        if(getLastInvestmentTime(msg.sender) == 0) {
            investorsCount = investorsCount.add(1);
        }

        uint256 lockboxAmount = msg.value.div(100).mul(84);
        investors[msg.sender].lockbox = investors[msg.sender].lockbox.add(lockboxAmount);
        investors[msg.sender].invested = investors[msg.sender].invested.add(msg.value);
        investors[msg.sender].lastInvestmentTime = now;
        delete investors[msg.sender].withdrawn;
        
        lockboxTotal = lockboxTotal.add(lockboxAmount);
        
        //  4% - to developers
        uint256 devFee = msg.value.div(100).mul(2);
        devCommission[dev_0_escrow] = devCommission[dev_0_escrow].add(devFee);
        devCommission[dev_1_escrow] = devCommission[dev_1_escrow].add(devFee);

        emit Invested(msg.sender, msg.value);
    }

    /**
     * @dev Updates escrow address for developer.
     * @param _address Address of escrow to be used.
     * TESTED
     */
    function updateDevEscrow(address _address) public {
        require(msg.sender == dev_0_master || msg.sender == dev_1_master, "not dev");
        (msg.sender == dev_0_master) ? dev_0_escrow = _address : dev_1_escrow = _address;
    }

    /**
     * @dev Allows developer to withdraw commission.
     * TESTED
     */
    function withdrawDevCommission() public {
        uint256 commission = devCommission[msg.sender];
        require(commission > 0, "no dev commission");
        require(address(this).balance.sub(commission) >= lockboxTotal, "not enough funds");

        delete devCommission[msg.sender];
        msg.sender.transfer(commission);
    }
    
    /**
     * @dev Withdraws affiliate commission for current address.
     * TESTED
     */
    function withdrawAffiliateCommission() public {
        uint256 commission = affiliateCommission[msg.sender];
        require(commission > 0, "no commission");
        require(address(this).balance.sub(commission) >= guaranteedBalance(), "not enough funds");

        delete affiliateCommission[msg.sender];
        affiliateCommissionWithdrawnTotal = affiliateCommissionWithdrawnTotal.add(commission);

        msg.sender.transfer(commission);

        emit WithdrawnAffiliateCommission(msg.sender, commission);
    }

    /**
     * @dev Allows investor to withdraw profit.
     * TESTED
     */
    function withdrawProfit() public {
        uint256 profit = calculateProfit(msg.sender);
        require(profit > 0, "no profit");
        require(address(this).balance.sub(profit) >= guaranteedBalance(), "not enough funds");

        investors[msg.sender].lastInvestmentTime = now;
        investors[msg.sender].withdrawn = investors[msg.sender].withdrawn.add(profit);

        withdrawnProfitTotal = withdrawnProfitTotal.add(profit);
        
        //  2% - to developers
        uint256 devFee = profit.div(100);
        devCommission[dev_0_escrow] = devCommission[dev_0_escrow].add(devFee);
        devCommission[dev_1_escrow] = devCommission[dev_1_escrow].add(devFee);
        
        //  3% - stay in contract
        msg.sender.transfer(profit.div(100).mul(95));

        emit WithdrawnProfit(msg.sender, profit);
    }

    /**
     * @dev Allows investor to withdraw lockbox funds, close deposit and clear all data.
     * @notice Pending profit stays in contract.
     * TESTING
     */
    function withdrawLockBoxAndClose() public {
        uint256 lockboxAmount = getLockBox(msg.sender);
        require(lockboxAmount > 0, "no investments");

        delete investors[msg.sender];
        investorsCount = investorsCount.sub(1);
        lockboxTotal = lockboxTotal.sub(lockboxAmount);

        msg.sender.transfer(lockboxAmount);

        emit WithdrawnLockbox(msg.sender, lockboxAmount);
    }
    
    /**
     * @dev Reinvests pending profit.
     * TESTED
     */
    function reinvestProfit() public {
        uint256 profit = calculateProfit(msg.sender);
        require(profit > 0, "no profit");
        require(address(this).balance.sub(profit) >= guaranteedBalance(), "not enough funds");
        
        uint256 lockboxFromProfit = profit.div(100).mul(84);
        investors[msg.sender].lockbox = investors[msg.sender].lockbox.add(lockboxFromProfit);
        investors[msg.sender].lastInvestmentTime = now;
        investors[msg.sender].invested = investors[msg.sender].invested.add(profit);

        lockboxTotal = lockboxTotal.add(lockboxFromProfit);

        emit Renvested(msg.sender, profit);
    }

    /**
     * @dev Calculates pending profit for provided customer.
     * @param _investor Address of investor.
     * @return pending profit.
     * TESTED
     */
    function calculateProfit(address _investor) public view returns(uint256){
        uint256 hourDifference = now.sub(investors[_investor].lastInvestmentTime).div(3600);
        // uint256 hourDifference = now.sub(investors[_investor].lastInvestmentTime).div(60);   //  TODO: use for testing
        uint256 rate = percentRate(investors[_investor].lockbox);
        uint256 calculatedPercent = hourDifference.mul(rate);
        return investors[_investor].lockbox.div(100000).mul(calculatedPercent);
    }

    /**
     * PRIVATE
     */

    /**
     * @dev Calculates rate for lockbox balance for msg.sender.
     * @param _balance Balance to calculate percentage.
     * @return rate for lockbox balance.
     * TESTING
     */
    function percentRate(uint256 _balance) public pure returns(uint256) {
        /**
            ~ .99 -    - 0.6%
            1 ~ 50     - 0.96% 
            51 ~ 100   - 1.2% 
            100 ~ 250  - 1.44% 
            250 ~      - 1.8% 
         */
        uint256 step_1 = .99 ether;
        uint256 step_2 = 50 ether;
        uint256 step_3 = 100 ether;
        uint256 step_4 = 250 ether;

        uint256 dailyPercent_0 = 25;   //  0.6%
        uint256 dailyPercent_1 = 40;   //  0.96%
        uint256 dailyPercent_2 = 50;   //  1.2%
        uint256 dailyPercent_3 = 60;   //  1.44%
        uint256 dailyPercent_4 = 75;   //  1.8%

        if (_balance >= step_4) {
            return dailyPercent_4;
        } else if (_balance >= step_3 && _balance < step_4) {
            return dailyPercent_3;
        } else if (_balance >= step_2 && _balance < step_3) {
            return dailyPercent_2;
        } else if (_balance >= step_1 && _balance < step_2) {
            return dailyPercent_1;
        }

        return dailyPercent_0;
    }
}