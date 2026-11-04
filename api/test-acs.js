const { EmailClient } = require('@azure/communication-email');
const client = new EmailClient(process.env.ACS_CONN);
const msg = {
  senderAddress: 'donotreply@odipa.org',
  content: { subject: 'ACS Test', plainText: 'Test from CLI' },
  recipients: { to: [{ address: 'info@odipa.org' }] }
};
client.beginSend(msg)
  .then(p => p.pollUntilDone())
  .then(() => console.log('SUCCESS'))
  .catch(e => console.error('FAIL:', e.message));
