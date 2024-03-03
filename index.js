let express = require("express");
let bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const pdf = require("html-pdf");
const puppeteer = require("puppeteer");

require("dotenv").config();
let app = express();
// let routes = require("./Routers/routingEngine");
let { mysqlClient } = require("./DBConfig/dbConfig");
let users = require("./Routers/userRouter");
let inventory = require("./Routers/inventoryRouter");
const { UM_DB_HOST, UM_DB_PORT, UM_DB_DATABASE, UM_DB_USER, UM_DB_PASSWORD } =
  process.env;
mysqlClient(UM_DB_HOST, UM_DB_PORT, UM_DB_DATABASE, UM_DB_USER, UM_DB_PASSWORD);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Allow cross-origin requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});
app.use("/user", users);
app.use("/inventory", inventory);

const publicPath = path.join(__dirname, "public"); // Define public folder path

// Ensure public folder exists
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath);
}

app.get("/generate-pdf", async (req, res) => {
  const htmlFile = path.join(__dirname, "template.html"); // Replace with your HTML path
  const outputPdf = path.join(publicPath, "invoice.pdf");

  try {
    const browser = await puppeteer.launch({ headless: true }); // Launch headless Chrome
    const page = await browser.newPage();
    await page.goto(htmlFile, { waitUntil: "networkidle0" }); // Wait for page to load

    // Generate PDF with desired options
    await page.pdf({ path: outputPdf, format: "A4" });

    await browser.close();
    res.send("PDF generated successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating PDF");
  }
});

app.use(express.static(publicPath));
app.listen(4000, () => {
  console.log("Server has connected.... PORT 4000");
});
