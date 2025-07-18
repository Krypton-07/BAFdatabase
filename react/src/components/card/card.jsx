import { NavLink } from 'react-router-dom';
import styles from './card.module.css';
import { useState } from 'react';
import { UseContext } from '../../context';

const Row = ({ label, value }) => (
	<div className={styles.row}>
		<span className={styles.label}>{label}:</span>
		<span className={styles.value}>{value || '—'}</span>
	</div>
);

const Card = ({
	internalKey,
	sn,
	fileName,
	reference,
	subject,
	fileType,
	officeName,
	remarks,
	qty,
	itemSN,
	catRS,
	catRD,
	unsvc,
	svc,
	part_no,
	handleEdit,
	isAdmin,
}) => {
	const { deleteFile, getFileData } = UseContext();
	const [hoveredCard, setHoveredCard] = useState(null);

	const handleDelete = async () => {
		await deleteFile(officeName, fileType, fileName);
		await getFileData(officeName, fileType);
	};

	return (
		<div
			className={styles.card}
			onMouseEnter={() => setHoveredCard(internalKey)}
			onMouseLeave={() => setHoveredCard(null)}
		>
			{fileName ? (
				<>
					<Row label="S/N" value={sn} />
					{fileType === 'PRESENT STOCK' ? (
						<>
							<Row label="Part No" value={part_no} />
							<Row label="Name" value={fileName} />
							<Row label="QTY" value={qty} />
							<Row label="Item S/N" value={itemSN} />
							<Row label="Cat RS" value={catRS} />
							<Row label="Cat RD" value={catRD} />
							<Row label="Unsvc" value={unsvc} />
							<Row label="Svc" value={svc} />
							<Row label="Rmk" value={remarks} />
							{hoveredCard === internalKey && isAdmin && (
								<div className={styles.panelPS}>
									<i
										className="fas fa-edit"
										title="Edit"
										onClick={() =>
											handleEdit({
												name: fileName,
												part_no,
												qty,
												itemSN,
												catRS,
												catRD,
												unsvc,
												svc,
												remarks,
											})
										}
									></i>
									<i
										className="fas fa-trash"
										title="Delete"
										onClick={handleDelete}
									></i>
								</div>
							)}
						</>
					) : (
						<>
							<Row label="Name" value={fileName} />
							<Row label="Reference" value={reference} />
							<Row label="Subject" value={subject} />
							<Row label="Remarks" value={remarks} />
							<div className={styles.grp}>
								{hoveredCard === internalKey && isAdmin && (
									<div className={styles.panel}>
										<i
											className="fas fa-edit"
											title="Edit"
											onClick={() =>
												handleEdit({
													name: fileName,
													reference,
													subject,
													remarks,
												})
											}
										></i>
										<i
											className="fas fa-trash"
											title="Delete"
											onClick={handleDelete}
										></i>
									</div>
								)}
								<div className={styles.link}>
									<NavLink
										to={`/${officeName}/file/${fileType}/${fileName}`}
									>
										📄 View Letter
									</NavLink>
								</div>
							</div>
						</>
					)}
				</>
			) : (
				<p className={styles.noFiles}>No files available</p>
			)}
		</div>
	);
};

export default Card;
