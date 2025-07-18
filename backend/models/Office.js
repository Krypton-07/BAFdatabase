import mongoose from 'mongoose';

const fileDataSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		reference: {
			type: String,
		},
		subject: {
			type: String,
		},
		img: {
			type: String,
		},
		part_no: {
			type: String,
		},
		qty: {
			type: String,
		},
		itemSN: {
			type: String,
		},
		catRS: {
			type: String,
		},
		catRD: {
			type: String,
		},
		unsvc: {
			type: String,
		},
		svc: {
			type: String,
		},
		remarks: {
			type: String,
		},
		fileType: {
			type: String,
		},
		officeName: {
			type: String,
		},
	},
	{ _id: false }
);

const OfficeSchema = new mongoose.Schema({
	officeName: {
		type: String,
		required: true,
	},
	img: {
		type: String,
		default:
			'https://res.cloudinary.com/dn0e5hdmw/image/upload/v1751453006/nfnvr3jje6kfakg0q4no.png',
	},
	fileTypes: {
		type: [String],
		required: true,
	},
	files: {
		type: [fileDataSchema],
		default: [],
	},
});

const Office = mongoose.model('Office', OfficeSchema);

export default Office;
