import { NavLink } from 'react-router-dom';
import styles from './404.module.css';

const FourZeroFour = () => {
	return (
		<div className={styles.container}>
			<i
				className={`fas fa-search ${styles.icon}`}
				aria-hidden="true"
			></i>
			<h1 className={styles.title}>404</h1>
			<p className={styles.text}>
				Oops! The page you&rsquo;re looking for doesn&rsquo;t exist.
			</p>
			<NavLink to="/" className={styles.button}>
				<i className="fas fa-home" aria-hidden="true"></i>
				<span>Go Home</span>
			</NavLink>
		</div>
	);
};

export default FourZeroFour;
