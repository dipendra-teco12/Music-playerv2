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

require("./Public/js/Oauth");
const session = require("express-session");
const passport = require("passport");
const connectDB = require("./config/db");
app.use(
  session({
    secret: "someSecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

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

// Handle Callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failure" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// Protected Route
function ensureAuth(req, res, next) {
  req.isAuthenticated() ? next() : res.redirect("/");
}
app.get("/dashboard", ensureAuth, (req, res) => {
  res.render("index");
});
// Failure & Logout
app.get("/auth/failure", (req, res) => res.send("Auth Failed"));
app.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy();
    res.redirect("/");
  });
});

app.use("/api/auth", authRoute);

app.get("/admin/dashboard", authenticateToken, (req, res) => {
  res.render("index");
  // res.send(

  //   `<h1>Welcome ${req.user.email} </h1><a href="/api/auth/logout"> Logout </a>`
  // );
});

app.get("/uploadsong", (req, res) => {
  res.render("uploadsong", { title: "Upload Song" });
});
connectDB();

app.listen(port, () => console.log(`Running on http://localhost:${port}`));
