import { useState, useEffect, useRef } from 'react';
import styles from './register.module.css';
import { UseContext } from '../../context';
import { useNavigate } from 'react-router-dom';

const Register = () => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [role, setRole] = useState('user');
	const [officeAccess, setOfficeAccess] = useState([]);

	const [otp, setOtp] = useState('');
	const [isOtpActive, setIsOtpActive] = useState(false);
	const [isOtpExpired, setIsOtpExpired] = useState(false);

	const otpTimerRef = useRef(null); // For cleanup
	const { register, isAdmin, loading, isAuthenticated, offices } =
		UseContext();
	const navigate = useNavigate();

	// --- Redirect if unauthorized ---
	useEffect(() => {
		if (!loading && (!isAuthenticated || !isAdmin)) {
			navigate('/login', { replace: true });
		}
	}, [isAuthenticated, loading, navigate, isAdmin]);

	// --- OTP Timer ---
	useEffect(() => {
		if (isOtpActive) {
			otpTimerRef.current = setTimeout(() => {
				setIsOtpActive(false);
				setIsOtpExpired(true);
			}, 210 * 1000);
		}
		return () => clearTimeout(otpTimerRef.current);
	}, [isOtpActive]);

	// --- Handle form submit ---
	const handleSubmit = async e => {
		e.preventDefault();

		const status = await register(
			otp,
			name,
			email,
			password,
			role,
			officeAccess
		);

		if (status === 'otp-sent') {
			setIsOtpActive(true);
			setIsOtpExpired(false);
			setOtp('');
		} else if (status === 'user-created') {
			setIsOtpActive(false);
			setIsOtpExpired(false);
			setName('');
			setEmail('');
			setOtp('');
			setPassword('');
			setRole('user');
			setOfficeAccess([]);
		}
	};

	// --- Office selection handler ---
	const handleOfficeChange = office => {
		setOfficeAccess(prev =>
			prev.includes(office)
				? prev.filter(o => o !== office)
				: [...prev, office]
		);
	};

	// --- Determine button label ---
	const getButtonText = () => {
		if (isOtpExpired) return 'Resend OTP';
		if (isOtpActive) return 'Create User';
		return 'Get OTP';
	};

	return (
		<div className={styles.card}>
			<h1 className={styles.title}>Create Account</h1>

			<form className={styles.form} onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Username"
					className={styles.input}
					required
					value={name}
					onChange={e => setName(e.target.value)}
				/>

				<input
					type="email"
					placeholder="Email"
					className={styles.input}
					required
					value={email}
					onChange={e => setEmail(e.target.value)}
				/>

				<div className={styles.passwordContainer}>
					<input
						type={isPasswordVisible ? 'text' : 'password'}
						placeholder="Password"
						className={styles.passwordInput}
						required
						value={password}
						onChange={e => setPassword(e.target.value)}
					/>
					<i
						className={
							isPasswordVisible
								? 'fa-solid fa-eye-slash'
								: 'fa-solid fa-eye'
						}
						style={{ cursor: 'pointer' }}
						onClick={() => setIsPasswordVisible(!isPasswordVisible)}
					></i>
				</div>

				<div className={styles.role}>
					{['user', 'admin'].map(r => (
						<label className={styles.label} key={r}>
							<input
								type="radio"
								name="role"
								value={r}
								checked={role === r}
								onChange={e => setRole(e.target.value)}
							/>
							{r.charAt(0).toUpperCase() + r.slice(1)}
						</label>
					))}
				</div>

				{role === 'user' && (
					<div className={styles.offices}>
						<label className={styles.labelTitle}>
							Allowed Offices:
						</label>
						<div className={styles.officesList}>
							{Array.isArray(offices) && offices.length > 0 ? (
								offices.map(office => (
									<label
										className={styles.label}
										key={office._id}
									>
										<input
											type="checkbox"
											value={office.officeName}
											checked={officeAccess.includes(
												office.officeName
											)}
											onChange={() =>
												handleOfficeChange(
													office.officeName
												)
											}
										/>
										{office.officeName}
									</label>
								))
							) : (
								<p className={styles.noOffices}>
									No offices available
								</p>
							)}
						</div>
					</div>
				)}

				{isOtpActive && !isOtpExpired && (
					<input
						type="text"
						placeholder="OTP"
						className={styles.input}
						required
						value={otp}
						onChange={e => setOtp(e.target.value)}
					/>
				)}

				<button type="submit" className={styles.button}>
					{getButtonText()}
				</button>
			</form>
		</div>
	);
};

export default Register;
