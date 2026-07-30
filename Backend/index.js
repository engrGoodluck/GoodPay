const express = require("express");

const users = [];

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

    users.push(user);

    res.json({
        success: true,
        message: "User registered successfully!",
        data: user
    });
});

app.post("/login", (req, res) => {

    const { email, password } = req.body;

    const user = users.find((user) => user.email === email);

    if (!user) {
    return res.json({
        success: false,
        message: "User not found."
    });
}

if (user.password !== password) {
    return res.json({
        success: false,
        message: "Incorrect password."
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

    res.json({
        success: true,
        message: "Login successful!"
    });

});

app.get("/users", (req, res) => {
    res.json(users);
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});