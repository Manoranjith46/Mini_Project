import twilio from 'twilio';

interface TwilioInstance {
  client: twilio.Twilio;
  verifyService: any;
}

let twilioInstance: TwilioInstance | null = null;

const initializeTwilio = (): TwilioInstance => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const serviceSid = process.env.TWILIO_SERVICE_SID;

  if (!accountSid || !authToken || !serviceSid) {
    throw new Error(
      'Missing required Twilio credentials in environment variables: ' +
      'TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID'
    );
  }

  const client = twilio(accountSid, authToken);
  return {
    client,
    verifyService: client.verify.v2.services(serviceSid),
  };
};

/**
 * Get Twilio client instance (lazy initialized)
 */
export const getTwilioClient = (): TwilioInstance => {
  if (!twilioInstance) {
    twilioInstance = initializeTwilio();
  }
  return twilioInstance;
};
