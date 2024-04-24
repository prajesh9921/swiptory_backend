const User = require("../models/user");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const RegisterUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if ((!email, !password)) {
      res.status(400).json({ message: "Bad request" });
    }

    const isExistingUser = await User.findOne({ email: email });
    if (isExistingUser) {
      res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email: email,
      password: hashedPassword,
    });

    await newUser
      .save()
      .then(() => {
        res.status(200).json({ message: "User created successfully" });
      })
      .catch((err) => {
        res.status(500).json({ message: "Error creating user", error: err });
      });
  } catch (err) {
    console.log("Error Registering" + err);
  }
};

const UserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userDetails = await User.findOne({ email: email });
    if (!userDetails) {
      res.status(401).json({ message: "Invalid username or password" });
    }

    const matchPassword = await bcrypt.compare(password, userDetails.password);

    if (!matchPassword) {
      res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ id: userDetails._id }, process.env.SECRET_KEY);

    // Storing a cookie
    res.cookie("token", token, { httpOnly: true });
    res.cookie("userid", userDetails._id, { httpOnly: true });

    res
      .status(200)
      .json({
        message: "user login successfull",
        token: token,
        userEmail: userDetails.email,
        userId: userDetails._id,
      });
  } catch (err) {
    console.log("Error logging user" + err);
  }
};



module.exports = { RegisterUser, UserLogin };
