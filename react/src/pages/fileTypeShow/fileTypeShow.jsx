import { useState, useEffect, useRef } from 'react';
import { UseContext } from '../../context';
import styles from './fileTypeShow.module.css';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import bafLogo from '../../assets/BAF_logo.png';

const FileTypeShow = () => {
	const [fileType, setFileType] = useState([]);
	const [officeName, setOfficeName] = useState('');
	const [officeImg, setOfficeImg] = useState(null);
	const [panelOpen, setPanelOpen] = useState(false);
	const [file, setFile] = useState(null);
	const [fileName, setFileName] = useState('Choose File');
	const [editedName, setEditedName] = useState('');
	const [editedFileType, setEditedFileType] = useState([]);
	const [isDialogueOpen, setIsDialogueOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [hasInit, setHasInit] = useState(false);

	const {
		offices,
		isAuthenticated,
		loading,
		isAdmin,
		deleteOffice,
		fileTypes,
		updateOffice,
	} = UseContext();

	const { name } = useParams();
	const navigate = useNavigate();

	const fileInputRef = useRef();

	useEffect(() => {
		if (!loading && !isAuthenticated && !isAdmin)
			navigate('/login', { replace: true });
	}, [isAuthenticated, loading, isAdmin, navigate]);

	useEffect(() => {
		const office = offices?.find(e => e.officeName === name);
		if (office) {
			setFileType(office.fileTypes);
			setOfficeName(office.officeName);
			setOfficeImg(office.img);
		}
	}, [offices, name]);

	useEffect(() => {
		if (fileType.length && !hasInit) {
			setEditedFileType(fileType);
			setHasInit(true);
		}
	}, [fileType, hasInit]);

	const handleDelete = () => deleteOffice(name);

	const handleFileChange = e => {
		const selected = e.target.files[0];
		setFile(selected);
		setFileName(selected?.name || 'Choose File');
	};

	const handleEditedDataUpload = async () => {
		setIsSubmitting(true);
		const formData = new FormData();
		if (file) formData.append('editedImage', file);
		formData.append('editedOfficeName', editedName || officeName);
		editedFileType.forEach(type => formData.append('editedFileType', type));
		await updateOffice(name, formData);
		setIsSubmitting(false);
		setIsDialogueOpen(false);
		if (editedName !== '') {
			navigate(`/office/${editedName}`);
		}
	};

	return (
		<>
			<div className={styles.container}>
				<div
					className={styles.section1}
					onMouseEnter={() => setPanelOpen(true)}
					onMouseLeave={() => setPanelOpen(false)}
				>
					<header className={styles.header}>
						<img
							src={bafLogo}
							className={styles.logo}
							alt="BAF Logo"
						/>
						<h1 className={styles.title}>{officeName}</h1>
						<img
							src={officeImg}
							className={styles.logo2}
							alt="BAF Logo"
						/>
						{isAdmin && (
							<div
								className={
									panelOpen ? styles.panel : styles.hidden
								}
							>
								<i
									className="fas fa-edit"
									title="Edit"
									onClick={() =>
										setIsDialogueOpen(!isDialogueOpen)
									}
								></i>
								<i
									className="fas fa-trash"
									title="Delete"
									onClick={handleDelete}
								></i>
							</div>
						)}
					</header>

					<hr
						style={{
							width: '100%',
							height: '5px',
							background: 'white',
							border: 'none',
							marginTop: '5px',
						}}
					/>
				</div>

				<div className={styles.section2}>
					<div className={styles.subSection}>
						{fileType?.length ? (
							fileType.map((file, i) => (
								<NavLink
									key={i}
									to={`/${name}/file/${file}`}
									className={styles.fileNameCard}
								>
									<h2>{file}</h2>
								</NavLink>
							))
						) : (
							<p className={styles.noFiles}>No files available</p>
						)}
					</div>
				</div>
			</div>

			{isDialogueOpen && isAdmin && (
				<>
					<div
						className={styles.blurer}
						onClick={() => setIsDialogueOpen(false)}
					/>
					<div className={styles.dialog}>
						<h1 className={styles.dialogTitle}>Edit Office</h1>
						<form
							className={styles.form}
							onSubmit={e => {
								e.preventDefault();
								handleEditedDataUpload();
							}}
						>
							<input
								type="text"
								placeholder={officeName}
								value={editedName}
								onChange={e => setEditedName(e.target.value)}
								className={styles.name}
							/>
							<div
								className={styles.customFile}
								onClick={() => fileInputRef.current?.click()}
							>
								<i
									className={`fas fa-file ${styles.fileLabel}`}
								></i>
								<label
									htmlFor="file-upload"
									className={styles.fileLabel}
								>
									{fileName}
								</label>
								<input
									id="file-upload"
									type="file"
									ref={fileInputRef}
									onChange={handleFileChange}
									className={styles.fileInput}
								/>
							</div>

							<div className={styles.fileTypeSelection}>
								<label className={styles.fileTypeLabel}>
									Allowed File Types:
								</label>
								<div className={styles.fileTypeContainer}>
									{fileTypes?.data?.[0]?.name
										?.flat()
										.map((type, i) => (
											<label
												key={i}
												className={
													styles.fileTypeOption
												}
											>
												<input
													type="checkbox"
													value={type}
													checked={editedFileType.includes(
														type
													)}
													onChange={e => {
														const value =
															e.target.value;
														setEditedFileType(
															prev =>
																prev.includes(
																	value
																)
																	? prev.filter(
																			x =>
																				x !==
																				value
																	  )
																	: [
																			...prev,
																			value,
																	  ]
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
				</>
			)}
		</>
	);
};

export default FileTypeShow;
