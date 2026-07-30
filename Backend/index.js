const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.json({
        app: "GoodPay",
        version: "1.0.0",
        status: "Backend is working!"
    });
});

app.get("/user", (req, res) => {
    res.json({
        name: "Goodluck Isaac",
        app: "GoodPay",
        balance: 250000
    });
});

app.use(express.json());

app.post("/register", (req, res) => {
    const user = req.body;

    if (!user.name) {
        return res.json({
            success: false,
            message: "Name is required."
        });
    }

    if (!user.email) {
        return res.json({
            success: false,
            message: "Email is required."
        });
    }

    if (!user.password) {
        return res.json({
            success: false,
            message: "Password is required."
        });
    }

    res.json({
        success: true,
        message: "User registered successfully!",
        data: user
    });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});