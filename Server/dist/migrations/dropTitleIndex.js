"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const DATABASE_URL = process.env.DATABASE_URL || "";
function dropTitleIndex() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(DATABASE_URL, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            const db = mongoose_1.default.connection.db;
            if (!db) {
                console.error("Database connection failed");
                process.exit(1);
            }
            const issuesCollection = db.collection("issues");
            // List all indexes
            const indexes = yield issuesCollection.listIndexes().toArray();
            console.log("Current indexes:", indexes.map(idx => idx.name));
            // Drop title_1 index if it exists
            try {
                yield issuesCollection.dropIndex("title_1");
                console.log("✅ Successfully dropped 'title_1' unique index");
            }
            catch (err) {
                if (err.code === 27) {
                    console.log("ℹ️  Index 'title_1' does not exist (already dropped or never created)");
                }
                else {
                    throw err;
                }
            }
            // Verify indexes after drop
            const indexesAfter = yield issuesCollection.listIndexes().toArray();
            console.log("Indexes after cleanup:", indexesAfter.map(idx => idx.name));
            yield mongoose_1.default.connection.close();
            console.log("✅ Migration complete");
            process.exit(0);
        }
        catch (err) {
            console.error("Migration error:", err);
            process.exit(1);
        }
    });
}
dropTitleIndex();
