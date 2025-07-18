import mongoose from 'mongoose';

const addFileTypeSchema = new mongoose.Schema({
	name: [
		{
			type: [String],
			required: true,
		},
	],
});

const FileType = mongoose.model('FileType', addFileTypeSchema);

export default FileType;
