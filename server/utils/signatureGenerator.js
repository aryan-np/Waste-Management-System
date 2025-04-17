const crypto = require('crypto');

const generateSignature = (secretKey, params) => {
  // Get fields in EXACT order as specified in signed_field_names
  const signedFields = params.signed_field_names.split(',');
  
  // Create the message string exactly as eSewa expects
  const message = signedFields.map(field => {
    if (params[field] === undefined || params[field] === null) {
      throw new Error(`Missing required field for signature: ${field}`);
    }
    return `${field}=${params[field]}`;
  }).join(',');

  console.log("Message being signed:", message); // Debug log

  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(message);
  const signature = hmac.digest('base64');

  console.log("Generated Signature:", signature); // Debug log

  return {
    signature,
    signed_field_names: params.signed_field_names
  };
};

module.exports = generateSignature;