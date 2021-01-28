
const lighthouse = require('lighthouse');
const { getIsPendingTermination, getNextMessage, postToProcessingLambda, setScaleInProtection, sleep, deleteMessage } = require('./utils');
const performance = require('perf_hooks');

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
    console.log(`[INFO]: Running Lighthouse Report`);
    const { Report } = await lighthouse(domain, {
      logLevel: 'verbose',
      chromeFlags: ['--headless --no-sandbox'],
      skipAudits: ['full-page-screenshot', 'screenshot-thumbnails', 'final-screenshot'],
    });

    // Post Lighthouse Report to Processing Lambda
    // await postToProcessingLambda(Report);

    console.log(JSON.stringify(Report));
    
    console.warn(`[INFO]: Deleting Message`);
    await deleteMessage(ReceiptHandle);

    // Remove Scale In Protection
    console.warn(`[INFO]: Removing Scale In Protection`);
    await setScaleInProtection(false);
  }
}

run();