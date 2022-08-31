// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TEST2 is ERC20 {
    constructor() ERC20("TEST2 Token", "TEST2") {
        _mint(msg.sender, 1000000 * 10**18);
    }
}
