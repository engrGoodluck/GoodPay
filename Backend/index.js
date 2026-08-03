require("dotenv").config();

const express = require("express");
const pool = require("./db");
/*const bcrypt = require("bcrypt");*/
/*const jwt = require("jsonwebtoken");*/
/*const auth = require("./middleware/auth");*/
const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const beneficiaryRoutes = require("./routes/beneficiaryRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(authRoutes);
app.use(walletRoutes);
app.use(transactionRoutes);
app.use(userRoutes);
app.use(beneficiaryRoutes);


app.get("/", (req, res) => {
    res.json({
        app: "GoodPay",
        version: "1.0.0",
        status: "Backend is working!"
    });
});

// REGISTER USER
/*app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name) {
        return res.json({
            success: false,
            message: "Name is required."
        });
    }

    if (!email) {
        return res.json({
            success: false,
            message: "Email is required."
        });
    }

    if (!password) {
        return res.json({
            success: false,
            message: "Password is required."
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the new user and return the created record
        const userResult = await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [name, email, hashedPassword]
        );

        const userId = userResult.rows[0].id;

        // Create wallet for the new user
        await pool.query(
            `INSERT INTO wallets (user_id)
             VALUES ($1)`,
            [userId]
        );

        res.json({
            success: true,
            message: "User registered successfully!"
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
}); */

// LOGIN USER
/*app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.json({
            success: false,
            message: "Email is required."
        });
    }

    if (!password) {
        return res.json({
            success: false,
            message: "Password is required."
        });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: false,
                message: "User not found."
            });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({
                success: false,
                message: "Incorrect password."
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            success: true,
            message: "Login successful!",
            token: token
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
}); */

// DEPOSIT MONEY
/*app.post("/deposit", auth, async (req, res) => {

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

}); */

// TRANSFER MONEY
/*app.post("/transfer", auth, async (req, res) => {

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

// Check if sender has enough balance
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

// Check if beneficiary already exists
const beneficiaryResult = await pool.query(
    `SELECT *
     FROM beneficiaries
     WHERE user_id = $1
     AND beneficiary_id = $2`,
    [req.user.id, receiver.id]
);

// Save beneficiary only if not already saved
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

}); */

// GET ALL USERS (Protected)
/*app.get("/users", auth, async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT * FROM users"
        );

        res.json(result.rows);

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

}); */

// GET LOGGED-IN USER PROFILE
/*app.get("/profile", auth, async (req, res) => {

    try {

        const result = await pool.query(
            "SELECT id, name, email FROM users WHERE id = $1",
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.json(result.rows[0]);

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

}); */

// CREATE TRANSACTION PIN
/*app.post("/create-pin", auth, async (req, res) => {

    const { pin } = req.body;

    if (!pin) {
        return res.json({
            success: false,
            message: "PIN is required."
        });
    }

    // PIN must be exactly 4 digits
    if (!/^\d{4}$/.test(pin)) {
        return res.json({
            success: false,
            message: "PIN must be exactly 4 digits."
        });
    }

    try {

        const hashedPin = await bcrypt.hash(pin, 10);

        await pool.query(
            `UPDATE users
             SET pin = $1
             WHERE id = $2`,
            [hashedPin, req.user.id]
        );

        res.json({
            success: true,
            message: "Transaction PIN created successfully."
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

}); */

// CHANGE TRANSACTION PIN
/*app.post("/change-pin", auth, async (req, res) => {

    const { oldPin, newPin } = req.body;

    if (!oldPin) {
        return res.json({
            success: false,
            message: "Old PIN is required."
        });
    }

    if (!newPin) {
        return res.json({
            success: false,
            message: "New PIN is required."
        });
    }

    if (!/^\d{4}$/.test(newPin)) {
        return res.json({
            success: false,
            message: "New PIN must be exactly 4 digits."
        });
    }

    try {

        // Get current user
        const result = await pool.query(
            "SELECT pin FROM users WHERE id = $1",
            [req.user.id]
        );

        const user = result.rows[0];

        // Verify old PIN
        const pinMatch = await bcrypt.compare(oldPin, user.pin);

        if (!pinMatch) {
            return res.json({
                success: false,
                message: "Old PIN is incorrect."
            });
        }

        // Prevent using the same PIN again
        if (oldPin === newPin) {
            return res.json({
                success: false,
                message: "New PIN must be different from the old PIN."
            });
        }

        // Hash new PIN
        const hashedPin = await bcrypt.hash(newPin, 10);

        // Update database
        await pool.query(
            `UPDATE users
             SET pin = $1
             WHERE id = $2`,
            [hashedPin, req.user.id]
        );

        res.json({
            success: true,
            message: "Transaction PIN changed successfully."
        });

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

}); */

// To get wallet balance
/*app.get("/wallet", auth, async (req, res) => {

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

}); */

/*app.get("/transactions", auth, async (req, res) => {

    try {

        const result = await pool.query(
    `SELECT
        t.id,
        s.name AS sender,
        r.name AS receiver,
        t.amount,
        t.type,
        t.created_at
     FROM transactions t
     JOIN users s
        ON t.sender_id = s.id
     JOIN users r
        ON t.receiver_id = r.id
     WHERE t.sender_id = $1
        OR t.receiver_id = $1
     ORDER BY t.created_at DESC`,
    [req.user.id]
);

        res.json(result.rows);

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

}); */

// GET BENEFICIARIES
/*app.get("/beneficiaries", auth, async (req, res) => {

    try {

        const result = await pool.query(

            `SELECT
                users.id,
                users.name,
                users.email,
                beneficiaries.created_at

            FROM beneficiaries

            JOIN users
            ON beneficiaries.beneficiary_id = users.id

            WHERE beneficiaries.user_id = $1

            ORDER BY beneficiaries.created_at DESC`,

            [req.user.id]

        );

        res.json(result.rows);

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }

}); */

pool.connect()
    .then(() => {
        console.log("✅ Connected to PostgreSQL!");
    })
    .catch((err) => {
        console.log("❌ Database connection failed.");
        console.error(err.message);
    });

/*app.use("/beneficiaries", beneficiaryRoutes);*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});