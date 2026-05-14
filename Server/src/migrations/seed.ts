/**
 * Seed Script: Populate the unified 'users' collection from existing admins and citizens.
 * Run with: npx ts-node --transpile-only src/migrations/seed.ts
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

import { UserModel } from "../models/user.model";
import { CitizenModel } from "../models/citizen.model";
import { AdminModel } from "../models/admin.model";
import { DepartmentModel } from "../models/department.model";

async function seed() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error("DATABASE_URL not set in .env");
    process.exit(1);
  }

  await mongoose.connect(DATABASE_URL);
  console.log("Connected to MongoDB");

  let created = 0;
  let skipped = 0;

  // Seed citizens
  const citizens = await CitizenModel.find({});
  for (const citizen of citizens) {
    if (!citizen.phonenumber) {
      console.log(`⚠️  Skipping citizen ${citizen.fullName} — no phone number`);
      skipped++;
      continue;
    }
    const existing = await UserModel.findOne({ phonenumber: citizen.phonenumber });
    if (existing) {
      console.log(`⏭️  Citizen ${citizen.phonenumber} already exists in users`);
      skipped++;
      continue;
    }
    await UserModel.create({
      phonenumber: citizen.phonenumber,
      role: "citizen",
      roleRefId: citizen._id,
    });
    console.log(`✅ Created user entry for citizen: ${citizen.fullName} (${citizen.phonenumber})`);
    created++;
  }

  // Seed admins
  const admins = await AdminModel.find({});
  for (const admin of admins) {
    if (!admin.phonenumber) {
      console.log(`⚠️  Skipping admin ${admin.fullName} — no phone number`);
      skipped++;
      continue;
    }
    const existing = await UserModel.findOne({ phonenumber: admin.phonenumber });
    if (existing) {
      console.log(`⏭️  Admin ${admin.phonenumber} already exists in users`);
      skipped++;
      continue;
    }
    await UserModel.create({
      phonenumber: admin.phonenumber,
      role: "admin",
      roleRefId: admin._id,
    });
    console.log(`✅ Created user entry for admin: ${admin.fullName} (${admin.phonenumber})`);
    created++;
  }

  // Seed department managers
  const departments = await DepartmentModel.find({});
  for (const dept of departments) {
    if (!dept.phonenumber) {
      console.log(`⚠️  Skipping dept manager ${dept.fullName} — no phone number`);
      skipped++;
      continue;
    }
    const existing = await UserModel.findOne({ phonenumber: dept.phonenumber });
    if (existing) {
      console.log(`⏭️  Dept manager ${dept.phonenumber} already exists in users`);
      skipped++;
      continue;
    }
    await UserModel.create({
      phonenumber: dept.phonenumber,
      role: "department",
      roleRefId: dept._id,
    });
    console.log(`✅ Created user entry for dept manager: ${dept.fullName} (${dept.phonenumber})`);
    created++;
  }

  console.log(`\n🎉 Seed complete: ${created} created, ${skipped} skipped`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
