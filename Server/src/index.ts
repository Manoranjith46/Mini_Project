import dotenv from "dotenv";
import dns from "dns";
import { connectDB } from "./config/database";
import app from "./app";

dotenv.config({ path: "./.env" });

// Force Node to use Google's Public DNS to bypass ISP SRV resolution issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    });

connectDB();
