// contracts/MockDEX.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MockDEX is ReentrancyGuard {
    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address indexed to
    );
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    mapping(address => uint256) public balances;
    uint256 public totalSupply;
    
    // Mock token addresses
    address public constant AVAX = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address public constant USDC = 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E;
    
    // Simple exchange rate: 1 AVAX = 20 USDC
    uint256 public constant EXCHANGE_RATE = 20;
    
    constructor() {
        // Initialize with some liquidity
        balances[address(this)] = 1000000 * 10**18; // 1M tokens
        totalSupply = 1000000 * 10**18;
    }
    
    function swapAVAXForUSDC(uint256 minUSDCOut) external payable nonReentrant {
        require(msg.value > 0, "Must send AVAX");
        
        uint256 usdcOut = msg.value * EXCHANGE_RATE;
        require(usdcOut >= minUSDCOut, "Insufficient output amount");
        require(balances[address(this)] >= usdcOut, "Insufficient liquidity");
        
        balances[address(this)] -= usdcOut;
        balances[msg.sender] += usdcOut;
        
        emit Swap(
            msg.sender,
            msg.value,
            0,
            0,
            usdcOut,
            msg.sender
        );
        
        emit Transfer(address(this), msg.sender, usdcOut);
    }
    
    function swapUSDCForAVAX(uint256 usdcIn, uint256 minAVAXOut) external nonReentrant {
        require(usdcIn > 0, "Must send USDC");
        require(balances[msg.sender] >= usdcIn, "Insufficient USDC balance");
        
        uint256 avaxOut = usdcIn / EXCHANGE_RATE;
        require(avaxOut >= minAVAXOut, "Insufficient output amount");
        require(address(this).balance >= avaxOut, "Insufficient AVAX liquidity");
        
        balances[msg.sender] -= usdcIn;
        balances[address(this)] += usdcIn;
        
        payable(msg.sender).transfer(avaxOut);
        
        emit Swap(
            msg.sender,
            0,
            usdcIn,
            avaxOut,
            0,
            msg.sender
        );
        
        emit Transfer(msg.sender, address(this), usdcIn);
    }
    
    function addLiquidity() external payable {
        // Simple liquidity addition
        uint256 usdcAmount = msg.value * EXCHANGE_RATE;
        balances[address(this)] += usdcAmount;
        totalSupply += usdcAmount;
    }
    
    function getBalance(address account) external view returns (uint256) {
        return balances[account];
    }
    
    function getReserves() external view returns (uint256 avaxReserve, uint256 usdcReserve) {
        return (address(this).balance, balances[address(this)]);
    }
    
    // Allow contract to receive AVAX
    receive() external payable {}
}
