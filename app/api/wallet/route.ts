import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Setup wallet client for Base mainnet
    const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
    const client = createWalletClient({
      account,
      chain: base,
      transport: http(),
    });

    // JO token contract address
    const joTokenAddress = process.env.CONTRACT_ADDRESS as `0x${string}`;

    // ERC20 transfer function call for 0.001 Talent tokens (assuming 18 decimals)
    const amount = '1000000000000000'; // 0.001 * 10^18
    const paddedAddress = address.slice(2).padStart(64, '0');
    const paddedAmount = amount.padStart(64, '0');
    const transferData = {
      to: joTokenAddress,
      data: `0xa9059cbb${paddedAddress}${paddedAmount}` as `0x${string}`, // 0.001 tokens
    };

    const hash = await client.sendTransaction(transferData);

    return NextResponse.json({ success: true, hash });

  } catch (error) {
    console.error('Wallet error:', error);
    return NextResponse.json({ error: 'Failed to send reward' }, { status: 500 });
  }
}