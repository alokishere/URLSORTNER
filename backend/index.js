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
    "http://127.0.0.1:5173",
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

app.use(express.json());

app.use(cookieParser());



app.use("/urls", urlRouter);
app.use("/user", userRouter);
app.get("/", (req, res) => {
  return res.redirect(302, "https://app.ekurl.in");
});
app.get("/:shortID", getRedirectUrl);


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
