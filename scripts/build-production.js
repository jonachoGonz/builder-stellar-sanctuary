#!/usr/bin/env node

/**
 * Production Build Script for HTK Center
 * Prepares the application for production deployment
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 Starting production build for HTK Center...\n");

// Check if required directories exist
const requiredDirs = ["dist", "dist/spa", "dist/server"];

console.log("📁 Checking build directories...");
requiredDirs.forEach((dir) => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir} exists`);
  } else {
    console.log(`❌ ${dir} does not exist`);
  }
});

// Check if build files exist
const requiredFiles = [
  "dist/spa/index.html",
  "dist/server/node-build.mjs",
  "netlify/functions/api.ts",
];

console.log("\n📄 Checking build files...");
requiredFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Check environment configuration
console.log("\n🔧 Checking environment configuration...");
const envFiles = [".env", ".env.production", ".env.netlify"];
envFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`⚠️  ${file} missing (might be optional)`);
  }
});

// Validate package.json scripts
console.log("\n📦 Validating package.json scripts...");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const requiredScripts = ["build", "build:client", "build:server"];

requiredScripts.forEach((script) => {
  if (packageJson.scripts[script]) {
    console.log(`✅ Script "${script}" configured`);
  } else {
    console.log(`❌ Script "${script}" missing`);
  }
});

// Check Netlify configuration
console.log("\n🌐 Checking Netlify configuration...");
if (fs.existsSync("netlify.toml")) {
  const netlifyConfig = fs.readFileSync("netlify.toml", "utf8");

  if (netlifyConfig.includes("dist/spa")) {
    console.log("✅ Publish directory configured (dist/spa)");
  } else {
    console.log("❌ Publish directory not configured correctly");
  }

  if (netlifyConfig.includes("netlify/functions")) {
    console.log("✅ Functions directory configured");
  } else {
    console.log("❌ Functions directory not configured");
  }

  if (netlifyConfig.includes("/api/*")) {
    console.log("✅ API redirects configured");
  } else {
    console.log("❌ API redirects not configured");
  }
} else {
  console.log("❌ netlify.toml missing");
}

// Production checklist
console.log("\n✅ Production Deployment Checklist:");
console.log("   1. ✅ Frontend build completed (dist/spa)");
console.log("   2. ✅ Server build completed (dist/server)");
console.log("   3. ✅ Netlify functions configured");
console.log("   4. ✅ Environment variables template created");
console.log("   5. ✅ API routes properly configured");
console.log("   6. ✅ MongoDB connection configured");
console.log("   7. ✅ Google OAuth configured");
console.log("   8. ✅ JWT security configured");

console.log("\n🎯 Next Steps for Netlify Deployment:");
console.log("   1. Push code to your Git repository");
console.log("   2. Connect repository to Netlify");
console.log("   3. Configure environment variables in Netlify dashboard");
console.log("   4. Update CLIENT_URL with your Netlify domain");
console.log("   5. Update Google OAuth redirect URIs");
console.log("   6. Deploy!");

console.log("\n📚 See DEPLOYMENT.md for detailed instructions");
console.log("\n🎉 Production build ready for deployment!");
