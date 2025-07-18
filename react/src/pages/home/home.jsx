import { UseContext } from '../../context';
import styles from './home.module.css';
import { NavLink } from 'react-router-dom';
import bafLogo from '../../assets/BAF_logo.png';

const Home = () => {
	const { offices, isAuthenticated, isAdmin, user, limitedOffices } =
		UseContext();

	return (
		<div className={styles.container}>
			<div className={styles.section1}>
				<header className={styles.header}>
					<img src={bafLogo} className={styles.logo} alt="BAF Logo" />
					<h1 className={styles.title}>File Management System</h1>
					<img
						src={bafLogo}
						className={styles.logo2}
						alt="BAF Logo"
					/>
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

			<section className={styles.section2}>
				<div className={styles.subSection}>
					{isAuthenticated ? (
						offices?.length > 0 ? (
							user?.role === 'admin' ? (
								offices.map(office => (
									<NavLink
										to={`/office/${office.officeName}`}
										key={office._id}
										className={styles.officeNameCard}
									>
										<h2>{office.officeName}</h2>
									</NavLink>
								))
							) : (
								limitedOffices.map(office => (
									<NavLink
										to={`/office/${office.officeName}`}
										key={office._id}
										className={styles.officeNameCard}
									>
										<h2>{office.officeName}</h2>
									</NavLink>
								))
							)
						) : (
							<div className={styles.noOffices}>
								<p>No offices available</p>
								{isAdmin && (
									<NavLink
										to="/addOffice"
										className={styles.noOfficesButton}
									>
										Add Office?
									</NavLink>
								)}
							</div>
						)
					) : (
						<div className={styles.noOffices}>
							<p>No offices available</p>
							<NavLink
								to="/login"
								className={styles.noOfficesButton}
							>
								Login?
							</NavLink>
						</div>
					)}
				</div>
			</section>
		</div>
	);
};

export default Home;
