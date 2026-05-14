import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

import { UserModel } from "../models/user.model";
import { CitizenModel } from "../models/citizen.model";
import { AdminModel } from "../models/admin.model";
import { DepartmentModel } from "../models/department.model";

async function seedMockData() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error("DATABASE_URL not set in .env");
    process.exit(1);
  }

  await mongoose.connect(DATABASE_URL);
  console.log("Connected to MongoDB");

  // --- MOCK ADMINS ---
  const mockAdmins = [
    { fullName: "Super Admin", phonenumber: "1111111111", department: "central", adminAccessCode: 1001, employeeId: "ADM001" },
    { fullName: "City Admin", phonenumber: "2222222222", department: "zonal", adminAccessCode: 1002, employeeId: "ADM002" },
  ];

  for (const data of mockAdmins) {
    let admin = await AdminModel.findOne({ employeeId: data.employeeId });
    if (!admin) {
      admin = await AdminModel.create(data);
      console.log(`✅ Created Admin Profile: ${data.fullName}`);
    }
    await UserModel.findOneAndUpdate(
      { employeeId: data.employeeId },
      { phonenumber: data.phonenumber, role: "admin", roleRefId: admin._id, employeeId: data.employeeId },
      { upsert: true, new: true }
    );
    console.log(`🔑 Created User Login for Admin: ${data.employeeId} / ${data.phonenumber}`);
  }

  // --- MOCK DEPT MANAGERS ---
  const mockDepts = [
    { fullName: "John Electricity", phonenumber: "3333333333", department: "electricity", employeeId: "MGR001" },
    { fullName: "Jane Water", phonenumber: "4444444444", department: "water-supply", employeeId: "MGR002" },
  ];

  for (const data of mockDepts) {
    let mgr = await DepartmentModel.findOne({ employeeId: data.employeeId });
    if (!mgr) {
      mgr = await DepartmentModel.create(data);
      console.log(`✅ Created Dept Manager Profile: ${data.fullName}`);
    }
    await UserModel.findOneAndUpdate(
      { employeeId: data.employeeId },
      { phonenumber: data.phonenumber, role: "department", roleRefId: mgr._id, employeeId: data.employeeId },
      { upsert: true, new: true }
    );
    console.log(`🔑 Created User Login for Dept: ${data.employeeId} / ${data.phonenumber}`);
  }

  // --- MOCK CITIZEN ---
  const mockCitizen = { fullName: "Jane Citizen", phonenumber: "9999999999", email: "jane@example.com" };
  let citizen = await CitizenModel.findOne({ phonenumber: mockCitizen.phonenumber });
  if (!citizen) {
    citizen = await CitizenModel.create(mockCitizen);
    console.log(`✅ Created Citizen Profile: ${mockCitizen.fullName}`);
  }
  await UserModel.findOneAndUpdate(
    { phonenumber: mockCitizen.phonenumber },
    { phonenumber: mockCitizen.phonenumber, role: "citizen", roleRefId: citizen._id },
    { upsert: true, new: true }
  );
  console.log(`🔑 Created User Login for Citizen: ${mockCitizen.phonenumber}`);

  console.log("\n🎉 Mock data seeded successfully!");
  await mongoose.disconnect();
}

seedMockData().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
