const express = require("express");
const path = require("path");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const passport = require("passport");
const connectDB = require("./config/db");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
require("dotenv").config({ quiet: true });
require("./config/oauth");

const cookieParser = require("cookie-parser");
const authRoute = require("./Routes/authRoutes");
const oauthRoute = require("./Routes/oauthRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const port = process.env.PORT || 4000;

app.set("layout", "layout");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
  res.render("authViews/login", { layout: false });
});
const songRoutes = require("./Routes/songRoutes");
app.use("/api/auth", authRoute);
app.use("/auth/google", oauthRoute);
app.use("/admin", adminRoutes);
app.use("/api/song", songRoutes);

connectDB();

app.listen(port, () => {
  const os = require("os");
  const interfaces = os.networkInterfaces();

  let ip = "localhost";
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        ip = iface.address;
      }
    }
  }

  console.log(`Server is running at http://${ip}:${port}`);
});
