import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Simple in-memory storage (replace with Redis in production)
const userClaims = new Map<string, { claimCount: number; lastClaimDate: string }>();

export async function POST(request: NextRequest) {
  try {
    const { fid, walletAddress, claimCount, lastClaimDate } = await request.json();

    if (!fid || !walletAddress) {
      return NextResponse.json({ error: 'FID and wallet address are required' }, { status: 400 });
    }

    // Setup wallet client for Base mainnet
    const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
    const client = createWalletClient({
      account,
      chain: base,
      transport: http(),
    });

    // Talent token contract address (replace with actual contract)
    const talentTokenAddress = process.env.CONTRACT_ADDRESS as `0x${string}`;

    // ERC20 transfer function call for 0.001 Talent tokens (assuming 18 decimals)
    const amount = '1000000000000000'; // 0.001 * 10^18
    const paddedAddress = walletAddress.slice(2).padStart(64, '0');
    const paddedAmount = amount.padStart(64, '0');
    const transferData = {
      to: talentTokenAddress,
      data: `0xa9059cbb${paddedAddress}${paddedAmount}` as `0x${string}`, // transfer function
    };

    const hash = await client.sendTransaction(transferData);

    // Update user's claim data
    userClaims.set(fid, { claimCount, lastClaimDate });

    return NextResponse.json({ success: true, hash });

  } catch (error) {
    console.error('Claim error:', error);
    return NextResponse.json({ error: 'Failed to process claim' }, { status: 500 });
  }
}