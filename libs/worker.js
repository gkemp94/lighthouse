
const { getIsPendingTermination, getNextMessage, postToProcessingLambda, runLighthouse, setScaleInProtection, sleep, deleteMessage } = require('./utils');

const run = async () => {
  while (await sleep(5)) {
    // Recieve Messages
    const { Messages } = await getNextMessage();

    // Check Messages
    if (!Messages || Messages.length === 0) {
      console.log('[INFO]: No Messages Recieved');
      continue;
    }
   
    console.log('[INFO] Message Recieved', JSON.stringify({ message: Messages[0] }))

    // Validate Message
    const [{ Body, ReceiptHandle, MessageId }] = Messages;
    const { domain, objectId } = JSON.parse(Body || '{}');
    if (!domain || !objectId || !ReceiptHandle) {
      console.warn(`[WARN]: Message ${MessageId} is invalid.`);
      continue;
    };

    // Check to see if we're about to be shut down
    if (await getIsPendingTermination()) {
      console.warn(`[INFO]: Worker going to sleep`);
      await sleep(120);
    };

    // Trigger Scale In Protection
    console.log(`[INFO]: Setting Scale In Protection`);
    await setScaleInProtection(true);

    // Run Lighthouse Report
    try {
      console.log(`[INFO]: Running Lighthouse Report`);
      const t0 = new Date().getTime();
      const report = await runLighthouse(domain);
      console.log(`${new Date().getTime() - t0}ms`);
  
      console.warn(`[INFO]: Deleting Message`);
      await deleteMessage(ReceiptHandle);

    } catch (e) {
      console.log('[Error]:', e);
    }
    
    // Remove Scale In Protection
    console.warn(`[INFO]: Removing Scale In Protection`);
    await setScaleInProtection(false);
  }
}

run();