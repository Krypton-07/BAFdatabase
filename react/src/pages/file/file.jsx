import styles from './file.module.css';
import { useEffect, useCallback, useState, useRef } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/card/card';
import { UseContext } from '../../context';

const File = () => {
	const [hoveredRow, setHoveredRow] = useState(null);
	const [isDialogueOpen, setIsDialogueOpen] = useState(false);

	const [selectedFileNameForEdit, setSelectedFileNameForEdit] =
		useState(null);

	const [fileName, setFileName] = useState('');
	const [part_no, setPart_No] = useState('');
	const [qty, setQty] = useState('');
	const [itemSN, setItemSN] = useState('');
	const [catRS, setCatRS] = useState('');
	const [catRD, setCatRD] = useState('');
	const [unsvc, setUnsvc] = useState('');
	const [svc, setSvc] = useState('');
	const [remarks, setRemarks] = useState('');
	const [reference, setReference] = useState('');
	const [subject, setSubject] = useState('');
	const [file, setFile] = useState(null);
	const [selectedFileName, setSelectedFileName] = useState('Choose File');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { name, fileType } = useParams();
	const {
		isAuthenticated,
		isAdmin,
		getFileData,
		loading,
		fileData,
		updateFile,
		deleteFile,
	} = UseContext();
	const navigate = useNavigate();
	const fileInputRef = useRef();

	useEffect(() => {
		if (!loading && !isAuthenticated && !isAdmin) {
			navigate('/login', { replace: true });
		}
	}, [isAuthenticated, loading, isAdmin, navigate]);

	const fetch = useCallback(() => {
		if (name && fileType) {
			getFileData(name, fileType);
		}
	}, [name, fileType]);

	useEffect(() => {
		if ((isAuthenticated || isAdmin) && name && fileType) {
			fetch();
			const interval = setInterval(fetch, 5000);
			return () => clearInterval(interval);
		}
	}, [isAuthenticated, isAdmin, name, fileType, fetch]);

	const handleFileChange = e => {
		const selected = e.target.files[0];
		setFile(selected);
		setSelectedFileName(selected?.name || 'Choose File');
	};

	const handleEdit = file => {
		setIsDialogueOpen(true);
		setSelectedFileNameForEdit(file.name);
		setFileName(file.name || '');
		setPart_No(file.part_no || '');
		setQty(file.qty || '');
		setItemSN(file.itemSN || '');
		setCatRS(file.catRS || '');
		setCatRD(file.catRD || '');
		setUnsvc(file.unsvc || '');
		setSvc(file.svc || '');
		setRemarks(file.remarks || '');
		setReference(file.reference || '');
		setSubject(file.subject || '');
	};

	const handleUpdate = async () => {
		setIsSubmitting(true);
		const formData = new FormData();

		if (fileType === 'PRESENT STOCK') {
			formData.append('name', fileName);
			formData.append('part_no', part_no);
			formData.append('qty', qty);
			formData.append('itemSN', itemSN);
			formData.append('catRS', catRS);
			formData.append('catRD', catRD);
			formData.append('unsvc', unsvc);
			formData.append('svc', svc);
			formData.append('remarks', remarks);
		} else {
			formData.append('name', fileName);
			formData.append('reference', reference);
			formData.append('subject', subject);
			formData.append('remarks', remarks);
			if (file !== null) {
				formData.append('editedImgFile', file);
			}
		}

		try {
			await updateFile(name, fileType, selectedFileNameForEdit, formData);

			getFileData(name, fileType);
			// Reset
			setFileName('');
			setPart_No('');
			setQty('');
			setItemSN('');
			setCatRS('');
			setCatRD('');
			setUnsvc('');
			setSvc('');
			setRemarks('');
			setReference('');
			setSubject('');
			setFile(null);
			setSelectedFileName('Choose File');
			if (fileInputRef.current) fileInputRef.current.value = '';
			setIsDialogueOpen(false);
		} catch (err) {
			console.error(err);
		}
		setIsSubmitting(false);
	};

	const handleDelete = async e => {
		try {
			await deleteFile(name, fileType, e);
			await getFileData(name, fileType);
		} catch (err) {
			console.error(err);
		}
	};

	const TableHead = () =>
		fileType === 'PRESENT STOCK' ? (
			<tr>
				<th>Part No.</th>
				<th>Name</th>
				<th>QTY</th>
				<th>Item S/N</th>
				<th>Cat RS</th>
				<th>Cat RD</th>
				<th>Unsvc</th>
				<th>Svc</th>
				<th>Rmk</th>
			</tr>
		) : (
			<tr>
				<th>S/N</th>
				<th>Name</th>
				<th>Reference</th>
				<th>Subject</th>
				<th>File</th>
				<th>Remarks</th>
			</tr>
		);

	const TableRows = () =>
		fileData?.length > 0 &&
		fileData.map((file, i) => (
			<tr
				key={file._id || i}
				onMouseEnter={() => setHoveredRow(i)}
				onMouseLeave={() => setHoveredRow(null)}
			>
				{fileType === 'PRESENT STOCK' ? (
					<>
						<td>{file.part_no || '—'}</td>
						<td>{file.name || '—'}</td>
						<td>{file.qty || '—'}</td>
						<td>{file.itemSN || '—'}</td>
						<td>{file.catRS || '—'}</td>
						<td>{file.catRD || '—'}</td>
						<td>{file.unsvc || '—'}</td>
						<td>{file.svc || '—'}</td>
						<td style={{ position: 'relative' }}>
							{file.remarks || '—'}
							{hoveredRow === i && isAdmin && (
								<div className={styles.panel}>
									<i
										className="fas fa-edit"
										title="Edit"
										onClick={() => handleEdit(file)}
									></i>
									<i
										className="fas fa-trash"
										title="Delete"
										onClick={() => handleDelete(file.name)}
									></i>
								</div>
							)}
						</td>
					</>
				) : (
					<>
						<td>{i + 1}</td>
						<td>{file.name || '—'}</td>
						<td>{file.reference || '—'}</td>
						<td>{file.subject || '—'}</td>
						<td>
							<NavLink
								className={styles.fileLink}
								to={`/${name}/file/${fileType}/${file.name}`}
							>
								Letter
							</NavLink>
						</td>
						<td style={{ position: 'relative' }}>
							{file.remarks || '—'}
							{hoveredRow === i && isAdmin && (
								<div className={styles.panel}>
									<i
										className="fas fa-edit"
										title="Edit"
										onClick={() => handleEdit(file)}
									></i>
									<i
										className="fas fa-trash"
										title="Delete"
										onClick={() => handleDelete(file.name)}
									></i>
								</div>
							)}
						</td>
					</>
				)}
			</tr>
		));

	return (
		<>
			<button
				className={styles.back}
				onClick={() => window.history.back()}
			>
				<i className="fa-solid fa-arrow-left"></i>
			</button>

			<div
				className={
					fileType === 'PRESENT STOCK'
						? styles.tableWrapperPresentStock
						: styles.tableWrapper
				}
			>
				<table className={styles.table}>
					<thead className={styles.stickyHeader}>
						<TableHead />
					</thead>
					<tbody>
						<tr>
							<td
								colSpan={fileType === 'PRESENT STOCK' ? 9 : 6}
								style={{ padding: 0 }}
							>
								<div className={styles.scrollableBody}>
									<table className={styles.innerTable}>
										<tbody>
											<TableRows />
										</tbody>
									</table>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div className={styles.cardWrapper}>
				{fileData?.length > 0 &&
					fileData.map((file, i) => (
						<Card
							key={file._id || i}
							internalKey={i}
							sn={i + 1}
							officeName={name}
							fileType={fileType}
							fileName={file.name}
							isAdmin={isAdmin}
							handleEdit={handleEdit}
							{...file}
						/>
					))}
			</div>

			{isDialogueOpen && isAdmin && (
				<>
					<div
						className={styles.blurer}
						onClick={() => setIsDialogueOpen(false)}
					></div>
					<div className={styles.dialog}>
						<h1 className={styles.dialogTitle}>Edit File</h1>
						<form
							className={styles.form}
							onSubmit={e => {
								e.preventDefault();
								handleUpdate();
							}}
						>
							{fileType === 'PRESENT STOCK' ? (
								<>
									<input
										type="text"
										placeholder="Name"
										className={styles.input}
										value={fileName}
										onChange={e =>
											setFileName(e.target.value)
										}
									/>
									<input
										type="text"
										placeholder="Part No."
										className={styles.input}
										value={part_no}
										onChange={e =>
											setPart_No(e.target.value)
										}
									/>
									<input
										type="text"
										placeholder="Quantity"
										className={styles.input}
										value={qty}
										onChange={e => setQty(e.target.value)}
									/>
									<textarea
										placeholder="Item S/N"
										className={styles.input}
										value={itemSN}
										onChange={e =>
											setItemSN(e.target.value)
										}
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
									/>
									<input
										type="text"
										placeholder="Remarks"
										className={styles.input}
										value={remarks}
										onChange={e =>
											setRemarks(e.target.value)
										}
									/>
								</>
							) : (
								<>
									<input
										type="text"
										placeholder="Name"
										className={styles.input}
										value={fileName}
										onChange={e =>
											setFileName(e.target.value)
										}
									/>
									<input
										type="text"
										placeholder="Reference"
										className={styles.input}
										value={reference}
										onChange={e =>
											setReference(e.target.value)
										}
									/>
									<input
										type="text"
										placeholder="Subject"
										className={styles.input}
										value={subject}
										onChange={e =>
											setSubject(e.target.value)
										}
									/>
									<input
										type="text"
										placeholder="Remarks"
										className={styles.input}
										value={remarks}
										onChange={e =>
											setRemarks(e.target.value)
										}
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
											{selectedFileName}
										</label>
										<input
											id="file-upload"
											type="file"
											className={styles.fileInput}
											onChange={handleFileChange}
											ref={fileInputRef}
										/>
									</div>
								</>
							)}
							<button
								type="submit"
								className={styles.button}
								disabled={isSubmitting || !fileName}
							>
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

export default File;
