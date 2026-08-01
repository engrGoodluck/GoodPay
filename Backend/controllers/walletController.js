const pool = require("../db");

// DEPOSIT MONEY
const deposit = async (req, res) => {

    const { amount } = req.body;

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

    try {

        await pool.query(
            `UPDATE wallets
             SET balance = balance + $1
             WHERE user_id = $2`,
            [amount, req.user.id]
        );

        const wallet = await pool.query(
            `SELECT balance
             FROM wallets
             WHERE user_id = $1`,
            [req.user.id]
        );

        res.json({
            success: true,
            message: "Deposit successful!",
            data: {
                balance: wallet.rows[0].balance
            }
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

};

// GET WALLET BALANCE
const getWallet = async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT balance
             FROM wallets
             WHERE user_id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: false,
                message: "Wallet not found."
            });
        }

        res.json({
            success: true,
            data: {
                balance: result.rows[0].balance
            }
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    deposit,
    getWallet
};