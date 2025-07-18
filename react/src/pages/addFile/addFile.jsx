import { useEffect, useState, useRef } from 'react';
import styles from './addFile.module.css';
import { useNavigate } from 'react-router-dom';
import { UseContext } from '../../context';

const AddFile = () => {
	const [name, setName] = useState('');
	const [remarks, setRemarks] = useState('');

	const [part_no, setPart_No] = useState('');
	const [qty, setQty] = useState('');
	const [itemSN, setItemSN] = useState('');
	const [catRS, setCatRS] = useState('');
	const [catRD, setCatRD] = useState('');
	const [unsvc, setUnsvc] = useState('');
	const [svc, setSvc] = useState('');

	const [reference, setReference] = useState('');
	const [subject, setSubject] = useState('');
	const [file, setFile] = useState(null);
	const [fileName, setFileName] = useState('Choose File');

	const [fileType, setFileType] = useState('');
	const [officeId, setOfficeId] = useState('');

	const [fileTypeOptions, setFileTypeOptions] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isFileTypeSelectionOpen, setIsFileTypeSelectionOpen] =
		useState(false);
	const [isDataEntering, setIsDataEntering] = useState(false);

	const { isAdmin, addFile, isAuthenticated, loading, offices } =
		UseContext();
	const navigate = useNavigate();
	const fileInputRef = useRef();

	useEffect(() => {
		if (!loading && !isAuthenticated && !isAdmin) {
			navigate('/login', { replace: true });
		}
	}, [isAuthenticated, loading, isAdmin, navigate]);

	const handleFileChange = e => {
		const selected = e.target.files[0];
		setFile(selected);
		setFileName(selected?.name || 'Choose File');
	};

	const handleSettingOfficeId = officeid => {
		setOfficeId(officeid);
		const office = offices.find(office => office._id === officeid);
		setFileTypeOptions(office?.fileTypes);
		setIsFileTypeSelectionOpen(true);
	};

	const handleSubmit = async e => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const formData = new FormData();

			if (fileType !== 'PRESENT STOCK') {
				formData.append('name', name);
				formData.append('reference', reference);
				formData.append('subject', subject);
				formData.append('remarks', remarks);
				formData.append('image', file);

				await addFile(officeId, fileType, formData);

				setName('');
				setReference('');
				setSubject('');
				setRemarks('');
				setFile(null);
				setOfficeId('');
				setFileType('');
				setFileName('Choose File');
				if (fileInputRef.current) fileInputRef.current.value = '';
			} else {
				formData.append('name', name);
				formData.append('remarks', remarks);
				formData.append('part_no', part_no);
				formData.append('qty', qty);
				formData.append('itemSN', itemSN);
				formData.append('catRS', catRS);
				formData.append('catRD', catRD);
				formData.append('unsvc', unsvc);
				formData.append('svc', svc);

				await addFile(officeId, fileType, formData);

				setName('');
				setRemarks('');
				setPart_No('');
				setQty('');
				setItemSN('');
				setCatRS('');
				setCatRD('');
				setUnsvc('');
				setSvc('');
				setOfficeId('');
				setFileType('');
				setFileName('Choose File');
			}
		} catch (err) {
			console.error('Upload error:', err);
		} finally {
			setIsDataEntering(false);
			setIsFileTypeSelectionOpen(false);
			setIsSubmitting(false);
		}
	};

	useEffect(() => {
		const handleUnload = () => {
			setIsFileTypeSelectionOpen(false);
		};

		window.addEventListener('beforeunload', handleUnload);

		return () => {
			window.removeEventListener('beforeunload', handleUnload);
		};
	}, []);

	return (
		<div className={styles.card}>
			<h1 className={styles.title}>Add File</h1>
			<form className={styles.form} onSubmit={handleSubmit}>
				{isDataEntering ? (
					<>
						<div className={styles.divider}>
							<i
								className="fas fa-angle-down"
								onClick={() => {
									setIsDataEntering(false);
								}}
							></i>
						</div>

						{fileType === 'PRESENT STOCK' ? (
							<>
								<input
									type="text"
									placeholder="Name"
									className={styles.input}
									required
									value={name}
									onChange={e => setName(e.target.value)}
								/>
								<input
									type="text"
									placeholder="Part No."
									className={styles.input}
									value={part_no}
									onChange={e => setPart_No(e.target.value)}
								/>
								<input
									type="text"
									placeholder="Quantity"
									className={styles.input}
									value={qty}
									onChange={e => setQty(e.target.value)}
								/>
								<textarea
									type="text"
									placeholder="Item S/N"
									className={styles.input}
									value={itemSN}
									onChange={e => setItemSN(e.target.value)}
								/>
								<input
									type="text"
									placeholder="Cat RS"
									className={styles.input}
									value={catRS}
									onChange={e => setCatRS(e.target.value)}
								/>
								<input
									type="text"
									placeholder="Cat RD"
									className={styles.input}
									value={catRD}
									onChange={e => setCatRD(e.target.value)}
								/>
								<input
									type="text"
									placeholder="Unsvc"
									className={styles.input}
									value={unsvc}
									onChange={e => setUnsvc(e.target.value)}
								/>
								<input
									type="text"
									placeholder="Svc"
									className={styles.input}
									value={svc}
									onChange={e => setSvc(e.target.value)}
								/>{' '}
								<input
									type="text"
									placeholder="Remarks"
									className={styles.input}
									value={remarks}
									onChange={e => setRemarks(e.target.value)}
								/>
							</>
						) : (
							<>
								<input
									type="text"
									placeholder="Name"
									className={styles.input}
									required
									value={name}
									onChange={e => setName(e.target.value)}
								/>
								<input
									type="text"
									placeholder="Reference"
									className={styles.input}
									value={reference}
									onChange={e => setReference(e.target.value)}
								/>
								<input
									type="text"
									placeholder="Subject"
									className={styles.input}
									value={subject}
									onChange={e => setSubject(e.target.value)}
								/>
								<input
									type="text"
									placeholder="Remarks"
									className={styles.input}
									value={remarks}
									onChange={e => setRemarks(e.target.value)}
								/>

								<div
									className={styles.customFile}
									onClick={() =>
										fileInputRef.current?.click()
									}
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
										className={styles.fileInput}
										onChange={handleFileChange}
										ref={fileInputRef}
										required
									/>
								</div>
							</>
						)}
					</>
				) : !isFileTypeSelectionOpen ? (
					<section className={styles.selectionArea}>
						<p className={styles.radioLabel}>Select Office:</p>
						<div className={styles.officesList}>
							{offices?.map((option, index) => (
								<label
									key={index}
									className={styles.radioOption}
								>
									<input
										type="radio"
										name="office"
										value={option._id}
										checked={officeId === option._id}
										onChange={() =>
											handleSettingOfficeId(option._id)
										}
										required
									/>
									{option.officeName}
								</label>
							))}
						</div>
					</section>
				) : (
					<>
						<div className={styles.divider}>
							<i
								className="fas fa-angle-down"
								onClick={() => {
									setIsFileTypeSelectionOpen(false);
								}}
							></i>
						</div>

						<section className={styles.selectionArea}>
							<p className={styles.radioLabel}>
								Select File Type:
							</p>
							<div className={styles.fileTypesList}>
								{fileTypeOptions.map(option => (
									<label
										key={option}
										className={styles.radioOption}
									>
										<input
											type="radio"
											name="fileType"
											value={option}
											checked={fileType === option}
											onChange={e => {
												setFileType(e.target.value);
												setIsDataEntering(true);
											}}
											required
										/>
										{option}
									</label>
								))}
							</div>
						</section>
					</>
				)}
				<button
					type="submit"
					className={styles.button}
					disabled={isSubmitting}
				>
					<i className="fas fa-upload"></i>
					{isSubmitting ? 'Uploading...' : 'Upload'}
				</button>
			</form>
		</div>
	);
};

export default AddFile;
