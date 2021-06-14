const AWS = require("aws-sdk");

/**
 * Return secrets from AWS Secrets Manager.
 *
 * Secrets key available
 * PRIVATE_KEY: Private key of cloudfront user
 * ACCESS_KEY: access key of cloudfront OAI user
 * CLOUDFRONT_URL: cloudfront distribution url
 */
const getSecrets = async () => {
  const secretsObj = await _getSecretPromise().catch((err) => {
    // write Dqueue letter
    console.log("Error while fetching aws secrets. ", err);
  });

  return _parse(secretsObj);
};

/**
 * Return promise from the method to enable async await.
 */
const _getSecretPromise = () => {
  const secretsManagerClient = new AWS.SecretsManager({
    region: "us-west-2",
  });

  return secretsManagerClient
    .getSecretValue({ SecretId: "achyut-test" })
    .promise();
};

/**
 * Parse JSON string.
 * @param {*} secretsObj
 */
const _parse = (secretsObj) => {
  const secrets = JSON.parse(secretsObj.SecretString);
  return secrets !== null ? secrets : {};
};

module.exports = getSecrets;
