import { useState, useEffect, useRef } from 'react';
import styles from './addOffice.module.css';
import { UseContext } from '../../context';
import { useNavigate } from 'react-router-dom';

const AddOffice = () => {
	const [name, setName] = useState('');
	const [fileType, setFileType] = useState([]);
	const [file, setFile] = useState(null);
	const [fileName, setFileName] = useState('Choose Office Icon');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const navigate = useNavigate();
	const fileInputRef = useRef();

	const { isAuthenticated, addOffice, loading, isAdmin, toast, fileTypes } =
		UseContext();

	const handleFileChange = e => {
		const selected = e.target.files[0];
		setFile(selected);
		setFileName(selected?.name || 'Choose Office Icon');
	};

	const handleSubmit = async e => {
		e.preventDefault();

		setIsSubmitting(true);
		try {
			if (!name || fileType.length === 0 || !file) {
				toast.error('Please fill all fields and choose a file');
				return;
			}

			const formData = new FormData();
			formData.append('officeName', name);
			formData.append('pic', file);
			fileType.forEach(type => formData.append('fileTypes', type));

			await addOffice(formData);

			setName('');
			setFileType([]);
			setFile(null);
			setFileName('Choose Office Icon');
		} catch (err) {
			console.error(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	useEffect(() => {
		if (!loading && !isAuthenticated && !isAdmin) {
			navigate('/login', { replace: true });
		}
	}, [isAuthenticated, loading, navigate, isAdmin]);

	return (
		<div className={styles.card}>
			<h1 className={styles.title}>Add Office</h1>

			<form className={styles.form} onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Name"
					className={styles.name}
					required
					value={name}
					onChange={e => setName(e.target.value)}
				/>

				<div
					className={styles.customFile}
					onClick={() => fileInputRef.current?.click()}
				>
					<i className={`fas fa-file ${styles.fileLabel}`}></i>
					<label htmlFor="file-upload" className={styles.fileLabel}>
						{fileName}
					</label>
					<input
						id="file-upload"
						type="file"
						className={styles.fileInput}
						onChange={handleFileChange}
						ref={fileInputRef}
						required
					/>
				</div>

				<div className={styles.fileTypeSelection}>
					<label className={styles.fileTypeLabel}>
						Allowed File Types:
					</label>
					<div className={styles.fileTypeContainer}>
						{fileTypes &&
							Array.isArray(fileTypes.data) &&
							fileTypes.data.length > 0 &&
							fileTypes.data[0].name?.flat().map(type => (
								<label
									key={type}
									className={styles.fileTypeOption}
								>
									<input
										type="checkbox"
										value={type}
										checked={fileType.includes(type)}
										onChange={e => {
											const value = e.target.value;
											setFileType(prev =>
												prev.includes(value)
													? prev.filter(
															ft => ft !== value
													  )
													: [...prev, value]
											);
										}}
									/>
									{type}
								</label>
							))}
					</div>
				</div>

				<button type="submit" className={styles.button}>
					<i className="fas fa-upload"></i>
					{isSubmitting ? 'Uploading...' : 'Upload'}
				</button>
			</form>
		</div>
	);
};

export default AddOffice;
