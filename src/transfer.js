const { ethers } = require('ethers');

const USDC_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

async function sendUSDC(privateKey, toAddress, amountUSD, rpcUrl, usdcContractAddress) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const usdc = new ethers.Contract(usdcContractAddress, USDC_ABI, wallet);

  const decimals = await usdc.decimals();
  const amount = ethers.parseUnits(amountUSD.toString(), decimals);

  const balance = await usdc.balanceOf(wallet.address);
  if (balance < amount) {
    const have = ethers.formatUnits(balance, decimals);
    throw new Error(`Insufficient USDC: have $${have}, need $${amountUSD}`);
  }

  // Also check native token balance for gas
  const nativeBalance = await provider.getBalance(wallet.address);
  if (nativeBalance === 0n) {
    throw new Error('No native token (ETH/MATIC) for gas fees.');
  }

  const tx = await usdc.transfer(toAddress, amount);
  console.log(`  TX hash: ${tx.hash}`);
  console.log('  Waiting for confirmation...');

  const receipt = await tx.wait();
  console.log(`  Confirmed in block ${receipt.blockNumber}`);

  return tx.hash;
}

module.exports = { sendUSDC };
