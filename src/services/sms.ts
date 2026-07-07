export const smsService = {
  /**
   * Sends an SMS using the Textbee API.
   * @param to The recipient's phone number.
   * @param message The SMS message content.
   */
  sendSMS: async (to: string, message: string): Promise<boolean> => {
    try {
      if (!to || !message) return false;
      
      const apiKey = process.env.TEXTBEE_API_KEY;
      const deviceId = process.env.TEXTBEE_DEVICE_ID;
      
      if (!apiKey || !deviceId) {
        console.warn('Textbee SMS configuration is missing. SMS not sent.');
        return false;
      }
      
      const response = await fetch(`https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/sendSMS`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          receivers: [to],
          smsBody: message
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to send SMS to ${to}: ${response.status} ${response.statusText} - ${errorText}`);
        return false;
      }

      console.log(`SMS successfully sent to ${to}`);
      return true;
    } catch (error) {
      console.error(`Error sending SMS to ${to}:`, error);
      return false;
    }
  }
};
