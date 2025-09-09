const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const bcrypt = require("bcryptjs");
const { validateToken } = require("../middlewares/AuthMiddleware");
const { sign } = require("jsonwebtoken");

router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await Users.create({
      username: username,
      password: hash,
    });
    
    res.status(201).json({ message: "User created successfully", userId: user.id });
  } catch (error) {
    console.error("User creation error:", error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ error: "Sorry, Username already exists" });
    } else {
      res.status(500).json({ error: "Internal server error during user creation" });
    }
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const user = await Users.findOne({ where: { username: username } });

    if (!user) {
      return res.status(401).json({ error: "Sorry, This User Doesn't Exist" });
    }

    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      return res.status(401).json({ error: "Sorry, Wrong Username or Password " });
    }

    const accessToken = sign(
      { username: user.username, id: user.id },
      "importantsecret"
    );
    
    res.json({ token: accessToken, username: username, id: user.id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

router.get("/auth", validateToken, (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Internal server error during authentication" });
  }
});

router.get("/basicinfo/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Sorry, Valid user ID is required" });
    }

    const basicInfo = await Users.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!basicInfo) {
      return res.status(404).json({ error: "Sorry, User not found" });
    }

    res.json(basicInfo);
  } catch (error) {
    console.error("Basic info error:", error);
    res.status(500).json({ error: "Internal server error while fetching user info" });
  }
});

router.put("/changepassword", validateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Sorry, Old password and new password are required" });
    }

    const user = await Users.findOne({ where: { username: req.user.username } });

    if (!user) {
      return res.status(404).json({ error: "Sorry, User not found" });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    
    if (!match) {
      return res.status(401).json({ error: "Wrong Password Entered!" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await Users.update(
      { password: hash },
      { where: { username: req.user.username } }
    );
    
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error during password change" });
  }
});

module.exports = router;
