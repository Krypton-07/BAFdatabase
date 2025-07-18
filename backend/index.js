import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import nodemailer from 'nodemailer';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Models
import Otp from './models/otp.js';
import User from './models/User.js';
import Office from './models/Office.js';
import FileType from './models/FileType.js';

dotenv.config();

const app = express();
const secretKey = process.env.SECRET_KEY;

cloudinary.v2.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
	cloudinary: cloudinary.v2,
	params: {
		folder: 'baf_records',
		allowed_formats: ['jpg', 'png', 'jpeg', 'ico'],
	},
});
const upload = multer({ storage });

const Transporter = () => {
	return nodemailer.createTransport({
		service: 'gmail',
		port: 465,
		secure: true,
		pool: true,
		maxConnections: 1,
		auth: {
			user: process.env.EMAIL,
			pass: process.env.APP_PASS,
		},
	});
};

app.use(
	cors({
		origin: ['http://192.168.31.160:5173'],
		credentials: true,
	})
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
	res.set('Cache-Control', 'no-store');
	next();
});

// Error Handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: 'Internal server error' });
});

// DB Connect
mongoose
	.connect('mongodb://192.168.31.160:27017/database')
	.then(() => console.log('MongoDB connected successfully'))
	.catch(err => console.error('MongoDB connection failed', err));

/* =======================
      Utility Routes
======================= */

