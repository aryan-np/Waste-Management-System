const EsewaService = require('../services/esewaService');
const Transaction = require('../Model/Transaction');
const generateSignature = require('../utils/signatureGenerator');

const SECRET_KEY = '8gBm/:&EnhH.1/q('; // UAT key


exports.initiatePayment = async (req, res) => {
  try {
    // Calculate total amount if not provided
    const total_amount = req.body.total_amount || 
      (Number(req.body.amount) + 
       Number(req.body.tax_amount || 0) + 
       Number(req.body.product_service_charge || 0) + 
       Number(req.body.product_delivery_charge || 0)).toString();

    const transaction_uuid = req.body.transaction_uuid || `TXN-${Date.now()}`;
    
    const params = {
      amount: req.body.amount,
      tax_amount: req.body.tax_amount || '0',
      total_amount,
      transaction_uuid,
      product_code: req.body.product_code || 'EPAYTEST',
      product_service_charge: req.body.product_service_charge || '0',
      product_delivery_charge: req.body.product_delivery_charge || '0',
      success_url: req.body.success_url || `${process.env.BASE_URL}/payment/esewa/success`,
      failure_url: req.body.failure_url || `${process.env.BASE_URL}/payment/esewa/failure`,
      signed_field_names: 'total_amount,transaction_uuid,product_code' // Must be in this exact order
    };

    // Generate signature
    const { signature } = generateSignature(SECRET_KEY, params);

    res.json({
      success: true,
      formData: {
        ...params,
        signature
      },
      esewaUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
    });

  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(400).json({
      success: false,
      code: 'ES104',
      message: 'Failed to generate valid signature',
      error: error.message
    });
  }
};


exports.paymentSuccess = async (req, res) => {
  try {
    // Decode the base64 response data
    const responseData = Buffer.from(req.query.data, 'base64').toString('ascii');
    const response = JSON.parse(responseData);

    // Verify the signature
    const expectedSignature = generateSignature(SECRET_KEY, {
      total_amount: response.total_amount,
      transaction_uuid: response.transaction_uuid,
      product_code: response.product_code,
      signed_field_names: response.signed_field_names
    });

    if (response.signature !== expectedSignature.signature) {
      throw new Error('Invalid signature in callback');
    }

    // Update transaction status
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { transactionUUID: response.transaction_uuid },
      { 
        status: 'COMPLETE',
        referenceId: response.transaction_code,
        esewaResponse: response
      },
      { new: true }
    );

    if (!updatedTransaction) {
      throw new Error('Transaction not found');
    }

    res.redirect(`${process.env.FRONTEND_URL}/payment/success?transactionId=${response.transaction_uuid}`);
  } catch (error) {
    console.error('Payment success handler error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=${encodeURIComponent(error.message)}`);
  }
};

exports.paymentFailure = async (req, res) => {
  try {
    const data = req.query.data ? JSON.parse(Buffer.from(req.query.data, 'base64').toString()) : null;
    
    if (data?.transaction_uuid) {
      await Transaction.findOneAndUpdate(
        { transactionUUID: data.transaction_uuid },
        { status: 'FAILED', esewaResponse: data }
      );
    }
    
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  } catch (error) {
    console.error('Payment failure handler error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  }
};

exports.checkPaymentStatus = async (req, res) => {
  try {
    const { transaction_uuid } = req.params;
    const status = await EsewaService.verifyPayment(transaction_uuid);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to check payment status' 
    });
  }
};