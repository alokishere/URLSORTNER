require("dotenv").config();
const cors = require("cors");
const express = require("express");
const connectDB = require("./utils/db");

connectDB();
const router = require("./routes/url.routes");
const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

const port = 3000;

app.use("/urls", router);
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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
