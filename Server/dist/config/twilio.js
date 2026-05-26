"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTwilioClient = void 0;
const twilio_1 = __importDefault(require("twilio"));
let twilioInstance = null;
const initializeTwilio = () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const serviceSid = process.env.TWILIO_SERVICE_SID;
    if (!accountSid || !authToken || !serviceSid) {
        throw new Error('Missing required Twilio credentials in environment variables: ' +
            'TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID');
    }
    const client = (0, twilio_1.default)(accountSid, authToken);
    return {
        client,
        verifyService: client.verify.v2.services(serviceSid),
    };
};
/**
 * Get Twilio client instance (lazy initialized)
 */
const getTwilioClient = () => {
    if (!twilioInstance) {
        twilioInstance = initializeTwilio();
    }
    return twilioInstance;
};
exports.getTwilioClient = getTwilioClient;
