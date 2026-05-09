const { ethers } = require('ethers');

async function sendETH(privateKey, toAddress, amountEth, rpcUrl) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const amount = ethers.parseEther(amountEth.toString());
  const balance = await provider.getBalance(wallet.address);

  // Estimate gas cost as a safety buffer before sending
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.maxFeePerGas ?? feeData.gasPrice ?? ethers.parseUnits('50', 'gwei');
  const estimatedGas = 21000n * gasPrice;

  if (balance < amount + estimatedGas) {
    const have = ethers.formatEther(balance);
    const need = ethers.formatEther(amount + estimatedGas);
    throw new Error(`Insufficient balance: have ${have} ETH, need ~${need} ETH (transfer + gas)`);
  }

  const tx = await wallet.sendTransaction({
    to: toAddress,
    value: amount,
  });

  console.log(`  TX hash : ${tx.hash}`);
  console.log('  Waiting for confirmation...');

  const receipt = await tx.wait();
  console.log(`  Confirmed in block ${receipt.blockNumber}`);

  return tx.hash;
}

module.exports = { sendETH };
