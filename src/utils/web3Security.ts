import { ethers } from 'ethers';

// Web3 Security Utilities
export class Web3Security {
  // Validate contract address
  static isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  // Validate transaction hash
  static isValidTransactionHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  }

  // Check if address is a contract
  static async isContract(address: string, provider: ethers.Provider): Promise<boolean> {
    try {
      const code = await provider.getCode(address);
      return code !== '0x';
    } catch {
      return false;
    }
  }

  // Validate transaction before sending
  static validateTransaction(tx: {
    to?: string | ethers.AddressLike;
    value?: string | number | bigint;
    data?: string;
    gasLimit?: string | number | bigint;
    gasPrice?: string | number | bigint;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate recipient address
    if (tx.to && !this.isValidAddress(tx.to.toString())) {
      errors.push('Invalid recipient address');
    }

    // Validate value
    if (tx.value) {
      try {
        const value = ethers.parseEther(tx.value.toString());
        if (value < 0) {
          errors.push('Transaction value cannot be negative');
        }
      } catch {
        errors.push('Invalid transaction value');
      }
    }

    // Validate gas limit
    if (tx.gasLimit) {
      const gasLimit = Number(tx.gasLimit);
      if (gasLimit < 21000 || gasLimit > 10000000) {
        errors.push('Gas limit must be between 21,000 and 10,000,000');
      }
    }

    // Validate gas price
    if (tx.gasPrice) {
      try {
        const gasPrice = ethers.parseUnits(tx.gasPrice.toString(), 'gwei');
        if (gasPrice < 1 || gasPrice > 1000) {
          errors.push('Gas price must be between 1 and 1000 gwei');
        }
      } catch {
        errors.push('Invalid gas price');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Check for suspicious contract interactions
  static async checkContractSafety(
    address: string,
    provider: ethers.Provider
  ): Promise<{ isSafe: boolean; warnings: string[] }> {
    const warnings: string[] = [];

    try {
      // Check if it's a contract
      const isContract = await this.isContract(address, provider);
      if (!isContract) {
        return { isSafe: true, warnings: [] };
      }

      // Check for known malicious patterns
      const code = await provider.getCode(address);
      
      // Check for self-destruct
      if (code.includes('ff')) {
        warnings.push('Contract contains self-destruct functionality');
      }

      // Check for delegate call
      if (code.includes('f4')) {
        warnings.push('Contract uses delegate call - proceed with caution');
      }

      // Check for proxy patterns
      if (code.includes('3659cfe6') || code.includes('5c60da1b')) {
        warnings.push('Contract appears to be a proxy - verify implementation');
      }

    } catch (error) {
      warnings.push('Unable to analyze contract safety');
    }

    return {
      isSafe: warnings.length === 0,
      warnings
    };
  }

  // Calculate safe gas limit
  static async calculateSafeGasLimit(
    tx: ethers.TransactionRequest,
    provider: ethers.Provider
  ): Promise<bigint> {
    try {
      const estimatedGas = await provider.estimateGas(tx);
      // Add 20% buffer for safety
      return (estimatedGas * 120n) / 100n;
    } catch (error) {
      // Fallback to a reasonable default
      return 300000n;
    }
  }

  // Check for front-running protection
  static async checkFrontRunningProtection(
    tx: ethers.TransactionRequest,
    provider: ethers.Provider
  ): Promise<{ hasProtection: boolean; recommendations: string[] }> {
    const recommendations: string[] = [];

    try {
      // Check if transaction has reasonable gas price
      const feeData = await provider.getFeeData();
      const txGasPrice = tx.gasPrice || feeData.gasPrice;
      
      if (txGasPrice && feeData.gasPrice) {
        const gasPriceRatio = Number(txGasPrice) / Number(feeData.gasPrice);
        
        if (gasPriceRatio < 1.1) {
          recommendations.push('Consider increasing gas price to prevent front-running');
        }
        
        if (gasPriceRatio > 2) {
          recommendations.push('Gas price is very high - consider waiting for lower fees');
        }
      }

      // Check for slippage protection in DEX transactions
      if (tx.data && tx.data.includes('0x38ed1739')) { // swapExactTokensForTokens
        recommendations.push('Ensure slippage protection is enabled for DEX swaps');
      }

    } catch (error) {
      recommendations.push('Unable to check front-running protection');
    }

    return {
      hasProtection: recommendations.length === 0,
      recommendations
    };
  }

  // Validate token approval
  static validateTokenApproval(
    tokenAddress: string,
    spenderAddress: string,
    amount: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.isValidAddress(tokenAddress)) {
      errors.push('Invalid token address');
    }

    if (!this.isValidAddress(spenderAddress)) {
      errors.push('Invalid spender address');
    }

    try {
      const parsedAmount = ethers.parseEther(amount);
      if (parsedAmount <= 0) {
        errors.push('Approval amount must be positive');
      }
    } catch {
      errors.push('Invalid approval amount');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Check for honeypot tokens
  static async checkHoneypot(
    tokenAddress: string,
    provider: ethers.Provider,
    userAddress: string
  ): Promise<{ isHoneypot: boolean; warnings: string[] }> {
    const warnings: string[] = [];

    try {
      // Create token contract instance
      const tokenABI = [
        'function balanceOf(address) view returns (uint256)',
        'function transfer(address,uint256) returns (bool)',
        'function decimals() view returns (uint8)',
        'function symbol() view returns (string)',
        'function name() view returns (string)'
      ];

      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);

      // Check if user can transfer tokens
      const balance = await tokenContract.balanceOf(userAddress);
      
      if (balance > 0) {
        try {
          // Try to simulate a transfer to detect honeypot
          const testAmount = ethers.parseEther('0.000001');
          await tokenContract.transfer.staticCall(userAddress, testAmount);
        } catch (error) {
          warnings.push('Token may be a honeypot - transfers may fail');
        }
      }

      // Check token metadata
      try {
        const symbol = await tokenContract.symbol();
        const name = await tokenContract.name();
        
        if (!symbol || !name) {
          warnings.push('Token has missing metadata');
        }
      } catch {
        warnings.push('Unable to fetch token metadata');
      }

    } catch (error) {
      warnings.push('Unable to analyze token for honeypot characteristics');
    }

    return {
      isHoneypot: warnings.length > 0,
      warnings
    };
  }

  // Generate secure random nonce
  static generateSecureNonce(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return ethers.hexlify(array);
  }

  // Validate signature
  static async validateSignature(
    message: string,
    signature: string,
    expectedSigner: string
  ): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedSigner.toLowerCase();
    } catch {
      return false;
    }
  }

  // Check for replay attacks
  static createReplayProtection(
    chainId: number,
    contractAddress: string,
    nonce: string
  ): string {
    return ethers.solidityPackedKeccak256(
      ['uint256', 'address', 'bytes32'],
      [chainId, contractAddress, nonce]
    );
  }

  // Validate multi-sig transaction
  static validateMultiSigTransaction(
    signatures: string[],
    requiredSignatures: number
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (signatures.length < requiredSignatures) {
      errors.push(`Insufficient signatures. Required: ${requiredSignatures}, Provided: ${signatures.length}`);
    }

    // Check for duplicate signatures
    const uniqueSignatures = new Set(signatures);
    if (uniqueSignatures.size !== signatures.length) {
      errors.push('Duplicate signatures detected');
    }

    // Validate signature format
    for (const signature of signatures) {
      if (!/^0x[a-fA-F0-9]{130}$/.test(signature)) {
        errors.push('Invalid signature format');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Transaction confirmation helper
export class TransactionConfirmation {
  private static readonly CONFIRMATION_TIMEOUT = 300000; // 5 minutes

  static async waitForConfirmation(
    txHash: string,
    provider: ethers.Provider,
    requiredConfirmations: number = 1
  ): Promise<ethers.TransactionReceipt> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Transaction confirmation timeout'));
      }, this.CONFIRMATION_TIMEOUT);

      provider.once(txHash, (receipt) => {
        clearTimeout(timeout);
        if (receipt.confirmations >= requiredConfirmations) {
          resolve(receipt);
        } else {
          reject(new Error('Insufficient confirmations'));
        }
      });
    });
  }

  static async confirmTransaction(
    tx: ethers.TransactionRequest,
    signer: ethers.Signer,
    confirmations: number = 1
  ): Promise<ethers.TransactionReceipt> {
    // Validate transaction before sending
    const validation = Web3Security.validateTransaction(tx);
    if (!validation.isValid) {
      throw new Error(`Transaction validation failed: ${validation.errors.join(', ')}`);
    }

    // Calculate safe gas limit
    const gasLimit = await Web3Security.calculateSafeGasLimit(tx, signer.provider!);
    tx.gasLimit = gasLimit;

    // Send transaction
    const txResponse = await signer.sendTransaction(tx);
    
    // Wait for confirmation
    return this.waitForConfirmation(txResponse.hash, signer.provider!, confirmations);
  }
}

export default {
  Web3Security,
  TransactionConfirmation
};
