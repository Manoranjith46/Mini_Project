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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySmsOtp = exports.sendSmsOtp = void 0;
const twilio_1 = require("../config/twilio");
/**
 * Send OTP via SMS using Twilio Verify API
 * @param {string} phoneNumber - Phone number in E.164 format (e.g., +91XXXXXXXXXX)
 */
const sendSmsOtp = (phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { verifyService } = (0, twilio_1.getTwilioClient)();
        const verification = yield verifyService.verifications.create({
            to: phoneNumber,
            channel: 'sms',
        });
        return {
            success: true,
            message: 'OTP sent successfully',
            verificationSid: verification.sid,
            status: verification.status,
        };
    }
    catch (error) {
        console.error('[SmsMessenger] Error sending OTP:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to send OTP',
            error: error instanceof Error ? error.message : String(error),
        };
    }
});
exports.sendSmsOtp = sendSmsOtp;
/**
 * Verify OTP code via Twilio Verify API
 * @param {string} phoneNumber - Phone number in E.164 format (e.g., +91XXXXXXXXXX)
 * @param {string} code - 6-digit OTP code entered by user
 */
const verifySmsOtp = (phoneNumber, code) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { verifyService } = (0, twilio_1.getTwilioClient)();
        const verificationCheck = yield verifyService.verificationChecks.create({
            to: phoneNumber,
            code: code,
        });
        if (verificationCheck.status === 'approved') {
            return {
                success: true,
                message: 'OTP verified successfully',
                status: verificationCheck.status,
            };
        }
        else {
            return {
                success: false,
                message: 'Invalid OTP code',
                status: verificationCheck.status,
            };
        }
    }
    catch (error) {
        console.error('[SmsMessenger] Error verifying OTP:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to verify OTP',
            error: error instanceof Error ? error.message : String(error),
        };
    }
});
exports.verifySmsOtp = verifySmsOtp;
