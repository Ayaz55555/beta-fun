"use client";
import { useState, useEffect } from "react";
import { useQuickAuth,useMiniKit } from "@coinbase/onchainkit/minikit";
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
  const router = useRouter();

  // Initialize the  miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);
 
  

  // If you need to verify the user's identity, you can use the useQuickAuth hook.
  // This hook will verify the user's signature and return the user's FID. You can update
  // this to meet your needs. See the /app/api/auth/route.ts file for more details.
  // Note: If you don't need to verify the user's identity, you can get their FID and other user data
  // via `context.user.fid`.
  // const { data, isLoading, error } = useQuickAuth<{
  //   userFid: string;
  // }>("/api/auth");

  const { data: authData, isLoading: isAuthLoading, error: authError } = useQuickAuth<AuthResponse>(
    "/api/auth",
    { method: "GET" }
  );

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
      // Save email to database/API with user FID and send JO token reward
      console.log("Valid email submitted:", email);
      console.log("User authenticated:", authData.user);

      // Get user wallet address (assuming it's available in context or auth data)
      const walletAddress = (context?.user as { address?: string; custodyAddress?: string })?.address || (context?.user as { address?: string; custodyAddress?: string })?.custodyAddress;

      if (walletAddress) {
        // Send JO token reward
        const rewardResponse = await fetch('/api/wallet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address: walletAddress }),
        });

        if (!rewardResponse.ok) {
          console.warn("Failed to send reward, but continuing with registration");
        }
      }

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
        </div>
      </div>
    </div>
  );
}
