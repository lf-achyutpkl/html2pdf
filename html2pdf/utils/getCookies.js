const AWS = require("aws-sdk");
const getSecrets = require("../utils/getSecrets");

// url: "http://dkxkfnc1q845c.cloudfront.net/1html-pdf/cat.jpeg",

// Reference: https://medium.com/@apalshah/node-js-serve-private-content-using-aws-cloudfront-992e846259ae
const getCookies = async () => {
  const { PRIVATE_KEY, ACCESS_KEY, CLOUDFRONT_URL } = await getSecrets();

  const cloudFront = new AWS.CloudFront.Signer(
    ACCESS_KEY,
    PRIVATE_KEY.replace(new RegExp("\\\\n", "g"), "\n")
  );

  const policy = JSON.stringify({
    Statement: [
      {
        Resource: `${CLOUDFRONT_URL}/*`,
        Condition: {
          DateLessThan: {
            "AWS:EpochTime":
              Math.floor(new Date().getTime() / 1000) + 60 * 60 * 2, // Current Time in UTC + time in seconds, (60 * 60 * 2 = 2 hour)
          },
        },
      },
    ],
  });

  // Set Cookies after successful verification
  const cookie = cloudFront.getSignedCookie({
    policy,
  });

  let hostname = new URL(CLOUDFRONT_URL).hostname;

  return [
    {
      name: "CloudFront-Key-Pair-Id",
      value: cookie["CloudFront-Key-Pair-Id"],
      domain: hostname,
      httpOnly: true,
    },
    {
      name: "CloudFront-Policy",
      value: cookie["CloudFront-Policy"],
      domain: hostname,
      httpOnly: true,
    },
    {
      name: "CloudFront-Signature",
      value: cookie["CloudFront-Signature"],
      domain: hostname,
      httpOnly: true,
    },
  ];
};

module.exports = getCookies;
