const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");
const path = require("path");
const fs = require("fs");

// Load .env file
const envPath = path.join(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) {
    process.env[key.trim()] = rest.join("=").trim().replace(/^"|"$/g, "");
  }
}

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dataDir = path.join(__dirname, "../components/home/data");

const featuredMeals = require(path.join(dataDir, "featuredMeals.json"));
const moreMeals = require(path.join(dataDir, "moreMeals.json"));
const categories = require(path.join(dataDir, "categories.json"));

async function seedCollection(collectionName, data) {
  console.log(`\nSeeding "${collectionName}" (${data.length} docs)...`);
  for (const item of data) {
    const docRef = await addDoc(collection(db, collectionName), item);
    console.log(`  Added: ${item.name || item.category} (${docRef.id})`);
  }
}

async function seed() {
  console.log("Starting Firestore seed...\n");

  await seedCollection("meals", featuredMeals);
  await seedCollection("more", moreMeals);
  await seedCollection("categories", categories);

  console.log("\nDone! All collections seeded.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
