"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitizenModel = void 0;
const mongoose_1 = require("mongoose");
const CitizenSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true },
    email: { type: String, sparse: true, lowercase: true },
    phonenumber: {
        type: String,
        unique: true,
        required: [true, "User phone number required"],
        index: true,
    },
}, { timestamps: true });
exports.CitizenModel = (0, mongoose_1.model)("Citizen", CitizenSchema);