// Register
app.post('/register', async (req, res) => {
	const { username, email, password, role, officeAccess, otp } = req.body;

	if (!username || !email || !password) {
		return res.status(400).json({ message: 'Missing required fields' });
	}

	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(409).json({ message: 'User already exists' });
		}

		// Phase 1: OTP Request
		if (!otp) {
			const existingOtpForSameUser = await Otp.findOne({ email });
			if (existingOtpForSameUser) {
				await Otp.deleteOne({ email });
			}

			const generateOTP = Math.floor(
				100000 + Math.random() * 900000
			).toString();

			await Otp.create({
				email,
				otp: generateOTP,
				createdAt: new Date(),
			});

			const mailOptions = {
				from: `"BAF Records" <${process.env.EMAIL}>`,
				to: email,
				subject: 'BAF OTP Verification – Secure Access Code',
				text: `Your OTP is ${generateOTP}. Valid for 3 minutes. Do not share this code.`,
				html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .logo { height: 60px; }
            .otp-box { 
              background: #f0f7ff; 
              padding: 15px; 
              text-align: center; 
              font-size: 24px; 
              font-weight: bold; 
              margin: 20px 0; 
              border: 1px dashed #005691;
              border-radius: 4px;
            }
            .footer { 
              margin-top: 30px; 
              padding-top: 15px; 
              border-top: 1px solid #ddd; 
              font-size: 12px; 
              color: #777; 
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="https://baf-records.netlify.app/assets/BAF_logo-DtN10mrn.png" alt="BAF Logo" class="logo">
            <h2 style="color: #005691;">Bangladesh Air Force</h2>
            <p style="color: #666;">Official Communication</p>
          </div>

          <h3 style="color: #003d66;">OTP Verification Code</h3>
          <p>Use this code to complete your registration:</p>
          
          <div class="otp-box">${generateOTP}</div>

          <p style="font-size: 14px; color: #666;">
            <strong>Expires in 3 minutes 30 seconds</strong><br>
            Do not share this code with anyone.
          </p>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Bangladesh Air Force</p>
            <p>Dhaka Cantonment, Dhaka-1206, Bangladesh</p>
            <p>This is an automated message - please do not reply</p>
          </div>
        </body>
        </html>
        `,
			};

			await Transporter.sendMail(mailOptions);
			return res.status(200).json({ message: 'OTP sent' });
		}

		// Phase 2: Registration
		const otpDetails = await Otp.findOne({ email });
		if (!otpDetails || otpDetails.otp !== otp) {
			return res.status(400).json({ message: 'Invalid or expired OTP' });
		}

		const isExpired =
			Date.now() - new Date(otpDetails.createdAt).getTime() > 210 * 1000;
		if (isExpired) {
			return res.status(400).json({ message: 'OTP expired' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new User({
			username,
			email,
			password: hashedPassword,
			role,
			officeAccess,
		});

		await newUser.save();
		res.status(201).json({ message: 'User registered successfully' });
	} catch (error) {
		console.error('Registration error:', error);
		res.status(500).json({ message: 'Registration failed' });
	}
});

// Login
app.post('/login', async (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res
			.status(400)
			.json({ message: 'Missing username or password' });
	}

	try {
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: 'Invalid password' });
		}

		const token = jwt.sign({ userId: user._id }, secretKey, {
			expiresIn: '30d',
		});

		res.cookie('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
			maxAge: 30 * 24 * 60 * 60 * 1000,
		});

		res.status(200).json({ message: 'Login successful' });
	} catch {
		res.status(500).json({ message: 'Login failed' });
	}
});

// Auth Check
app.get('/checkAuth', async (req, res) => {
	const token = req.cookies.token;
	if (!token) return res.status(401).json({ message: 'Unauthorized' });

	try {
		const decoded = jwt.verify(token, secretKey);
		const user = await User.findById(decoded.userId);
		if (!user) return res.status(401).json({ message: 'User not found' });

		res.status(200).json({ user });
	} catch {
		res.status(401).json({ message: 'Invalid or expired token' });
	}
});

// Logout
app.post('/logout', (req, res) => {
	res.clearCookie('token', {
		httpOnly: true,
		secure: true,
		sameSite: 'None',
	});

	res.status(200).json({ message: 'Logged out successfully' });
});

/* =======================
      Office Routes
======================= */

app.post('/addOffice', upload.single('pic'), async (req, res) => {
	const { officeName, fileTypes } = req.body;

	try {
		let file = null;
		let image = null;

		if (req.file) {
			file = await cloudinary.v2.uploader.upload(req.file.path);
			image = file.secure_url;
		}

		const office = new Office({
			officeName,
			img: image,
			fileTypes,
			files: [],
		});

		await office.save();
		res.status(201).json({ message: 'Office added successfully' });
	} catch {
		res.status(500).json({ message: 'Failed to add office' });
	}
});

app.put(
	'/updateOffice/:officeName',
	upload.single('editedImage'),
	async (req, res) => {
		const { officeName } = req.params;
		const { editedFileType, editedOfficeName } = req.body;

		try {
			const office = await Office.findOne({ officeName });

			if (!office) {
				return res.status(404).json({ message: 'Office not found' });
			}

			if (req.file) {
				const file = await cloudinary.v2.uploader.upload(req.file.path);
				office.img = file.secure_url;
			}

			office.officeName = editedOfficeName;
			office.fileTypes = editedFileType;
			office.files = office.files.filter(file =>
				editedFileType.includes(file.fileType)
			);

			await office.save();
			res.status(200).json({ message: 'Office updated successfully' });
		} catch {
			res.status(500).json({ message: 'Failed to update office' });
		}
	}
);

app.get('/getOffices', async (req, res) => {
	try {
		const offices = await Office.find({});
		res.status(200).json(offices);
	} catch {
		res.status(500).json({ message: 'Failed to get offices' });
	}
});

app.delete('/deleteOffice/:officeName', async (req, res) => {
	const { officeName } = req.params;

	if (!officeName) {
		return res.status(400).json({ message: 'Office name required' });
	}

	try {
		const allUsers = await User.find({});

		let newAccessibleOffices = [];

		allUsers.forEach(user => {
			const accessibleOffices = user.officeAccess.filter(
				office => office !== officeName
			);
			newAccessibleOffices.push(...accessibleOffices);
		});

		await User.updateMany({}, { officeAccess: newAccessibleOffices });

		await Office.deleteOne({ officeName });

		res.status(200).json({ message: 'Office deleted successfully' });
	} catch {
		res.status(500).json({ message: 'Failed to delete office' });
	}
});

/* =======================
    File Type Routes
======================= */

app.put('/addFileType', async (req, res) => {
	try {
		const { name } = req.body;
		await FileType.findOneAndUpdate(
			{},
			{ $addToSet: { name } },
			{ new: true, upsert: true }
		);
		res.status(200).json({ message: 'File type added successfully' });
	} catch {
		res.status(500).json({ message: 'Failed to add file type' });
	}
});

app.get('/getFileTypes', async (req, res) => {
	try {
		const data = await FileType.find();
		res.status(200).json({ data });
	} catch {
		res.status(500).json({ message: 'Failed to get file types' });
	}
});

/* =======================
        File Routes
======================= */

app.put(
	'/addFile/:officeId/:fileType',
	upload.single('image'),
	async (req, res) => {
		const { officeId, fileType } = req.params;
		const {
			name,
			reference,
			subject,
			remarks,
			part_no,
			qty,
			itemSN,
			catRS,
			catRD,
			unsvc,
			svc,
		} = req.body;

		try {
			const office = await Office.findById(officeId);
			if (!office)
				return res.status(404).json({ message: 'Office not found' });

			if (fileType === 'PRESENT STOCK') {
				office.files.push({
					name,
					part_no,
					qty,
					itemSN,
					catRS,
					catRD,
					unsvc,
					svc,
					remarks,
					fileType,
					officeName: office.officeName,
				});
			} else {
				const file = await cloudinary.v2.uploader.upload(req.file.path);
				office.files.push({
					name,
					reference,
					subject,
					img: file.secure_url,
					remarks,
					fileType,
					officeName: office.officeName,
				});
			}

			await office.save();
			res.status(200).json({ message: 'File added successfully' });
		} catch {
			res.status(500).json({ message: 'Failed to add file' });
		}
	}
);

app.put(
	'/updateFile/:officeName/:fileType/:fileName',
	upload.single('editedImgFile'),
	async (req, res) => {
		try {
			const { officeName, fileType, fileName } = req.params;
			const {
				name,
				reference,
				subject,
				remarks,
				part_no,
				qty,
				itemSN,
				catRS,
				catRD,
				unsvc,
				svc,
			} = req.body;

			const office = await Office.findOne({ officeName });
			const file = office?.files?.find(
				file => file.name === fileName && file.fileType === fileType
			);

			if (!file)
				return res.status(404).json({ message: 'File not found' });

			if (fileType === 'PRESENT STOCK') {
				Object.assign(file, {
					name,
					part_no,
					qty,
					itemSN,
					catRS,
					catRD,
					unsvc,
					svc,
					remarks,
				});
			} else {
				if (req.file) {
					const imgFile = await cloudinary.uploader.upload(
						req.file.path
					);
					file.img = imgFile.secure_url;
				}
				Object.assign(file, { name, reference, subject, remarks });
			}

			await office.save();
			res.status(200).json({ message: 'File updated successfully' });
		} catch {
			res.status(500).json({ message: 'Failed to update file' });
		}
	}
);

app.delete('/deleteFile/:officeName/:fileType/:fileName', async (req, res) => {
	const { officeName, fileType, fileName } = req.params;

	try {
		const office = await Office.findOne({ officeName });
		if (!office) {
			console.log('Office not found');
			return res.status(404).json({ message: 'Office not found' });
		}

		const fileIndex = office.files.findIndex(
			file => file.name === fileName && file.fileType === fileType
		);
		if (fileIndex === -1) {
			console.log('File not found');
			return res.status(404).json({ message: 'File not found' });
		}

		office.files.splice(fileIndex, 1);
		await office.save();
		console.log('File deleted successfully');

		res.status(200).json({ message: 'File deleted successfully' });
	} catch (err) {
		console.error('Delete error:', err.message);
		console.log('Params:', req.params);
		res.status(500).json({ message: 'Failed to delete file' });
	}
});

app.get('/getAllFiles', async (req, res) => {
	try {
		const offices = await Office.find({});
		const allFiles = offices.flatMap(office => office.files);
		res.status(200).json(allFiles);
	} catch {
		res.status(500).json({ message: 'Failed to fetch files' });
	}
});

app.get('/getFiles/:officeName/:fileType', async (req, res) => {
	const { officeName, fileType } = req.params;

	try {
		const office = await Office.findOne({ officeName });
		if (!office)
			return res.status(404).json({ message: 'Office not found' });

		const fileData = office.files.filter(
			file => file.fileType === fileType
		);
		res.status(200).json(fileData);
	} catch {
		res.status(500).json({ message: 'Failed to fetch file data' });
	}
});

app.listen(3001, '0.0.0.0', () => {
	console.log('Backend running on port 3001');
});
