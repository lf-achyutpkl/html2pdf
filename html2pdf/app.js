const AWS = require("aws-sdk");
const chromium = require("chrome-aws-lambda");
const getCookies = require("./utils/getCookies");
const getSecrets = require("./utils/getSecrets");

const s3 = new AWS.S3();
const BucketName = "achyut-test";

/**
 * A Lambda function that logs the payload received from S3.
 */
exports.html2PdfHandler = async (event, context) => {
  //TODO check if s3objectkey is empty or not
  let { s3ObjectKey } = event.body;

  console.log("s3ObjectKey: ", s3ObjectKey);

  const { CLOUDFRONT_URL } = await getSecrets();
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: true,
    // ignoreHTTPSErrors: true,
  });

  const webPage = await browser.newPage();
  const cookie = await getCookies();

  await webPage.setCookie(...cookie);

  await webPage.goto(`${CLOUDFRONT_URL}/${s3ObjectKey}`, {
    waitUntil: "networkidle0",
  });

  const pdf = await webPage.pdf({
    printBackground: true,
    format: "Letter",
    margin: {
      top: "20px",
      bottom: "40px",
      left: "20px",
      right: "20px",
    },
  });

  await webPage.close();

  return pdf;
};
