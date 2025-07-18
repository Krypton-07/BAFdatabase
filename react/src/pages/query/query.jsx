import { useNavigate, useParams } from 'react-router-dom';
import styles from './query.module.css';
import { useEffect, useState, useCallback, useRef } from 'react';
import { UseContext } from '../../context';

const Query = () => {
	const { isAuthenticated, fileData, loading, isAdmin, getFileData } =
		UseContext();
	const navigate = useNavigate();

	const [data, setData] = useState();
	const [isDownloadPanelOpen, setIsDownloadPanelOpen] = useState(false);
	const { name, fileType, fileName } = useParams();

	// Zoom state
	const [scale, setScale] = useState(1);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 });
	const [touchStartDistance, setTouchStartDistance] = useState(null);
	const [touchStartScale, setTouchStartScale] = useState(1);

	const imgRef = useRef(null);
	const containerRef = useRef(null);
	const imgContainerRef = useRef(null);

	useEffect(() => {
		fileData.forEach(file => {
			if (file.fileType === fileType && file.name === fileName) {
				setData(file);
			}
		});
	}, [name, fileData, fileType, fileName]);

	const fetch = useCallback(() => {
		if (name && fileType) {
			getFileData(name, fileType);
		}
	}, [name, fileType, getFileData]);

	useEffect(() => {
		if ((isAuthenticated || isAdmin) && name && fileType) {
			fetch();
			const interval = setInterval(fetch, 5000);
			return () => clearInterval(interval);
		}
	}, [isAuthenticated, isAdmin, name, fileType, fetch]);

	useEffect(() => {
		if (!loading && !isAuthenticated) {
			navigate('/login', { replace: true });
		}
	}, [isAuthenticated, loading, navigate]);

	let downloadURL = null;
	if (fileType !== 'PRESENT STOCK') {
		downloadURL = data?.img.replace('/upload/', '/upload/fl_attachment/');
	}

	// Reset zoom and position
	const resetImage = useCallback(() => {
		setScale(1);
		setPosition({ x: 0, y: 0 });
	}, []);

	// Handle double click to zoom
	const handleDoubleClick = useCallback(
		e => {
			e.preventDefault();
			if (scale === 1) {
				const rect = imgRef.current.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;

				setScale(2);
				setPosition({
					x: -(x * 2 - rect.width / 2),
					y: -(y * 2 - rect.height / 2),
				});
			} else {
				resetImage();
			}
		},
		[scale, resetImage]
	);

	// Handle mouse down for dragging
	const handleMouseDown = useCallback(
		e => {
			if (scale > 1) {
				e.preventDefault();
				setIsDragging(true);
				setStartDragPosition({
					x: e.clientX - position.x,
					y: e.clientY - position.y,
				});
			}
		},
		[scale, position]
	);

	// Handle mouse move for dragging
	const handleMouseMove = useCallback(
		e => {
			if (isDragging && scale > 1) {
				e.preventDefault();
				setPosition({
					x: e.clientX - startDragPosition.x,
					y: e.clientY - startDragPosition.y,
				});
			}
		},
		[isDragging, scale, startDragPosition]
	);

	// Handle mouse up to stop dragging
	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
	}, []);

	// Touch handlers
	const handleTouchStart = useCallback(
		e => {
			if (e.touches.length === 2) {
				const touch1 = e.touches[0];
				const touch2 = e.touches[1];
				const distance = Math.hypot(
					touch2.clientX - touch1.clientX,
					touch2.clientY - touch1.clientY
				);
				setTouchStartDistance(distance);
				setTouchStartScale(scale);
			} else if (e.touches.length === 1 && scale > 1) {
				const touch = e.touches[0];
				setIsDragging(true);
				setStartDragPosition({
					x: touch.clientX - position.x,
					y: touch.clientY - position.y,
				});
			}
		},
		[scale, position]
	);

	const handleTouchMove = useCallback(
		e => {
			if (e.touches.length === 2) {
				const touch1 = e.touches[0];
				const touch2 = e.touches[1];
				const distance = Math.hypot(
					touch2.clientX - touch1.clientX,
					touch2.clientY - touch1.clientY
				);

				if (touchStartDistance) {
					const newScale = Math.min(
						Math.max(
							1,
							(distance / touchStartDistance) * touchStartScale
						),
						3
					);
					setScale(newScale);
				}
			} else if (isDragging && e.touches.length === 1 && scale > 1) {
				const touch = e.touches[0];
				setPosition({
					x: touch.clientX - startDragPosition.x,
					y: touch.clientY - startDragPosition.y,
				});
			}
		},
		[
			touchStartDistance,
			touchStartScale,
			isDragging,
			scale,
			startDragPosition,
		]
	);

	const handleTouchEnd = useCallback(() => {
		setTouchStartDistance(null);
		setIsDragging(false);
	}, []);

	// Proper passive event handling
	useEffect(() => {
		const container = imgContainerRef.current;
		if (!container) return;

		const handleTouchStartPassive = e => {
			if (e.touches.length === 2) {
				e.preventDefault();
			}
			handleTouchStart(e);
		};

		const handleTouchMovePassive = e => {
			if (e.touches.length === 2 || (isDragging && scale > 1)) {
				e.preventDefault();
			}
			handleTouchMove(e);
		};

		container.addEventListener('touchstart', handleTouchStartPassive, {
			passive: false,
		});
		container.addEventListener('touchmove', handleTouchMovePassive, {
			passive: false,
		});
		container.addEventListener('touchend', handleTouchEnd);

		return () => {
			container.removeEventListener(
				'touchstart',
				handleTouchStartPassive
			);
			container.removeEventListener('touchmove', handleTouchMovePassive);
			container.removeEventListener('touchend', handleTouchEnd);
		};
	}, [handleTouchStart, handleTouchMove, handleTouchEnd, isDragging, scale]);

	const Row = ({ label, value }) => (
		<div className={styles.row}>
			<span
				style={{
					fontWeight: '600',
					color: '#ffc773',
					fontSize: '.95rem',
				}}
			>
				{label}:
			</span>
			<span
				style={{
					textAlign: 'right',
					fontSize: '0.95rem',
					color: '#e9e9e9',
					wordBreak: 'break-word',
					userSelect: 'text',
					padding: '0 5px',
				}}
			>
				{value || '—'}
			</span>
		</div>
	);

	return (
		<div className={styles.container} ref={containerRef}>
			<button
				className={styles.back}
				onClick={() => window.history.back()}
				aria-label="Go back"
			>
				<i className="fa-solid fa-arrow-left"></i>
			</button>

			{data && (
				<>
					{fileType === 'PRESENT STOCK' ? (
						<div className={styles.cardWrapper}>
							<div className={styles.card}>
								<Row label="Part No" value={data.part_no} />
								<Row label="Name" value={data.name} />
								<Row label="QTY" value={data.qty} />
								<Row label="Item S/N" value={data.itemSN} />
								<Row label="Cat RS" value={data.catRS} />
								<Row label="Cat RD" value={data.catRD} />
								<Row label="Unsvc" value={data.unsvc} />
								<Row label="Svc" value={data.svc} />
								<Row label="Rmk" value={data.remarks} />
							</div>
						</div>
					) : (
						<>
							<div
								className={styles.imgWrapper}
								onMouseEnter={() =>
									setIsDownloadPanelOpen(true)
								}
								onMouseLeave={() =>
									setIsDownloadPanelOpen(false)
								}
							>
								<div
									className={styles.imgContainer}
									ref={imgContainerRef}
									style={{
										transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
										transition: isDragging
											? 'none'
											: 'transform 0.2s ease-out',
										cursor:
											scale > 1
												? isDragging
													? 'grabbing'
													: 'grab'
												: 'default',
									}}
									onMouseDown={handleMouseDown}
									onMouseMove={handleMouseMove}
									onMouseUp={handleMouseUp}
									onMouseLeave={handleMouseUp}
									onDoubleClick={handleDoubleClick}
									onContextMenu={e => e.preventDefault()}
								>
									<img
										ref={imgRef}
										src={data.img}
										alt={data.name || 'Image preview'}
										className={styles.img}
										draggable="false"
									/>
								</div>
								{isDownloadPanelOpen && (
									<a
										href={downloadURL}
										className={styles.fileLink}
										title="Download"
										download
									>
										<i className="fas fa-download"></i>
									</a>
								)}
								<div className={styles.zoomIndicator}>
									{scale > 1
										? 'Double tap to reset'
										: 'Double tap to zoom'}
								</div>
							</div>
							<div className={styles.detailsWrapper}>
								<div className={styles.detailRow}>
									<span className={styles.label}>Name</span>
									<span className={styles.value}>
										{data.name || '—'}
									</span>
								</div>
								<div className={styles.detailRow}>
									<span className={styles.label}>
										Reference
									</span>
									<span className={styles.value}>
										{data.reference || '—'}
									</span>
								</div>
								<div className={styles.detailRow}>
									<span className={styles.label}>
										Subject
									</span>
									<span className={styles.value}>
										{data.subject || '—'}
									</span>
								</div>
								<div className={styles.detailRow}>
									<span className={styles.label}>
										Remarks
									</span>
									<span className={styles.value}>
										{data.remarks || '—'}
									</span>
								</div>
							</div>
						</>
					)}
				</>
			)}
		</div>
	);
};

export default Query;
