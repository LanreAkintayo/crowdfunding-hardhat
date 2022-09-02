// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

/*
pledge(uint id, Project project, address token ) function:  Pledging is just a way of supporting a project by funding with any of the supported token.
unpledge(uint id, Project project): If you do not want to support a project, you call this method.
claim(uint id): This function allows you to claim your fund if the goal is reached after the deadline.
launch(): This function allows us to launch a project on the platform
close(): This function allows us to close a project after launching.
setSupportedTokens(): This function allows us to set up the tokens that can be used in pledging.


getProjectInfo(uint id): This returns all the project info.

 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IWBNB.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

error NotOwner();
error StartedAlready();
error InvalidProject();
error TokenNotSupported();
error InvalidPledge();
error GoalNotMet();
error NotAvailableForPledging();
error ProjectStillOpen();
error GoalAlreadyReached();

contract Crowdfund is ReentrancyGuard, Ownable {

    address constant WBNB = 0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd;

    uint256 id;

    enum Status {
        Launched,
        Pledged,
        Unpledged,
        Claimed,
        Closed
    }

    struct Project {
        address owner;
        uint256 id;
        uint256 startDay;
        uint256 endDay;
        uint256 goal;
        // Status status;
    }

    struct BackerInfo {
        address backerAddress;
        address tokenAddress;
        uint256 amount;
    }

    mapping(uint256 => Project) public projects;
    mapping(uint256 => BackerInfo[]) public backers;
    mapping(address => address) public tokenToPriceFeed;
    address[] public supportedTokensAddress;

    /*******************************************************************************************************
                                            External functions
  ******************************************************************************************************** */

    function launch(
        uint256 startDay,
        uint256 duration,
        uint256 goal
    ) external {
        Project memory project = Project(
            msg.sender,
            id,
            startDay,
            startDay + duration,
            goal
        );

        projects[id] = project;

        id++;
    }

    function close(uint256 _id) external {
        Project memory project = projects[_id];
        if (msg.sender != project.owner) {
            revert NotOwner();
        }

        if (project.startDay <= block.timestamp) {
            revert StartedAlready();
        }

        delete projects[_id];
    }

    function pledge(
        uint256 _id,
        address tokenAddress,
        uint256 amount
    ) external nonReentrant {
        Project memory project = projects[_id];
        if (project.owner == address(0)) {
            revert InvalidProject();
        }

        if (!isSupported(tokenAddress)) {
            revert TokenNotSupported();
        }

        if (!(block.timestamp >= project.startDay && block.timestamp < project.endDay)){
            revert NotAvailableForPledging();
        }

        if (tokenAddress == WBNB){
            IWBNB(tokenAddress).transferFrom(msg.sender, address(this), amount);
        } else{
            IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        }

        int256 index = checkPledgingWithToken(_id, tokenAddress);

        if (index < 0) {
            BackerInfo memory backerInfo = BackerInfo(
                msg.sender,
                tokenAddress,
                amount
            );
            backers[_id].push(backerInfo);
        } else {
            BackerInfo storage backerInfo = backers[_id][uint256(index)];
            backerInfo.amount += amount;
        }
    }

    function unpledge(
        uint256 _id,
        address tokenAddress,
        uint256 amount
    ) external nonReentrant{
        int256 index = checkPledgingWithToken(_id, tokenAddress);

        require(index >= 0, "Not found");

        BackerInfo memory backerInfo = backers[_id][uint256(index)];
        // Make sure that the user has pledged already

        if (
            backerInfo.tokenAddress != address(0) && backerInfo.amount >= amount
        ) {
            backers[_id][uint256(index)].amount -= amount;
            if (tokenAddress == WBNB){
                require(address(this).balance >= amount,
                "Insufficient Balance");

                IWBNB(WBNB).withdraw(amount);
                (bool success, ) = msg.sender.call{value: amount}("");
                require(success, "Transfer failed");

            } else{
                IERC20 token = IERC20(tokenAddress);
                require(
                    token.balanceOf(address(this)) >= amount,
                    "Insufficient Balance"
                );
                token.transfer(msg.sender, amount);
            }
            
        } else {
            revert InvalidPledge();
        }
    }

    function claim(uint256 _id) external nonReentrant{
        require(projects[_id].owner == msg.sender, "Only owner can claim");
        BackerInfo[] memory backersInfo = backers[_id];
        uint256 totalAmountRaisedInDollars = getTotalAmountRaisedInDollars(_id);
        console.log("This is the total amount raised in dollars: ", totalAmountRaisedInDollars);
        
         if (block.timestamp < projects[_id].endDay){
            revert ProjectStillOpen();
        }
        if (totalAmountRaisedInDollars < projects[_id].goal) {
            revert GoalNotMet();
        }
      
        for (uint256 i = 0; i < backersInfo.length; i++) {
            BackerInfo memory backerInfo = backersInfo[i];
            
            if (backerInfo.tokenAddress == WBNB){
                console.log("address of token ", backerInfo.tokenAddress);
                console.log("WBNB: ", WBNB);
                console.log("backerInfo.amount", backerInfo.amount);
                console.log("BNB Balance before: ", address(this).balance);


                IWBNB(WBNB).transfer(msg.sender, backerInfo.amount);
                console.log("BNB Balance after: ", address(this).balance);

                // payable(msg.sender).transfer(backerInfo.amount);
                // (bool success, ) = msg.sender.call{value: backerInfo.amount}("");
                // require(success, "Transaction failed");
            } else{
                IERC20 token = IERC20(backerInfo.tokenAddress);
                token.transfer(msg.sender, backerInfo.amount);
            }

            backers[_id][i].amount -= backerInfo.amount;
        }
    }

    function setTokenToPriceFeed(address tokenAddress, address priceFeed)
        external
        onlyOwner
    {
        tokenToPriceFeed[tokenAddress] = priceFeed;
    }

    function setSupportedTokensAddress(address[] memory tokensAddress)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < tokensAddress.length; i++) {
            address currentTokenAddress = tokensAddress[i];
            int256 index = checkIfSupported(currentTokenAddress);

            if (index < 0) {
                supportedTokensAddress.push(currentTokenAddress);
            }
        }
    }

    function refund(uint _id) external nonReentrant{
        Project memory project = projects[_id];

        uint totalAmountRaisedInDollars = getTotalAmountRaisedInDollars(_id);

        if (block.timestamp < project.endDay){
            revert ProjectStillOpen();
        }
        if (totalAmountRaisedInDollars >= project.goal){
            revert GoalAlreadyReached();
        }
        BackerInfo[] memory projectBackers = backers[_id];

        for (uint i = 0; i < projectBackers.length; i++){
            BackerInfo memory backer = projectBackers[i];
            IERC20 token = IERC20(backer.tokenAddress);

            if (address(token) == WBNB){
                IWBNB(WBNB).withdraw(backer.amount);
                (bool success, ) = backer.backerAddress.call{value: backer.amount}("");
                require(success, "Transaction failed");
            } else{
                token.transfer(backer.backerAddress, backer.amount);
            }

            backers[_id][i].amount -= backer.amount;
        }

        
    }

    /*******************************************************************************************************
                                            External functions that are view
  ******************************************************************************************************** */

    function getSupportedTokensAddress()
        external
        view
        returns (address[] memory)
    {
        return supportedTokensAddress;
    }

    function getBackers(uint _id) external view returns (BackerInfo[] memory){
        return backers[_id];
    }

    /*******************************************************************************************************
                                            External functions that are pure
  ******************************************************************************************************** */

    /*******************************************************************************************************
                                            Public functions
  ******************************************************************************************************** */

    function getTotalAmountRaisedInDollars(uint256 _id)
        public
        view
        returns (uint256)
    {
        BackerInfo[] memory backersInfo = backers[_id];

        if (backersInfo.length == 0) {
            return 0;
        }
        uint256 totalAmountRaisedInDollars = 0;
        for (uint256 i = 0; i < backersInfo.length; i++) {
            BackerInfo memory backerInfo = backersInfo[i];
            uint256 amountInDollars = getAmountInDollars(
                backerInfo.amount,
                backerInfo.tokenAddress
            );
            totalAmountRaisedInDollars += amountInDollars;
        }

        return totalAmountRaisedInDollars;
    }

    /*******************************************************************************************************
                                            Internal functions
  ******************************************************************************************************** */

    function checkIfSupported(address tokenAddress)
        internal
        view
        returns (int256)
    {
        for (uint256 i = 0; i < supportedTokensAddress.length; i++) {
            address currentTokenAddress = supportedTokensAddress[i];
            if (currentTokenAddress == tokenAddress) {
                return int256(i);
            }
        }
        return -1;
    }

    function checkPledgingWithToken(uint256 _id, address _tokenAddress)
        internal
        view
        returns (int256)
    {
        BackerInfo[] memory backersInfo = backers[_id];

        if (backersInfo.length == 0) {
            return -1;
        }

        for (uint256 i = 0; i < backersInfo.length; i++) {
            BackerInfo memory currentBackerInfo = backersInfo[i];
            if (
                currentBackerInfo.backerAddress == msg.sender &&
                currentBackerInfo.tokenAddress == _tokenAddress
            ) {
                return int256(i);
            }
        }

        return -1;
    }

    function isSupported(address tokenAddress) internal view returns (bool) {
        for (uint256 i = 0; i < supportedTokensAddress.length; i++) {
            address currentTokenAddress = supportedTokensAddress[i];
            if (currentTokenAddress == tokenAddress) {
                return true;
            }
        }

        return false;
    }

    function getAmountInDollars(uint256 amount, address tokenAddress)
        internal
        view
        returns (uint256)
    {
        (
            uint256 dollarPerToken,
            uint256 decimals
        ) = oneTokenEqualsHowManyDollars(tokenAddress);
        uint256 totalAmountInDollars = (amount * dollarPerToken) /
            (10**decimals);
        return totalAmountInDollars;
    }

    function oneTokenEqualsHowManyDollars(address tokenAddress)
        internal
        view
        returns (uint256, uint256)
    {
        address tokenToUsd = tokenToPriceFeed[tokenAddress];
        AggregatorV3Interface priceFeed = AggregatorV3Interface(tokenToUsd);

        (, int256 price, , , ) = priceFeed.latestRoundData();

        uint256 decimals = priceFeed.decimals();

        return (uint256(price), decimals);
    }

    /*******************************************************************************************************
                                            Private functions
  ******************************************************************************************************** */
}
