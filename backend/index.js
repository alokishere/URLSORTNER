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


//cores
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://alokurl.vercel.app",
    "https://urlview.vercel.app",
    "https://u.alokdev.in",
    "https://url.alokdev.in",
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
  res.send(
    `<h1>Welcome to the URL Shortener API</h1>
    <p>Use the following endpoints:</p>
    <ul>
      <li>POST /urls - Create a new shortened URL</li>
      <li>GET /urls/:shortUrl - Redirect to the original URL</li>
      <li>GET /urls - Get all shortened URLs</li>
    </ul> `,
  );
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


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
