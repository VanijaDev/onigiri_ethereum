pragma solidity ^0.4.25;

/**

This is the ONIGIRI smart Contract 
85% to Lockbox withdraw at anytime
    - on withdrawal stops paying daily 


 */

 /**
    investETH()
    1. user invests eth
    2. 100% - investedETH
    3. 86% - LockBox
    4.      no referral: 12% - stays in contract balance - contractPole
    4.1.    referral: 10% - stays in contract balance - contractPole, 2% - referrer address
    5. 4% - developers - immediately transferred (dev1, dev2)

    withdraw() - stays the same
    1. let h = get amount of hours after last deposit
    1.1 multiple deposits - TODO
    2. lockBoxAmount = LockBox[msg.sender]
    3. let persentRate: persentRate() - uint balance = address(this).balance; => uint balance = LockBox[msg.sender];
    4. getProfit() - investedETH[customer] => LockBox[customer]
    5. 
 


    contract will let withdraw if balance > 0.15 eth

  */

contract onigiri {
    using SafeMath for uint256;
    
    mapping (address => uint256) public investedETH; // this is eth that is in Onigiri that will pay players
    mapping (address => uint256) public LockBox; // user can withdraw at anytime 
    mapping (address => uint256) public withdrawnETH;
    mapping (address => uint256) public lastInvest;
    mapping (address => uint256) public affiliateCommision;
    
    /** Creator */
    address dev1 = 0xBa21d01125D6932ce8ABf3625977899Fd2C7fa30;    // testing A1    //  TODO: Ronald's
     /** Future  */
    address dev2 = 0xEDa159d4AD09bEdeB9fDE7124E0F5304c30F7790; // testing A2    //  TODO: Ivan's
    
    //  0.075% per hour
    uint public dailyStartPercent = 0;    //  0% - this stops contract from paying out 
    uint public dailyLowPersent = 75;      // 1.8%
    uint public dailyMiddlePersent = 150;   //  3.6%
    uint public dailyHighPersent = 350;     // 8.4%

    uint public stepLow = .15 ether; //  1.8%
    uint public stepMiddle = 150 ether; //  3.6%
    uint public stepHigh = 1000 ether; // 8.4%
    
    function persentRate() public view returns(uint) {
        uint balance = address(this).balance;
        
        if (balance < stepLow) {
            return dailyStartPercent;
        }
        if (balance >= stepLow && balance < stepMiddle) {
            return dailyLowPersent;
        }
        if (balance >= stepMiddle && balance < stepHigh) {
            return dailyMiddlePersent;
        }
        if (balance >= stepHigh) {
            return dailyHighPersent;
        }
    }
    
    function investETH(address referral) public payable {
        require(msg.value >= 0.025 ether, "min investment == 0.025 eth");
        
        if(getProfit(msg.sender) > 0){
            uint256 profit = getProfit(msg.sender);
            lastInvest[msg.sender] = now;
            msg.sender.transfer(profit);
        }
        
        uint256 amount = msg.value;
        //  TODO: update to 2%
        uint256 commision = amount.div(40);
        if(referral != msg.sender && referral != address(0)){
            // affiliateCommision[referral] = SafeMath.add(affiliateCommision[referral], commision);
            affiliateCommision[referral] = affiliateCommision[referral].add(commision);
        }
        
        //  TODO: use mapping for each dev; each dev should withdraw by himself
        dev1.transfer(msg.value.div(100).mul(2));
        dev2.transfer(msg.value.div(100).mul(2));

        
        investedETH[msg.sender] = investedETH[msg.sender].add(amount);
        withdrawnETH[msg.sender] = 0;
        lastInvest[msg.sender] = now;
    }

    function withdrawDev() public {
        //  if dev
        //  get amount for current dev
        //  transfer to dev
    }
    
    //  TODO: not used
    function withdraw() public{
        require(lastInvest[msg.sender] > 0, "ERROR: no investments");
        
        uint256 payoutAmount = getProfit(msg.sender);
        
        if(withdrawnETH[msg.sender].add(payoutAmount) <= investedETH[msg.sender]) { //  TODO: investedETH => LockBox
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
        require(lastInvest[msg.sender] > 0, "ERROR: no investments");
        uint256 payoutAmount = getProfit(msg.sender);
        msg.sender.transfer(payout);
    }

    //  TODO: 
    function withdrawLockBox() public {
        require(lastInvest[msg.sender] > 0, "ERROR: no investments");

        uint256 payoutAmount = getProfit(msg.sender);
        uint256 lockBoxAmount = LockBox[msg.sender];
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
        uint256 hourDifference = now.sub(lastInvest[customer]).div(60);   // TODO: 3600 
        uint256 rate = persentRate();
        uint256 calculatedPercent = hourDifference.mul(rate);
        return investedETH[customer].div(100000).mul(calculatedPercent);
    }
    
    function reinvestProfit() public {
        uint256 profit = getProfit(msg.sender);
        require(profit > 0);
        lastInvest[msg.sender] = now;
        investedETH[msg.sender] = SafeMath.add(investedETH[msg.sender], profit);
    }
    
    function getAffiliateCommision() public view returns(uint256){
        return affiliateCommision[msg.sender];
    }
    
    function withdrawAffiliateCommision() public {
        require(affiliateCommision[msg.sender] > 0);
        uint256 commision = affiliateCommision[msg.sender];
        affiliateCommision[msg.sender] = 0;
        msg.sender.transfer(commision);
    }
    
    function getBalance() public view returns(uint256){
        return address(this).balance;
    }
}

library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }
    uint256 c = a * b;
    assert(c / a == b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  /**
  * @dev Substracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}