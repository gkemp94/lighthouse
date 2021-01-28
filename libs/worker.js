
// const lighthouse = require('lighthouse');
const { /*getIsPendingTermination, getNextMessage, postToProcessingLambda, setScaleInProtection,*/ sleep } = require('./utils');

const run = async () => {
  while (await sleep(5)) {
    console.log('[INFO] It\'s Alive');
    console.log(process.env);
    /*
    // Recieve Messages
    const { Messages } = await getNextMessage();

    // Check Messages
    if (!Messages || Messages.length === 0) {
      console.log('[INFO]: No Messages Recieved');
      continue;
    }

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
    await setScaleInProtection(true);

    // Run Lighthouse Report
    const { Report } = await lighthouse(domain, {
      chromeFlags: ['--headless --no-sandbox'],
      skipAudits: ['full-page-screenshot', 'screenshot-thumbnails', 'final-screenshot'],
    });

    // Post Lighthouse Report to Processing Lambda
    await postToProcessingLambda(Report);

    // Remove Scale In Protection
    await setScaleInProtection(false);
    */
  }
}

run();