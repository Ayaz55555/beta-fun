"use client";
import { useState, useEffect } from "react";
import { useQuickAuth, useMiniKit } from "@coinbase/onchainkit/minikit";
import { useRouter } from "next/navigation";
import { minikitConfig } from "../minikit.config";
import styles from "./page.module.css";

interface AuthResponse {
  success: boolean;
  user?: {
    fid: number; // FID is the unique identifier for the user
    issuedAt?: number;
    expiresAt?: number;
  };
  message?: string; // Error messages come as 'message' not 'error'
}


export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [claimCount, setClaimCount] = useState(0);
  const [lastClaimDate, setLastClaimDate] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const router = useRouter();

  // The useQuickAuth hook will verify the user's signature and return the user's FID. You can update
  // this to meet your needs. See the /app/api/auth/route.ts file for more details.
  // Note: If you don't need to verify the user's identity, you can get their FID and other user data
  // via `context.user.fid`.
  const { data: authData, isLoading: isAuthLoading, error: authError } = useQuickAuth<AuthResponse>(
    "/api/auth",
    { method: "GET" }
  );

  // Load user's claim data from Redis/API
  const loadUserClaims = async () => {
    if (!authData?.success || !authData.user) return;

    try {
      const response = await fetch(`/api/claims?fid=${authData.user.fid}`);
      if (response.ok) {
        const data = await response.json();
        setClaimCount(data.claimCount || 0);
        setLastClaimDate(data.lastClaimDate || "");
      }
    } catch (_error) {
      console.error("Failed to load claims:", _error);
    }
  };

  // Check wallet connection
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (authData?.success && context?.user) {
        // Check if wallet is connected
        const walletAddress = (context.user as { address?: string; custodyAddress?: string })?.address ||
                            (context.user as { address?: string; custodyAddress?: string })?.custodyAddress;
        setIsWalletConnected(!!walletAddress);
      }
    };

    checkWalletConnection();
  }, [authData, context]);

  // Initialize the miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Load claims when auth data is available
  useEffect(() => {
    if (authData?.success) {
      loadUserClaims();
    }
  }, [authData]);
 
  


  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      // Check if wallet is already connected via context
      const walletAddress = (context?.user as { address?: string; custodyAddress?: string })?.address ||
                          (context?.user as { address?: string; custodyAddress?: string })?.custodyAddress;
      if (walletAddress) {
        setIsWalletConnected(true);
        setError("");
      } else {
        setError("Please connect your wallet through the Farcaster client");
      }
    } catch (error) {
      setError("Failed to connect wallet");
    }
  };

  // Handle token claim
  const handleClaimReward = async () => {
    if (!authData?.success || !isWalletConnected || isClaiming) return;

    // Check if user can claim (max 2 per day)
    const today = new Date().toDateString();
    if (lastClaimDate === today && claimCount >= 2) {
      setError("You've already claimed your daily rewards (max 2 per day)");
      return;
    }

    setIsClaiming(true);
    setError("");

    try {
      const walletAddress = (context?.user as { address?: string; custodyAddress?: string })?.address ||
                          (context?.user as { address?: string; custodyAddress?: string })?.custodyAddress;

      if (!walletAddress) {
        setError("Wallet not connected");
        return;
      }

      // Claim reward from your wallet to user's wallet
      if (!authData.user) return;

      const claimResponse = await fetch('/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fid: authData.user.fid,
          walletAddress: walletAddress,
          claimCount: claimCount + 1,
          lastClaimDate: today
        }),
      });

      if (claimResponse.ok) {
        const result = await claimResponse.json();
        setClaimCount(prev => prev + 1);
        setLastClaimDate(today);
        setError(`Successfully claimed 0.001 Talent tokens! Tx: ${result.hash}`);
      } else {
        setError("Failed to claim reward");
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      setError("An error occurred while claiming reward");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check authentication first
    if (isAuthLoading) {
      setError("Please wait while we verify your identity...");
      return;
    }

    if (authError || !authData?.success) {
      setError("Please authenticate to join the waitlist");
      return;
    }

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      // Save email to database/API with user FID
      console.log("Valid email submitted:", email);
      console.log("User authenticated:", authData.user);

      // Navigate to success page
      router.push("/success");
    } catch (error) {
      console.error("Error during registration:", error);
      setError("An error occurred during registration. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.closeButton} type="button">
        ✕
      </button>
      
      <div className={styles.content}>
        <div className={styles.waitlistForm}>
          <h1 className={styles.title}>{minikitConfig.miniapp.name.toUpperCase()}</h1>

           <p className={styles.subtitle}>
              Hey {context?.user?.displayName || "there"}, Join our community and get rewarded with 0.001 Talent tokens!<br />
             Experience the future of crypto.
           </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="email"
              placeholder="Your amazing email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.emailInput}
            />

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.joinButton}>
              JOIN BETA FUN
            </button>
          </form>

          {/* Wallet Connection Section */}
          {authData?.success && (
            <div className={styles.walletSection}>
              <h2>Connect Wallet & Claim Rewards</h2>
              <p>Get 0.001 Talent tokens daily (max 2 claims per day)</p>

              {!isWalletConnected ? (
                <button onClick={handleConnectWallet} className={styles.walletButton}>
                  🔗 Connect Wallet
                </button>
              ) : (
                <div className={styles.claimSection}>
                  <p className={styles.walletStatus}>✅ Wallet Connected</p>
                  <p className={styles.claimInfo}>
                    Today's claims: {claimCount}/2
                    {lastClaimDate === new Date().toDateString() && claimCount >= 2 && (
                      <span className={styles.limitReached}> (Daily limit reached)</span>
                    )}
                  </p>
                  <button
                    onClick={handleClaimReward}
                    disabled={isClaiming || (lastClaimDate === new Date().toDateString() && claimCount >= 2)}
                    className={`${styles.claimButton} ${isClaiming ? styles.claiming : ''}`}
                  >
                    {isClaiming ? '⏳ Claiming...' : '🎁 Claim 0.001 Talent'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
