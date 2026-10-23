require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const connectDB = require("./utils/db");
const urlRouter = require("./routes/url.routes");
const userRouter = require("./routes/user.routes");
const { getRedirectUrl } = require("./controllers/url.controller");

const app = express();
const port = process.env.PORT || 3000;
app.set("trust proxy", 1);

//cores
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://alokurl.vercel.app",
    "https://ekurl.vercel.app",
    "https://ekurl.in",
    "https://app.ekurl.in",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Browsers send Origin for cross-site writes; CORS alone does not reject them.
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("Origin");
  if (origin && !corsOptions.origin.includes(origin))
    return res.status(403).json({ error: "Origin not allowed" });
  if (!origin && req.get("Sec-Fetch-Site") === "cross-site")
    return res.status(403).json({ error: "Origin required" });
  return next();
});

app.use(express.json({ limit: "32kb" }));

app.use((req, res, next) => {
  res.set("Referrer-Policy", "no-referrer");
  next();
});

app.use(cookieParser());

// API responses can contain account and link data and must not be indexed or cached.
app.use(["/urls", "/user"], (req, res, next) => {
  res.set("Cache-Control", "private, no-store");
  res.set("X-Robots-Tag", "noindex, nofollow");
  next();
});

app.use("/urls", urlRouter);
app.use("/user", userRouter);
app.get("/", (req, res) => {
  return res.redirect(301, "https://app.ekurl.in");
});
app.get("/:shortID", getRedirectUrl);

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = Number.isInteger(error?.status) && error.status >= 400 && error.status < 500
    ? error.status
    : 500;
  console.error("Unhandled request error", {
    method: req.method,
    path: req.path,
    status,
    error: error?.message || "Unknown request error",
  });
  return res.status(status).json({
    error: status === 400 ? "Request could not be processed." : "Something went wrong. Please try again.",
  });
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Db connected and Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
