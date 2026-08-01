const pool = require("../db");
const bcrypt = require("bcrypt");

// TRANSFER MONEY
const transfer = async (req, res) => {

    const { email, amount, pin } = req.body;

    if (!email) {
        return res.json({
            success: false,
            message: "Receiver email is required."
        });
    }

    if (!amount) {
        return res.json({
            success: false,
            message: "Amount is required."
        });
    }

    if (amount <= 0) {
        return res.json({
            success: false,
            message: "Amount must be greater than zero."
        });
    }

    if (!pin) {
        return res.json({
            success: false,
            message: "Transaction PIN is required."
        });
    }

    try {

        const senderResult = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [req.user.id]
        );

        const sender = senderResult.rows[0];

        console.log("PIN entered:", pin);
        console.log("Sender:", sender);

        const pinMatch = await bcrypt.compare(pin, sender.pin);

        if (!pinMatch) {
            return res.json({
                success: false,
                message: "Incorrect transaction PIN."
            });
        }

        const receiverResult = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (receiverResult.rows.length === 0) {
            return res.json({
                success: false,
                message: "Receiver not found."
            });
        }

        const receiver = receiverResult.rows[0];

        if (receiver.id === req.user.id) {
            return res.json({
                success: false,
                message: "You cannot transfer money to yourself."
            });
        }

        const senderWalletResult = await pool.query(
            "SELECT * FROM wallets WHERE user_id = $1",
            [req.user.id]
        );

        const senderWallet = senderWalletResult.rows[0];

        if (Number(senderWallet.balance) < Number(amount)) {
            return res.json({
                success: false,
                message: "Insufficient balance."
            });
        }

        await pool.query("BEGIN");

        await pool.query(
            `UPDATE wallets
             SET balance = balance - $1
             WHERE user_id = $2`,
            [amount, req.user.id]
        );

        const updatedSenderWallet = await pool.query(
            `SELECT balance
             FROM wallets
             WHERE user_id = $1`,
            [req.user.id]
        );

        await pool.query(
            `UPDATE wallets
             SET balance = balance + $1
             WHERE user_id = $2`,
            [amount, receiver.id]
        );

        const receiverWallet = await pool.query(
            `SELECT balance
             FROM wallets
             WHERE user_id = $1`,
            [receiver.id]
        );

        await pool.query(
            `INSERT INTO transactions
            (sender_id, receiver_id, amount, type)
            VALUES ($1, $2, $3, $4)`,
            [
                req.user.id,
                receiver.id,
                amount,
                "transfer"
            ]
        );

        const beneficiaryResult = await pool.query(
            `SELECT *
             FROM beneficiaries
             WHERE user_id = $1
             AND beneficiary_id = $2`,
            [req.user.id, receiver.id]
        );

        if (beneficiaryResult.rows.length === 0) {

            await pool.query(
                `INSERT INTO beneficiaries (user_id, beneficiary_id)
                 VALUES ($1, $2)`,
                [req.user.id, receiver.id]
            );

        }

        await pool.query("COMMIT");

        res.json({
            success: true,
            message: "Receiver credited successfully.",
            data: {
                senderBalance: updatedSenderWallet.rows[0].balance,
                receiverBalance: receiverWallet.rows[0].balance
            }
        });

    } catch (error) {

        await pool.query("ROLLBACK");

        res.json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    transfer
};