const express = require("express");
const path = require("path");
const app = express();
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config({ quiet: true });
const cookieParser = require("cookie-parser");
const authRoute = require("./Routes/authRoutes");
const authenticateToken = require("./Middlewares/authMiddleware");
const port = process.env.PORT || 4000;
app.use(expressLayouts);
app.set("layout", "layout");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  "/adminlte",
  express.static(path.join(__dirname, "node_modules/admin-lte/dist"))
);

app.use(
  "/plugins/jquery",
  express.static(path.join(__dirname, "node_modules/jquery/dist"))
);

app.use(
  "/plugins/bootstrap",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist"))
);
app.use(
  "/plugins/fontawesome-free",
  express.static(
    path.join(__dirname, "node_modules/@fortawesome/fontawesome-free")
  )
);

require("./config/oauth");
const passport = require("passport");
const connectDB = require("./config/db");

app.use(passport.initialize());

// app.get("/dashboard", (req, res) => res.render("index"));

app.get("/", (req, res) => {
  res.render("login", { layout: false });
});
app.get("/admin", (req, res) => {
  res.render("login", { layout: false }); // Disable default layout
});

app.get("/register", (req, res) => {
  res.render("register", { layout: false }); // Disable default layout
});

app.get("/forgot-password", (req, res) => {
  res.render("forgot-password", { layout: false }); // or use layout-auth
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

const RefreshToken = require("./Models/refreshToken.Model");
const jwt = require("jsonwebtoken");
// Handle Callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/failure",
  }),
  async (req, res) => {
    // Issue JWT after login
    // after passport.authenticate callback
    const accessToken = jwt.sign(
      { sub: req.user.id, email: req.user.email },
      process.env.SECRET_KEY,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { sub: req.user.id, email: req.user.email },
      process.env.REFRESH_SECRET_KEY,
      { expiresIn: "7d" }
    );

    // Store refresh token in DB
    await RefreshToken.create({
      token: refreshToken,
      userId: req.user.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect("/admin/dashboard");
  }
);

app.use("/api/auth", authRoute);

app.get("/admin/dashboard", authenticateToken, (req, res) => {
  res.render("index");
});

app.get("/uploadsong", authenticateToken, (req, res) => {
  res.render("uploadsong", { title: "Upload Song" });
});
connectDB();

app.listen(port, () => console.log(`Running on http://localhost:${port}`));
