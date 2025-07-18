import { useEffect } from 'react';
import styles from './addFileType.module.css';
import { useNavigate } from 'react-router-dom';
import { UseContext } from '../../context';
import { useState } from 'react';

const AddFileType = () => {
	const [name, setName] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { isAuthenticated, addFileType, loading, isAdmin } = UseContext();

	const navigate = useNavigate();

	const handleSubmit = e => {
		e.preventDefault();

		setIsSubmitting(true);

		try {
			addFileType(name);
			setName('');
		} catch {
			console.log('Error');
		} finally {
			setIsSubmitting(false);
		}
	};

	useEffect(() => {
		if (!loading && !isAuthenticated) {
			if (!isAdmin) {
				navigate('/login', { replace: true });
			}
		}
	}, [isAuthenticated, loading, navigate, isAdmin]);

	return (
		<div className={styles.card}>
			<h1 className={styles.title}>Add FileType</h1>

			<form className={styles.form} onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Name"
					className={styles.name}
					required
					value={name}
					onChange={e => setName(e.target.value)}
				/>

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

export default AddFileType;
