const express = require("express");
const path = require("path");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const passport = require("passport");
const connectDB = require("./config/db");

require("dotenv").config({ quiet: true });
require("./config/oauth");

const cookieParser = require("cookie-parser");
const authRoute = require("./Routes/authRoutes");
const oauthRoute = require("./Routes/oauthRoutes");
const authenticateToken = require("./Middlewares/authMiddleware");
const port = process.env.PORT || 4000;

app.set("layout", "layout");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());

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


app.get("/", (req, res) => {
  res.render("login", { layout: false });
});
app.get("/admin", (req, res) => {
  res.render("login", { layout: false }); // Disable default layout
});

app.get("/register", (req, res) => {
  res.render("register", { layout: false }); 
});

app.get("/forgot-password", (req, res) => {
  res.render("forgot-password", { layout: false }); 
});

app.use("/api/auth", authRoute);
app.use("/auth/google", oauthRoute);

app.get("/admin/dashboard", authenticateToken, (req, res) => {
  res.render("index");
});

app.get("/uploadsong", authenticateToken, (req, res) => {
  res.render("uploadsong", { title: "Upload Song" });
});
connectDB();

app.listen(port, () => console.log(`Running on http://localhost:${port}`));
