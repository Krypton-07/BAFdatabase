import { useState } from 'react';
import styles from './login.module.css';
import { useNavigate } from 'react-router-dom';
import { UseContext } from '../../context';
import { useEffect } from 'react';

const Login = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);

	const { login, isAuthenticated, loading } = UseContext();

	const navigate = useNavigate();

	useEffect(() => {
		if (!loading && isAuthenticated) {
			navigate('/', { replace: true });
		}
	}, [isAuthenticated, loading, navigate]);

	const handleSubmit = e => {
		e.preventDefault();

		login(username, password).then(() => {
			setUsername('');
			setPassword('');
		});
	};

	return (
		<div className={styles.card}>
			<h1 className={styles.title}>(^_^) Welcome!</h1>
			<form
				className={styles.form}
				onSubmit={e => {
					handleSubmit(e);
				}}
			>
				<input
					type="text"
					placeholder="Username"
					className={styles.input}
					required
					value={username}
					onChange={e => {
						setUsername(e.target.value);
					}}
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
						onClick={() => setIsPasswordVisible(!isPasswordVisible)}
					></i>
				</div>
				<button type="submit" className={styles.button}>
					Login
				</button>
			</form>
		</div>
	);
};

export default Login;
