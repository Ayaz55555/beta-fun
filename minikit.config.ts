const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjIzNjgxNSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDkzQTgyMzRhZUZCMTY2NjY5OTE4NzQyNDg4YTU3YzExZThjNzc2MjEifQ",
    payload: "eyJkb21haW4iOiJiZXRhLWZ1bi52ZXJjZWwuYXBwIn0",
    signature: "R6jZ1AARdN5aYI8rP7IAyUegWxgo+h6SaKVxIch7FN1O7fv033EMM4QJlTGjvknaj/bQetmHqbrpdYyrNJM0nBs="
  },
  miniapp: {
    version: "1",
    name: "beta fun",
    subtitle: "Your AI Ad Companion",
    description: "Ads",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/blue-icon.png`,
    splashImageUrl: `${ROOT_URL}/blue-hero.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["marketing", "ads", "quickstart", "waitlist"],
    heroImageUrl: `${ROOT_URL}/hero1.png`,
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
  frame: {
    version: "1",
    name: "Example Frame",
    iconUrl: "https://beta-fun.vercel.app/icon.png",
    homeUrl: "https://beta-fun.vercel.app",
    imageUrl: "https://beta-fun.vercel.app/image.png",
    buttonTitle: "Check this out",
    splashImageUrl: "https://beta-fun.vercel.app/splash.png",
    splashBackgroundColor: "#eeccff",
    webhookUrl: "https://beta-fun.vercel.app/api/webhook"
  },
} as const;

