import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";
import { ARCJET_KEY } from "../constants";

const aj = arcjet({
  key: ARCJET_KEY,
  rules: [
    // Shield protects your app from common attacks such as SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        "CATEGORY:PREVIEW", // Link previews such as Slack, Discord
      ],
    }),
  ],
});

export default aj;
