/**
 * Seed Script: Clear all data and populate the database with mock data
 * Run with: npx ts-node --transpile-only src/migrations/seed.ts
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

// Force Node to use Google's Public DNS to bypass ISP SRV resolution issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { UserModel } from "../models/user.model";
import { CitizenModel } from "../models/citizen.model";
import { AdminModel } from "../models/admin.model";
import { DepartmentModel } from "../models/department.model";
import { IssueModel } from "../models/issue.model";

async function seed() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL not set in .env");
    process.exit(1);
  }

  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(DATABASE_URL);
    console.log("✅ Connected to MongoDB\n");

    // Clear all collections
    console.log("🗑️  Clearing all existing data...");
    await Promise.all([
      UserModel.deleteMany({}),
      CitizenModel.deleteMany({}),
      AdminModel.deleteMany({}),
      DepartmentModel.deleteMany({}),
      IssueModel.deleteMany({}),
    ]);
    console.log("✅ All data cleared\n");

    // Create Citizens
    console.log("👥 Creating citizens...");
    const citizens = await CitizenModel.create([
      {
        fullName: "John Doe",
        email: "john@example.com",
        phonenumber: "8001234567",
      },
      {
        fullName: "Jane Smith",
        email: "jane@example.com",
        phonenumber: "8001234568",
      },
      {
        fullName: "Robert Johnson",
        email: "robert@example.com",
        phonenumber: "8001234569",
      },
      {
        fullName: "Emily Wilson",
        email: "emily@example.com",
        phonenumber: "8001234570",
      },
      {
        fullName: "Michael Brown",
        email: "michael@example.com",
        phonenumber: "8001234571",
      },
    ]);
    console.log(`✅ Created ${citizens.length} citizens\n`);

    // Create Admins
    console.log("👨‍💼 Creating admins...");
    const admins = await AdminModel.create([
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
    const departments = await DepartmentModel.create([
      {
        fullName: "Raj Kumar",
        phonenumber: "1001234567",
        designation: "Department Manager",
        employeeId: "DEPT001",
        place: "North Zone",
      },
      {
        fullName: "Priya Singh",
        phonenumber: "1001234568",
        designation: "Department Manager",
        employeeId: "DEPT002",
        place: "South Zone",
      },
      {
        fullName: "Amit Patel",
        phonenumber: "1001234569",
        designation: "Department Manager",
        employeeId: "DEPT003",
        place: "Central Area",
      },
      {
        fullName: "Neha Desai",
        phonenumber: "1001234570",
        designation: "Department Manager",
        employeeId: "DEPT004",
        place: "East Zone",
      },
      {
        fullName: "Vikram Reddy",
        phonenumber: "1001234571",
        designation: "Department Manager",
        employeeId: "DEPT005",
        place: "West Zone",
      },
    ]);
    console.log(`✅ Created ${departments.length} departments\n`);

    // Create Issues
    console.log("🚨 Creating issues...");
    const issueTypes = [
      "Road Infrastructure",
      "Waste Management",
      "Environmental Issues",
      "Utilities & Infrastructure",
      "Public Safety",
    ];
    const statuses = ["Pending", "In Progress", "Resolved", "Rejected"];
    const locations = [
      { address: "Main Street Downtown", latitude: 40.7128, longitude: -74.006 },
      { address: "Central Park Area", latitude: 40.7829, longitude: -73.9654 },
      { address: "Brooklyn Bridge Plaza", latitude: 40.7061, longitude: -73.9969 },
      { address: "Times Square", latitude: 40.758, longitude: -73.9855 },
      { address: "Fifth Avenue", latitude: 40.7489, longitude: -73.968 },
      { address: "Grand Central", latitude: 40.7527, longitude: -73.9772 },
      { address: "Madison Square Garden", latitude: 40.7505, longitude: -73.9934 },
      { address: "Wall Street", latitude: 40.7074, longitude: -74.0113 },
    ];

    const issues = [];
    for (let i = 0; i < 20; i++) {
      const randomCitizen = citizens[Math.floor(Math.random() * citizens.length)];
      const randomAdmin = Math.random() > 0.5 ? admins[Math.floor(Math.random() * admins.length)] : null;
      const randomType = issueTypes[Math.floor(Math.random() * issueTypes.length)];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      // Get random reporters (other citizens)
      const reporterCitizens = citizens
        .filter((c) => c._id.toString() !== randomCitizen._id.toString())
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3));

      const issue = await IssueModel.create({
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
        handledBy: randomAdmin?._id || null,
        upvotes: Math.floor(Math.random() * 20),
        upvotedBy: reporterCitizens.map((c) => c._id.toString()).slice(0, Math.floor(Math.random() * 5)),
      });
      issues.push(issue);
    }
    console.log(`✅ Created ${issues.length} issues\n`);

    // Create User Authentication Entries
    console.log("🔐 Creating user authentication entries...");
    const userEntries = [];

    // Citizens
    for (const citizen of citizens) {
      userEntries.push({
        phonenumber: citizen.phonenumber,
        role: "citizen",
        roleRefId: citizen._id,
      });
    }

    // Admins
    for (const admin of admins) {
      userEntries.push({
        phonenumber: admin.phonenumber,
        employeeId: admin.employeeId,
        role: "admin",
        roleRefId: admin._id,
      });
    }

    // Department Managers
    for (const dept of departments) {
      userEntries.push({
        phonenumber: dept.phonenumber,
        employeeId: dept.employeeId,
        role: "department",
        roleRefId: dept._id,
      });
    }

    await UserModel.create(userEntries);
    console.log(`✅ Created ${userEntries.length} user authentication entries\n`);

    console.log("═".repeat(50));
    console.log("🎉 SEED COMPLETE!");
    console.log("═".repeat(50) + "\n");
    console.log("📊 Summary:");
    console.log(`   Citizens: ${citizens.length}`);
    console.log(`   Admins: ${admins.length}`);
    console.log(`   Departments: ${departments.length}`);
    console.log(`   Issues: ${issues.length}`);
    console.log(`   User Auth Entries: ${userEntries.length}\n`);

    console.log("📝 Test Credentials:");
    console.log("─".repeat(50));
    console.log("👤 Citizen Login:");
    console.log("   Phone: 8001234567\n");
    console.log("👨‍💼 Admin Login:");
    console.log("   Phone: 9001234567\n");
    console.log("🏢 Department Manager Login (Electricity Dept):");
    console.log("   Phone: 1001234567\n");
    console.log("─".repeat(50));
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

seed();
