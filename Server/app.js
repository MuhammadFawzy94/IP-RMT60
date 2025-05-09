if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");

const PublicController = require("./controllers/PublicController");
const UserController = require("./controllers/UserController");
const MechanicController = require("./controllers/MechanicController");
const PostController = require("./controllers/PostController");
const OrderController = require("./controllers/OrderController");
const PaymentController = require("./controllers/PaymentController");

const Authentication = require("./middlewares/authentication");
const Authorization = require("./middlewares/authorization");
const errorHandler = require("./middlewares/errorHandler");
const { geminiApi } = require("./helpers/gemini");

const app = express();
const PORT = process.env.PORT || 3000;

// === CORS Setup ===
const allowedOrigins = [
  "https://e-mechanic-d1526.web.app", // Production frontend (Firebase)
  "http://localhost:5173"             // Local frontend (Vite)
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Optional: If using cookies/auth headers
  })
);

// === Body Parsers ===
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// === Public Routes ===
app.get("/", PublicController.getAllMechanics);
app.get("/pubposts", PublicController.getAllPosts);
app.post("/register", UserController.register);
app.post("/login", UserController.login);
app.post("/googleLogin", UserController.googleLogin);

// === Gemini AI Routes ===
app.get("/gemini", async (req, res) => {
  const { prompt } = req.query;
  try {
    const geminiText = await geminiApi({ prompt });
    res.send({ gemini: geminiText });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Failed to get Gemini response" });
  }
});

app.get("/api/gemini", async (req, res) => {
  try {
    const { prompt } = req.query;
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }
    const response = await geminiApi({ prompt });
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get response from Gemini API",
      error: error.message
    });
  }
});

// === Authenticated Public Data ===
app.get("/home", Authentication.AuthenticationUser, PublicController.getAllMechanics);
app.get("/packages", Authentication.AuthenticationUser, PublicController.getPackage);
app.get("/postsUser", Authentication.AuthenticationUser, PublicController.getAllPosts);
app.get("/mechanics/:id", Authentication.AuthenticationUser, PublicController.getMechanicById);

// === Orders ===
app.post("/orders", Authentication.AuthenticationUser, OrderController.createOrder);
app.get("/orders", Authentication.AuthenticationUser, OrderController.getAllOrders);
app.get("/orders/:id/payment-status", Authentication.AuthenticationUser, PaymentController.getPaymentStatus);
app.delete("/orders/:id", Authentication.AuthenticationUser, OrderController.deleteOrder);
app.put("/orders/:id", Authentication.AuthenticationUser, OrderController.updateOrder);
app.post("/orders/complete/:id", Authentication.AuthenticationUser, OrderController.completeOrder);
app.post("/orders/donepayment/:id", Authentication.AuthenticationUser, PaymentController.donePayment);

// === Payments ===
app.post("/payment/initiate", Authentication.AuthenticationUser, PaymentController.initiatePayment);
app.post("/payment/notification", PaymentController.handlePaymentNotification);

// === (Optional) Mechanic-only routes ===
// app.post("/mechanicsLogin", MechanicController.mechanicLogin);
// app.get("/dashboard", Authentication.Authentication, Authorization.mechanicOnlyPostAccess, PostController.getAllPosts);
// app.post("/posts", Authentication.Authentication, Authorization.mechanicOnlyPostAccess, PostController.create);
// app.put("/posts/:id", Authentication.Authentication, Authorization.mechanicOnlyPostAccess, Authorization.mechanicPostOwnership, PostController.update);
// app.delete("/posts/:id", Authentication.Authentication, Authorization.mechanicOnlyPostAccess, Authorization.mechanicPostOwnership, PostController.delete);

// === Global Error Handler ===
app.use(errorHandler);

// === Start Server ===
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});