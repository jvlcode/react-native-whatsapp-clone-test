import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/User.js";

const router = express.Router();

// 🛠 Setup Multer for Image Uploads
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// 📌 GET User by Phone
router.get("/:phone", async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.phone });
    if (!user) return res.status(404).json({ message: "User not found" });
// ✅ Convert relative image path to full URL
    const profileImageUrl = user.profileImage
    ? `${req.protocol}://${req.get("host")}${user.profileImage}`
    : null;
    res.json({
        _id: user._id,
        phone: user.phone,
        name: user.name,
        profileImage: profileImageUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 POST Create User with Image Upload
router.post("/", upload.single("profileImage"), async (req, res) => {
  const { phone, name } = req.body;

  try {
    let user = await User.findOne({ phone });
    if (user) return res.status(400).json({ message: "User already exists" });

    const profileImage = req.file ? `/uploads/${req.file.filename}` : null;

    user = new User({ phone, name, profileImage });
    await user.save();
    
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 PUT Update Profile (Name & Image)
router.put("/:id", upload.single("profileImage"), async (req, res) => {
  const { name } = req.body;

  try {
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If a new profile image is uploaded, delete the old one
    if (req.file) {
      if (user.profileImage) {
        const oldImagePath = path.join(process.cwd(), user.profileImage);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    // Update name if provided
    if (name) user.name = name;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Serve Uploaded Images
router.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

export default router;
