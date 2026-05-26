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
/**
 * Seed Script: Clear all data and populate the database with mock data
 * Run with: npx ts-node --transpile-only src/migrations/seed.ts
 */
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const dns_1 = __importDefault(require("dns"));
dotenv_1.default.config();
// Force Node to use Google's Public DNS to bypass ISP SRV resolution issues
dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
const user_model_1 = require("../models/user.model");
const citizen_model_1 = require("../models/citizen.model");
const admin_model_1 = require("../models/admin.model");
const department_model_1 = require("../models/department.model");
const issue_model_1 = require("../models/issue.model");
const worker_model_1 = require("../models/worker.model");
const issueStatusHistory_model_1 = require("../models/issueStatusHistory.model");
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        const DATABASE_URL = process.env.DATABASE_URL;
        if (!DATABASE_URL) {
            console.error("❌ DATABASE_URL not set in .env");
            process.exit(1);
        }
        try {
            console.log("🔗 Connecting to MongoDB...");
            yield mongoose_1.default.connect(DATABASE_URL);
            console.log("✅ Connected to MongoDB\n");
            // Clear all collections
            console.log("🗑️  Clearing all existing data...");
            yield Promise.all([
                user_model_1.UserModel.deleteMany({}),
                citizen_model_1.CitizenModel.deleteMany({}),
                admin_model_1.AdminModel.deleteMany({}),
                department_model_1.DepartmentModel.deleteMany({}),
                issue_model_1.IssueModel.deleteMany({}),
                worker_model_1.WorkerModel.deleteMany({}),
                issueStatusHistory_model_1.IssueStatusHistoryModel.deleteMany({}),
            ]);
            console.log("✅ All data cleared\n");
            // Create Citizens
            console.log("👥 Creating citizens...");
            const citizens = yield citizen_model_1.CitizenModel.create([
                { fullName: "John Doe", email: "john@example.com", phonenumber: "8001234567" },
                { fullName: "Jane Smith", email: "jane@example.com", phonenumber: "8001234568" },
                { fullName: "Robert Johnson", email: "robert@example.com", phonenumber: "8001234569" },
                { fullName: "Emily Wilson", email: "emily@example.com", phonenumber: "8001234570" },
                { fullName: "Michael Brown", email: "michael@example.com", phonenumber: "8001234571" },
            ]);
            console.log(`✅ Created ${citizens.length} citizens\n`);
            // Create Admins
            console.log("👨‍💼 Creating admins...");
            const admins = yield admin_model_1.AdminModel.create([
                {
                    fullName: "Admin User",
                    email: "admin@civic.gov",
                    phonenumber: "9001234567",
                    department: "Administration",
                    adminAccessCode: 1001,
                    employeeId: "ADM001",
                },
                {
                    fullName: "Super Admin",
                    email: "superadmin@civic.gov",
                    phonenumber: "9001234568",
                    department: "Administration",
                    adminAccessCode: 1002,
                    employeeId: "ADM002",
                },
            ]);
            console.log(`✅ Created ${admins.length} admins\n`);
            // Create Departments
            console.log("🏢 Creating departments...");
            const departments = yield department_model_1.DepartmentModel.create([
                { fullName: "Raj Kumar", phonenumber: "1001234567", designation: "Department Manager", employeeId: "DEPT001", place: "North Zone" },
                { fullName: "Priya Singh", phonenumber: "1001234568", designation: "Department Manager", employeeId: "DEPT002", place: "South Zone" },
                { fullName: "Amit Patel", phonenumber: "1001234569", designation: "Department Manager", employeeId: "DEPT003", place: "Central Area" },
                { fullName: "Neha Desai", phonenumber: "1001234570", designation: "Department Manager", employeeId: "DEPT004", place: "East Zone" },
                { fullName: "Vikram Reddy", phonenumber: "1001234571", designation: "Department Manager", employeeId: "DEPT005", place: "West Zone" },
            ]);
            console.log(`✅ Created ${departments.length} departments\n`);
            // Create Workers
            console.log("👷 Creating 20 workers...");
            const workerNames = [
                "Bob Kumar", "Alice Verma", "Charlie Nair", "Divya Rao", "Dave Thomas",
                "Eve Reddy", "Farhan Ali", "Grace Hopper", "Hari Prasad", "Indira Sen",
                "Jack Sparrow", "Kiran Shah", "Lalitha Murthy", "Manoj Kumar", "Nisha Patel",
                "Omar Farooq", "Pooja Hegde", "Quincy Jones", "Rahul Sharma", "Sita Ram"
            ];
            const specializationsPool = [
                ["Road Infrastructure", "General"],
                ["Waste Management"],
                ["Environmental Issues"],
                ["Utilities & Infrastructure"],
                ["Public Safety"],
                ["Public Safety", "General"],
                ["Road Infrastructure", "Waste Management"],
                ["Environmental Issues", "General"],
            ];
            const workerData = workerNames.map((name, idx) => {
                const dept = departments[idx % departments.length];
                const phoneNum = String(2001234567 + idx);
                const email = `${name.toLowerCase().replace(" ", ".")}@civic.gov`;
                const empId = `WRK${String(idx + 1).padStart(3, "0")}`;
                const specs = specializationsPool[idx % specializationsPool.length];
                return {
                    fullName: name,
                    phonenumber: phoneNum,
                    email: email,
                    employeeId: empId,
                    departmentId: dept._id,
                    zone: dept.place,
                    specialization: specs,
                    isActive: true,
                };
            });
            const workers = yield worker_model_1.WorkerModel.create(workerData);
            console.log(`✅ Created ${workers.length} workers\n`);
            // Create Issues and IssueStatusHistory
            console.log("🚨 Creating issues and status history...");
            const issueTypes = [
                "Road Infrastructure",
                "Waste Management",
                "Environmental Issues",
                "Utilities & Infrastructure",
                "Public Safety",
            ];
            const statuses = ["Pending", "In Progress", "Resolved", "Rejected"];
            const locations = [
                { address: "North Zone - Market Road", latitude: 40.7128, longitude: -74.006, zone: "North Zone" },
                { address: "North Zone - Bus Stand", latitude: 40.7191, longitude: -74.0011, zone: "North Zone" },
                { address: "South Zone - Lake Park", latitude: 40.7829, longitude: -73.9654, zone: "South Zone" },
                { address: "South Zone - Ward Office", latitude: 40.7752, longitude: -73.9718, zone: "South Zone" },
                { address: "Central Area - Main Plaza", latitude: 40.7061, longitude: -73.9969, zone: "Central Area" },
                { address: "Central Area - Civic Hall", latitude: 40.7114, longitude: -73.9912, zone: "Central Area" },
                { address: "East Zone - Station Road", latitude: 40.758, longitude: -73.9855, zone: "East Zone" },
                { address: "West Zone - Avenue 5", latitude: 40.7489, longitude: -73.968, zone: "West Zone" },
            ];
            const issues = [];
            const historyEntries = [];
            for (let i = 0; i < 30; i++) {
                const randomCitizen = citizens[Math.floor(Math.random() * citizens.length)];
                const randomAdmin = admins[Math.floor(Math.random() * admins.length)];
                const randomLocation = locations[i % locations.length];
                const randomType = issueTypes[i % issueTypes.length];
                const randomStatus = statuses[i % statuses.length];
                const reporterCitizens = citizens
                    .filter((c) => c._id.toString() !== randomCitizen._id.toString())
                    .sort(() => Math.random() - 0.5)
                    .slice(0, Math.floor(Math.random() * 3));
                const isResolved = randomStatus === "Resolved";
                const isInProgress = randomStatus === "In Progress" || isResolved;
                const costAmount = isResolved ? Math.floor(Math.random() * 5000) + 100 : (isInProgress ? Math.floor(Math.random() * 1000) + 50 : 0);
                const issue = yield issue_model_1.IssueModel.create({
                    citizenId: randomCitizen._id,
                    reporters: reporterCitizens.map((c) => c._id),
                    issueType: randomType,
                    title: `${randomType} at ${randomLocation.address}`,
                    description: `This is a critical issue that needs immediate attention. The ${randomType.toLowerCase()} at ${randomLocation.address} is affecting public safety and needs to be addressed urgently.`,
                    status: randomStatus,
                    location: {
                        address: randomLocation.address,
                        latitude: randomLocation.latitude + (Math.random() - 0.5) * 0.01,
                        longitude: randomLocation.longitude + (Math.random() - 0.5) * 0.01,
                    },
                    handledBy: randomAdmin._id,
                    upvotes: Math.floor(Math.random() * 20),
                    upvotedBy: reporterCitizens.map((c) => c._id.toString()).slice(0, Math.floor(Math.random() * 5)),
                    costAmount: costAmount,
                    departmentAssigned: randomLocation.zone,
                    resolvedAt: isResolved ? new Date() : undefined,
                });
                issues.push(issue);
                // Create history entries
                // 1. Always create a "Pending" history entry when reported
                const reportDate = new Date();
                reportDate.setDate(reportDate.getDate() - 10);
                historyEntries.push({
                    issueID: issue._id,
                    status: "Pending",
                    handledBy: randomAdmin._id,
                    changedBy: randomAdmin._id,
                    costAdded: 0,
                    changedAt: reportDate,
                });
                // 2. If in progress, create an in progress entry
                if (isInProgress) {
                    const ipDate = new Date(reportDate);
                    ipDate.setDate(ipDate.getDate() + 2);
                    historyEntries.push({
                        issueID: issue._id,
                        status: "In Progress",
                        handledBy: randomAdmin._id,
                        changedBy: randomAdmin._id,
                        costAdded: Math.floor(costAmount * 0.3), // 30% of cost at In Progress
                        changedAt: ipDate,
                    });
                }
                // 3. If resolved, create resolved entry
                if (isResolved) {
                    const resDate = new Date();
                    historyEntries.push({
                        issueID: issue._id,
                        status: "Resolved",
                        handledBy: randomAdmin._id,
                        changedBy: randomAdmin._id,
                        costAdded: Math.floor(costAmount * 0.7), // 70% of cost at Resolved
                        changedAt: resDate,
                    });
                }
                // 4. If rejected
                if (randomStatus === "Rejected") {
                    const rejDate = new Date(reportDate);
                    rejDate.setDate(rejDate.getDate() + 1);
                    historyEntries.push({
                        issueID: issue._id,
                        status: "Rejected",
                        handledBy: randomAdmin._id,
                        changedBy: randomAdmin._id,
                        costAdded: 0,
                        changedAt: rejDate,
                    });
                }
            }
            for (const worker of workers) {
                const workerIssues = issues
                    .filter((issue) => issue.departmentAssigned === worker.zone)
                    .slice(0, 3)
                    .map((issue) => issue._id);
                yield worker_model_1.WorkerModel.findByIdAndUpdate(worker._id, {
                    assignedIssues: workerIssues,
                });
            }
            yield issueStatusHistory_model_1.IssueStatusHistoryModel.insertMany(historyEntries);
            console.log(`✅ Created ${issues.length} issues and ${historyEntries.length} history records\n`);
            // Create User Authentication Entries
            console.log("🔐 Creating user authentication entries...");
            const userEntries = [];
            for (const citizen of citizens)
                userEntries.push({ phonenumber: citizen.phonenumber, role: "citizen", roleRefId: citizen._id });
            for (const admin of admins)
                userEntries.push({ phonenumber: admin.phonenumber, employeeId: admin.employeeId, role: "admin", roleRefId: admin._id });
            for (const dept of departments)
                userEntries.push({ phonenumber: dept.phonenumber, employeeId: dept.employeeId, role: "department", roleRefId: dept._id });
            yield user_model_1.UserModel.create(userEntries);
            console.log(`✅ Created ${userEntries.length} user authentication entries\n`);
            console.log("═".repeat(50));
            console.log("🎉 SEED COMPLETE!");
            console.log("═".repeat(50) + "\n");
            console.log("📊 Summary:");
            console.log(`   Citizens: ${citizens.length}`);
            console.log(`   Admins: ${admins.length}`);
            console.log(`   Departments: ${departments.length}`);
            console.log(`   Workers: ${workers.length}`);
            console.log(`   Issues: ${issues.length}`);
            console.log(`   History Records: ${historyEntries.length}`);
            console.log(`   User Auth Entries: ${userEntries.length}\n`);
            console.log("📝 Test Credentials:");
            console.log("─".repeat(50));
            console.log("👤 Citizen Login:");
            console.log("   Phone: 8001234567\n");
            console.log("👨‍💼 Admin Login:");
            console.log("   Phone: 9001234567\n");
            console.log("🏢 Department Manager Login (North Zone):");
            console.log("   Phone: 1001234567\n");
            console.log("─".repeat(50));
        }
        catch (error) {
            console.error("❌ Seed error:", error);
            process.exit(1);
        }
        finally {
            yield mongoose_1.default.disconnect();
            console.log("✅ Disconnected from MongoDB");
        }
    });
}
seed();
