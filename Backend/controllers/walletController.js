const bcrypt = require("bcrypt");
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

// WITHDRAW MONEY
const withdraw = async (req, res) => {

    const { amount, pin } = req.body;

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

        const userResult = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [req.user.id]
        );

        const user = userResult.rows[0];

        const pinMatch = await bcrypt.compare(pin, user.pin);

        if (!pinMatch) {
            return res.json({
                success: false,
                message: "Incorrect transaction PIN."
            });
        }

        const walletResult = await pool.query(
            "SELECT * FROM wallets WHERE user_id = $1",
            [req.user.id]
        );

        const wallet = walletResult.rows[0];

        if (Number(wallet.balance) < Number(amount)) {
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

        await pool.query(
            `INSERT INTO transactions
            (sender_id, receiver_id, amount, type)
            VALUES ($1, NULL, $2, $3)`,
            [
                req.user.id,
                amount,
                "withdraw"
            ]
        );

        const updatedWallet = await pool.query(
            `SELECT balance
             FROM wallets
             WHERE user_id = $1`,
            [req.user.id]
        );

        await pool.query("COMMIT");

        res.json({
            success: true,
            message: "Withdrawal successful.",
            data: {
                balance: updatedWallet.rows[0].balance
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
    withdraw,
    getWallet
};