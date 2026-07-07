import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const apiKey = process.env.TEXTBEE_API_KEY;
const deviceId = process.env.TEXTBEE_DEVICE_ID;

async function test1() {
  const url = `https://api.textbee.dev/api/v1/gateway/devices/${deviceId}/sendSMS`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ receivers: ['+251911000000'], smsBody: 'test' })
  });
  console.log('Test 1 (dev, path var) status:', res.status);
  console.log('Test 1 body:', await res.text());
}

async function test2() {
  const url = `https://api.textbee.dev/api/v1/gateway/devices/send-sms`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ receivers: ['+251911000000'], smsBody: 'test', deviceId: deviceId })
  });
  console.log('Test 2 (dev, body var) status:', res.status);
  console.log('Test 2 body:', await res.text());
}

test1().then(test2);
