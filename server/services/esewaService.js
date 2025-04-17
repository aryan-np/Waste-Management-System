const generateSignature = require('../utils/signatureGenerator');
const Transaction = require('../Model/Transaction');
const axios = require('axios');

const SECRET_KEY = '8gBm/:&EnhH.1/q('; // UAT key
const ESEWA_BASE_URL = 'https://rc-epay.esewa.com.np';

class EsewaService {
  static async initiatePayment(paymentData, userId) {
    // Calculate total amount if not provided
    const total_amount = paymentData.total_amount || 
      (parseFloat(paymentData.amount) + 
       parseFloat(paymentData.tax_amount || 0) + 
       parseFloat(paymentData.product_service_charge || 0) + 
       parseFloat(paymentData.product_delivery_charge || 0)).toString();

    const transaction_uuid = paymentData.transaction_uuid || `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const params = {
      amount: paymentData.amount,
      tax_amount: paymentData.tax_amount || '0',
      total_amount,
      transaction_uuid,
      product_code: paymentData.product_code || 'EPAYTEST',
      product_service_charge: paymentData.product_service_charge || '0',
      product_delivery_charge: paymentData.product_delivery_charge || '0',
      success_url: paymentData.success_url || `${process.env.BASE_URL}/payment/esewa/success`,
      failure_url: paymentData.failure_url || `${process.env.BASE_URL}/payment/esewa/failure`,
      signed_field_names: 'total_amount,transaction_uuid,product_code'
    };

    // Generate signature
    const { signature } = generateSignature(SECRET_KEY, params);

    // Save to database
    const transaction = new Transaction({
      amount: params.amount,
      taxAmount: params.tax_amount,
      totalAmount: params.total_amount,
      transactionUUID: params.transaction_uuid,
      productCode: params.product_code,
      status: 'PENDING',
      userId
    });
    await transaction.save();

    return {
      formData: {
        ...params,
        signature
      },
      esewaUrl: `${ESEWA_BASE_URL}/api/epay/main/v2/form`
    };
  }

  static async verifyPayment(transaction_uuid) {
    try {
      // First check local database
      const localTransaction = await Transaction.findOne({ transactionUUID: transaction_uuid });
      
      if (localTransaction && localTransaction.status === 'COMPLETE') {
        return {
          product_code: localTransaction.productCode,
          transaction_uuid: localTransaction.transactionUUID,
          total_amount: localTransaction.totalAmount,
          status: localTransaction.status,
          ref_id: localTransaction.referenceId
        };
      }

      // If not found locally or not complete, check with eSewa
      const response = await axios.get(`${ESEWA_BASE_URL}/api/epay/transaction/status`, {
        params: {
          product_code: 'EPAYTEST',
          transaction_uuid,
          total_amount: localTransaction?.totalAmount || 100
        }
      });
      
      // Update local transaction if status changed
      if (response.data && localTransaction) {
        localTransaction.status = response.data.status;
        localTransaction.referenceId = response.data.ref_id;
        await localTransaction.save();
      }
      
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }
}

module.exports = EsewaService;