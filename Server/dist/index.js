"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const dns_1 = __importDefault(require("dns"));
const database_1 = require("./config/database");
const app_1 = __importDefault(require("./app"));
dotenv_1.default.config({ path: "./.env" });
// Force Node to use Google's Public DNS to bypass ISP SRV resolution issues
dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
const PORT = process.env.PORT || 3000;
app_1.default.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
(0, database_1.connectDB)();
