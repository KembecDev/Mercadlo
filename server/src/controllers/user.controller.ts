import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { validateRegisterInput, validateLoginInput } from "../validators/user.validator";
import useCreateToken from "../composables/useCreateToken";

export class UserController {
	// Register a new user
	public static async register(req: Request, res: Response) {
		// Validate request body
		const { errors, isValid } = validateRegisterInput(req.body);
		if (!isValid) {
			return res.status(400).json(errors);
		}

		// Check if the email is already in use
		const emailExists = await User.findOne({ email: req.body.email });
		if (emailExists) {
			errors.email = "Email already exists";
			return res.status(400).json(errors);
		}

		// Hash the password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(req.body.password, salt);

		// Create a new user

		try {
			const newUser = new User({
				name: req.body.name,
				email: req.body.email,
				password: hashedPassword,
			});
			// Save the user to the database
			const savedUser = await newUser.save();
			res.status(201).json({ name: savedUser.name, email: savedUser.email });
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Error registering the user" });
		}
	}

	// Login a user
	public static async login(req: Request, res: Response) {
		// Validate request body
		const { errors, isValid } = validateLoginInput(req.body);
		if (!isValid) {
			return res.status(400).json(errors);
		}

		// Check if the email exists
		const user = await User.findOne({ email: req.body.email });
		if (!user) {
			return res.status(404).json({ message: "Invalid email or password" });
		}

		// Check if the password is correct
		const isMatch = await bcrypt.compare(req.body.password, user.password);
		if (!isMatch) {
			return res.status(404).json({ message: "Invalid email or password" });
		}

		// Create a JWT
		const token = useCreateToken(user);
		const time = 6 * 60 * 60 * 1000;
		res.cookie("token", token, { httpOnly: true, maxAge: time });
		res.cookie("_token", "_", { maxAge: time });

		// Return the token
		const data = {
			message: "Login successful",
			_id: user._id,
			name: user.name,
			email: user.email,
		}
		res.status(200).json(data);
	}
	// Logout a user
	public static logout(req: Request, res: Response) {
		res.clearCookie("token");
		res.clearCookie("_token");
		res.status(200).json({ message: "Logout successful" });
	}
}
