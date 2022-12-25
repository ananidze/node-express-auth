const router = require("express").Router();
const User = require("../models/user.model");
const Roles = require("../utils/roles");
const bcrypt = require("bcrypt");
const isAuthenticated = require("../middlewares/isAuthenticated");
const roleMiddleware = require("../middlewares/role");
const { validateSignUp } = require("../middlewares/validator");

router.get("/admins/:page", isAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const admins = await User.find({ role: Roles.Admin })
      .skip(skip)
      .limit(limit)
      .select("firstName lastName email gender age")
      .exec();

    const totalAdmins = await User.countDocuments({ role: Roles.Admin }).exec();
    const totalPages = Math.floor(totalAdmins / limit + 1);

    res.status(200).json({ admins, totalPages });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/admin/:id", async (req, res) => {
  try {
    const admin = await User.findById(req.params.id).select(
      "firstName lastName email gender age"
    );
    if (!admin) {
      res.status(404).json({ message: "User Not Found" });
    }

    res.json(admin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/admin/:id", async (req, res) => {
  try {
    console.log("asdfa");
    const admin = await User.findById(req.params.id);
    if (!admin) {
      res.status(404).json({ message: "User Not Found" });
    }

    await admin.remove();

    res.status(200).json({ message: "user deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/admin/password", async (req, res) => {
  try {
    const { _id, password } = req.body;
    const user = await User.findById(_id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 7);
    await user.updateOne({ password: hashedPassword });

    res.json({ message: "Password Changed Succesfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/admin/:adminId", async (req, res) => {
  try {
    const admin = await User.findById(req.params.adminId);
    if (!admin) {
      res.status(404).json({ message: "User Not Found" });
    }

    await admin.updateOne(req.body);

    res.json({ message: "Information updated Successfully " });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
