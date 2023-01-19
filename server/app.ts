import * as dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { handle404 } from "./src/middleware/handle404";
import { handleCORS } from "./src/middleware/handleCORS";
import { handleErrors } from "./src/middleware/handleErrors";
import { listRoutes } from "./src/routes/list.routes";
import { productRoutes } from "./src/routes/product.routes";
import { userRoutes } from "./src/routes/user.routes";

dotenv.config();
const result = dotenv.config();

if (result.error) {
	throw result.error;
}

export const app = express();

// Connect to the database
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URI ?? "");

// Enable body parser to parse request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Enable CORS
app.use(handleCORS);

// Use routes
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/lists", listRoutes);

// Handle invalid routes
app.use(handle404);

// Handle errors
app.use(handleErrors);

if (process.env.NODE_ENV !== "test") {
	app.listen(process.env.NODE_PORT, () => console.log(`Listening on port ${process.env.NODE_PORT}`));
}
