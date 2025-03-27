const { EsewaPaymentGateway, EsewaCheckStatus } = require("esewajs");
const User = require("../Model/User");
const Transaction = require("../Model/transactionModel");
require("dotenv").config();

exports.initiateBillPayment = async (req, res) => {
    const { userId, amount } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (amount > user.dueAmount) {
            return res.status(400).json({ message: "Amount exceeds due amount" });
        }

        // Create a transaction record with PENDING status
        const transaction = new Transaction({
            userId,
            amount,
            esewaReferenceId: `esewa_${Date.now()}`, // Temporary ID
            status: "PENDING"
        });
        await transaction.save();

        // Initiate eSewa Payment
        const paymentResponse = await EsewaPaymentGateway(
            amount, 0, 0, 0, transaction._id, // Transaction ID used as reference
            process.env.MERCHANT_ID, process.env.SECRET,
            process.env.SUCCESS_URL, process.env.FAILURE_URL,
            process.env.ESEWAPAYMENT_URL, undefined, undefined
        );

        if (!paymentResponse || paymentResponse.status !== 200) {
            return res.status(400).json({ message: "Error initiating payment" });
        }

        res.status(200).json({ paymentUrl: paymentResponse.request.res.responseUrl });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    const { transactionId } = req.body;

    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        if (transaction.status === "SUCCESS") {
            return res.status(200).json({ message: "Payment already verified" });
        }

        // Check Payment Status
        const paymentStatus = await EsewaCheckStatus(
            transaction.amount, transactionId, process.env.MERCHANT_ID,
            process.env.ESEWAPAYMENT_STATUS_CHECK_URL
        );

        if (!paymentStatus || paymentStatus.status !== 200) {
            transaction.status = "FAILED";
            await transaction.save();
            return res.status(400).json({ message: "Payment verification failed" });
        }

        // Mark payment as successful
        transaction.status = "SUCCESS";
        transaction.esewaReferenceId = paymentStatus.transaction_code;
        await transaction.save();

        // Reduce user due amount
        const user = await User.findById(transaction.userId);
        user.dueAmount -= transaction.amount;
        await user.save();

        res.status(200).json({ message: "Payment successful" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
