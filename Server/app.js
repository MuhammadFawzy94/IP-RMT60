if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const PublicController = require("./controllers/PublicController");
const UserController = require("./controllers/UserController");
const Authorization = require("./middlewares/authorization");
const Authentication = require("./middlewares/authentication");
const MechanicController = require("./controllers/MechanicController");
const PostController = require("./controllers/PostController");
const errorHandler = require("./middlewares/errorHandler");
const OrderController = require("./controllers/OrderController");
const Order = require("./models/Order");
const { geminiApi } = require("./helpers/gemini"); 
const PaymentController = require("./controllers/PaymentController");



// Test Gemini connection

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/gemini", async (req, res) => {
  const {prompt} = req.query;
  // const  prompt  = `Solusi motor mogok`;
  
    const geminiText = await geminiApi({ 
      prompt
    });

    // const [geminiText] = await Promise.all([
    //   geminiApi({prompt})
    // ])
    console.log(geminiText);
    res.send({ 
      gemini: geminiText
    });
})

// Tambahkan endpoint untuk Gemini API dengan query parameter
app.get("/api/gemini", async (req, res) => {
  try {
    const { prompt } = req.query;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        message: "Prompt is required" 
      });
    }
    
    console.log("Attempting to process prompt:", prompt);
    const response = await geminiApi({ prompt });
    
    console.log("Response received, sending back to client");
    res.status(200).json({ 
      success: true,
      data: response 
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get response from Gemini API", 
      error: error.message 
    });
  }
});

app.get("/", PublicController.getAllMechanics);
app.get("/pubposts", PublicController.getAllPosts);
app.post("/register", UserController.register);
app.post("/login", UserController.login);
app.post("/googleLogin", UserController.googleLogin);




app.get(
  "/home",
  Authentication.AuthenticationUser,
  PublicController.getAllMechanics
);
app.get("/packages", Authentication.AuthenticationUser,PublicController.getPackage);
app.get(
  "/postsUser",
  Authentication.AuthenticationUser,
  PublicController.getAllPosts
);
app.get(
  "/mechanics/:id",
  Authentication.AuthenticationUser,
  PublicController.getMechanicById
);
app.post(
  "/orders",
  Authentication.AuthenticationUser,
  OrderController.createOrder
);
app.get(
  "/orders",
  Authentication.AuthenticationUser,
  OrderController.getAllOrders
);
app.post(
  "/payment/initiate",
  Authentication.AuthenticationUser,
  PaymentController.initiatePayment
);

// Payment notification webhook from Midtrans
app.post("/payment/notification", PaymentController.handlePaymentNotification);

// Get payment status endpoint
app.get(
  "/orders/:id/payment-status",
  Authentication.AuthenticationUser,
  PaymentController.getPaymentStatus
);
app.delete(
  "/orders/:id",
  Authentication.AuthenticationUser,
  OrderController.deleteOrder
);
app.put(
  "/orders/:id",
  Authentication.AuthenticationUser,
  OrderController.updateOrder
);
app.post(
  "/orders/complete/:id",
  Authentication.AuthenticationUser,
  OrderController.completeOrder
);

app.post(
  "/orders/donepayment/:id",
  Authentication.AuthenticationUser,
  PaymentController.donePayment
);







// app.post("/mechanicsLogin", MechanicController.mechanicLogin);
// app.get(
//   "/dashboard",
//   Authentication.Authentication,
//   Authorization.mechanicOnlyPostAccess,
//   PostController.getAllPosts
// );
// app.post(
//   "/posts",
//   Authentication.Authentication,
//   Authorization.mechanicOnlyPostAccess,
//   PostController.create
// );
// app.put(
//   "/posts/:id",
//   Authentication.Authentication,
//   Authorization.mechanicOnlyPostAccess,
//   Authorization.mechanicPostOwnership,
//   PostController.update
// );
// app.delete(
//   "/posts/:id",
//   Authentication.Authentication,
//   Authorization.mechanicOnlyPostAccess,
//   Authorization.mechanicPostOwnership,
//   PostController.delete
// );

app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
