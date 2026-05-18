import mongoose from "mongoose";
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL || "";

async function dropTitleIndex() {
  try {
    await mongoose.connect(DATABASE_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    const db = mongoose.connection.db;
    if (!db) {
      console.error("Database connection failed");
      process.exit(1);
    }

    const issuesCollection = db.collection("issues");

    // List all indexes
    const indexes = await issuesCollection.listIndexes().toArray();
    console.log("Current indexes:", indexes.map(idx => idx.name));

    // Drop title_1 index if it exists
    try {
      await issuesCollection.dropIndex("title_1");
      console.log("✅ Successfully dropped 'title_1' unique index");
    } catch (err: any) {
      if (err.code === 27) {
        console.log("ℹ️  Index 'title_1' does not exist (already dropped or never created)");
      } else {
        throw err;
      }
    }

    // Verify indexes after drop
    const indexesAfter = await issuesCollection.listIndexes().toArray();
    console.log("Indexes after cleanup:", indexesAfter.map(idx => idx.name));

    await mongoose.connection.close();
    console.log("✅ Migration complete");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

dropTitleIndex();
