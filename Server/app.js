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

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", PublicController.getAllMechanics);
app.get("/pubposts", PublicController.getAllPosts);
app.post("/register", UserController.register);
app.post("/login", UserController.login);

app.get(
  "/home",
  Authentication.AuthenticationUser,
  PublicController.getAllMechanics
);
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
  OrderController.donePayment
);

app.post("/mechanicsLogin", MechanicController.mechanicLogin);
app.get(
  "/dashboard",
  Authentication.Authentication,
  Authorization.mechanicOnlyPostAccess,
  PostController.getAllPosts
);
app.post(
  "/posts",
  Authentication.Authentication,
  Authorization.mechanicOnlyPostAccess,
  PostController.create
);
app.put(
  "/posts/:id",
  Authentication.Authentication,
  Authorization.mechanicOnlyPostAccess,
  Authorization.mechanicPostOwnership,
  PostController.update
);
app.delete(
  "/posts/:id",
  Authentication.Authentication,
  Authorization.mechanicOnlyPostAccess,
  Authorization.mechanicPostOwnership,
  PostController.delete
);

app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
