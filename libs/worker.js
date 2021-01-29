
const axios = require('axios');
const { getIsPendingTermination, getNextMessage, runLighthouse, setScaleInProtection, deleteMessage, uploadReport } = require('./utils');

const run = async () => {
  while (true) {
    // Recieve Messages
    const { Messages } = await getNextMessage();

    // Check Messages
    if (!Messages || Messages.length === 0) {
      continue;
    }
   
    // Validate Message
    const [{ Body, ReceiptHandle, MessageId }] = Messages;
    const { domain, callback } = JSON.parse(Body || '{}');
    if (!domain || !callback || !ReceiptHandle) {
      console.warn(`[WARN]: Message ${MessageId} is invalid.`);
      continue;
    };

    // Check to see if we're about to be shut down
    if (await getIsPendingTermination()) {
      console.warn(`[INFO]: Worker going to sleep`);
      await sleep(120);
    };

    // Trigger Scale In Protection
    await setScaleInProtection(true);

    // Run Lighthouse Report
    try {
      console.log(`[INFO]: Auditing ${domain}`);
      const report = await runLighthouse(domain);
      const url = await uploadReport(domain, report);
      await axios.post(callback, { url, domain });
      console.log(`[INFO]: Sucessfully Audited ${domain}`);
      await deleteMessage(ReceiptHandle);
      
    } catch (e) {
      console.log('[Error]:', e);
    }
    
    // Remove Scale In Protection
    await setScaleInProtection(false);
  }
}

run();