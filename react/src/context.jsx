import axios from 'axios';
import { useEffect, useState, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import plane from '../src/assets/plane.gif';

const BASE_URL = 'http://10.124.120.210:3001';

const Context = createContext();
export const UseContext = () => useContext(Context);

export const ContextProvider = ({ children }) => {
	// --- States ---
	const [loading, setLoading] = useState(true);
	const [initialLoadingOffices, setInitialLoadingOffices] = useState(false);
	const [initialLoadingFiles, setInitialLoadingFiles] = useState(false);
	const [initialLoadingTypes, setInitialLoadingTypes] = useState(false);

	const [isDeleting, setIsDeleting] = useState(false);
	const [user, setUser] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);

	const [offices, setOffices] = useState([]);
	const [limitedOffices, setLimitedOffices] = useState([]);
	const [fileTypes, setFileTypes] = useState([]);
	const [fileData, setFileData] = useState([]);
	const [files, setFiles] = useState(null);
	const [limitedFiles, setLimitedFiles] = useState(null);

	const navigate = useNavigate();
	let otpCountdownInterval = null;

	// --- Auth routes ---

	const checkAuth = async () => {
		try {
			const res = await axios.get(`${BASE_URL}/checkAuth`, {
				withCredentials: true,
			});
			if (res.status === 200) {
				setIsAuthenticated(true);
				setUser(res.data.user);
			}
		} catch {
			setIsAuthenticated(false);
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		checkAuth();
	}, []);

	useEffect(() => {
		setIsAdmin(user?.role === 'admin');
	}, [user?.role]);

	const register = async (
		otp,
		username,
		email,
		password,
		role,
		officeAccess
	) => {
		setInitialLoadingOffices(true);
		try {
			const res = await axios.post(
				`${BASE_URL}/register`,
				{ otp, username, email, password, role, officeAccess },
				{ withCredentials: true }
			);

			if (res.status === 200 && res.data.message === 'OTP sent') {
				toast.success('OTP sent.', { autoClose: 3000 });
				toast.success('Check both index and spam folder.', {
					autoClose: 6000,
				});

				if (otpCountdownInterval) clearInterval(otpCountdownInterval);
				if (!toast.isActive('otpTimer')) {
					toast.warn(`⏳ Time left: 3:30`, {
						toastId: 'otpTimer',
						autoClose: 210000,
						closeOnClick: false,
						draggable: false,
					});
				}
				let seconds = 210;
				otpCountdownInterval = setInterval(() => {
					seconds--;
					const mins = Math.floor(seconds / 60);
					const secs = String(seconds % 60).padStart(2, '0');

					toast.update('otpTimer', {
						render: `⏳ Time left: ${mins}:${secs}`,
						autoClose: seconds * 1000,
					});

					if (seconds <= 0) {
						clearInterval(otpCountdownInterval);
					}
				}, 1000);

				return 'otp-sent';
			} else if (res.status === 201) {
				toast.success(res.data.message);
				if (otpCountdownInterval) {
					clearInterval(otpCountdownInterval);
					otpCountdownInterval = null;
				}
				toast.dismiss('otpTimer');
				return 'user-created';
			} else {
				toast.error(res.data.message);
			}
		} catch (error) {
			toast.error(error.response?.data?.message || 'Registration failed');
		} finally {
			setInitialLoadingOffices(false);
		}
	};

	const login = async (username, password) => {
		setInitialLoadingOffices(true);

		try {
			const res = await axios.post(
				`${BASE_URL}/login`,
				{ username, password },
				{ withCredentials: true }
			);
			if (res.status === 200) {
				setIsAuthenticated(true);
				toast.success(res.data.message);
				await checkAuth();
				await navigate('/');
				await getOffices();
			} else toast.error(res.data.message);
		} catch (error) {
			toast.error(error.response?.data?.message || 'Login failed');
		} finally {
			setInitialLoadingOffices(false);
		}
	};

	const logout = async () => {
		setInitialLoadingOffices(true);
		try {
			const res = await axios.post(
				`${BASE_URL}/logout`,
				{},
				{ withCredentials: true }
			);
			if (res.status === 200) {
				setIsAuthenticated(false);
				setUser(null);
				await checkAuth();
				toast.success(res.data.message);
			}
		} catch (error) {
			toast.error(error.response?.data?.message || 'Logout failed');
		} finally {
			setInitialLoadingOffices(false);
		}
	};

	// --- Office routes ---

	const getOffices = async () => {
		try {
			const res = await axios.get(`${BASE_URL}/getOffices`, {
				withCredentials: true,
			});
			if (res.status === 200) setOffices(res.data);
		} catch (error) {
			toast.error(
				error.response?.data?.message || 'Failed to fetch offices'
			);
		}
	};

	const addOffice = async formData => {
		setInitialLoadingOffices(true);
		try {
			const res = await axios.post(`${BASE_URL}/addOffice`, formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
				withCredentials: true,
			});
			if (res.status === 201) {
				toast.success(res.data.message);
				await getOffices();
			} else toast.error(res.data.message);
		} catch (error) {
			toast.error(
				error.response?.data?.message || 'Failed to add office'
			);
		} finally {
			setInitialLoadingOffices(false);
		}
	};

	const updateOffice = async (officeName, formData) => {
		setInitialLoadingOffices(true);
		try {
			const res = await axios.put(
				`${BASE_URL}/updateOffice/${officeName}`,
				formData,
				{ withCredentials: true }
			);
			if (res.status === 200) {
				toast.success(res.data.message);
				await getOffices();
			} else toast.error(res.data.message);
		} catch (error) {
			toast.error(
				error.response?.data?.message || 'Failed to update office'
			);
		} finally {
			setInitialLoadingOffices(false);
		}
	};

	const deleteOffice = async officeName => {
		if (!officeName) return toast.error('Office name is required');
		setInitialLoadingOffices(true);
		try {
			const res = await axios.delete(
				`${BASE_URL}/deleteOffice/${officeName}`,
				{ withCredentials: true }
			);
			if (res.status === 200) {
				toast.success(res.data.message);
				await navigate('/');
				await getOffices();
			} else toast.error(res.data.message);
		} catch (error) {
			toast.error(
				error.response?.data?.message || 'Failed to delete office'
			);
		} finally {
			setInitialLoadingOffices(false);
		}
	};

	// --- File type routes ---

	const getFileTypes = async () => {
		try {
			const res = await axios.get(`${BASE_URL}/getFileTypes`, {
				withCredentials: true,
			});
			if (res.status === 200) setFileTypes(res.data);
		} catch (error) {
			toast.error(
				error.response?.data?.message || 'Failed to fetch file types'
			);
		}
	};

	const addFileType = async name => {
		setInitialLoadingTypes(true);
		try {
			const res = await axios.put(
				`${BASE_URL}/addFileType`,
				{ name },
				{ withCredentials: true }
			);
			if (res.status === 200) {
				toast.success(res.data.message);
				await getFileTypes();
			} else toast.error(res.data.message);
		} catch (error) {
			toast.error(
				error.response?.data?.message || 'Failed to add file type'
			);
		} finally {
			setInitialLoadingTypes(false);
		}
	};

	// --- File data routes ---

	const getFileData = async (officeName, fileType) => {
		try {
			const res = await axios.get(
				`${BASE_URL}/getFiles/${officeName}/${fileType}`,
				{ withCredentials: true }
			);
			if (res.status === 200 && Array.isArray(res.data)) {
				setFileData([...res.data].reverse());
			}
		} catch (error) {
			toast.error(
				error.response?.data?.message || 'Failed to fetch file data'
			);
		}
	};

	const getAllFiles = async () => {
		try {
			const res = await axios.get(`${BASE_URL}/getAllFiles`, {
				withCredentials: true,
			});
			if (res.status === 200) setFiles(res.data);
		} catch (error) {
			toast.error(
				error.response?.data?.message || 'Failed to fetch all files'
			);
		}
	};

	const addFile = async (officeId, fileType, formData) => {
		setInitialLoadingFiles(true);
		try {
			const res = await axios.put(
				`${BASE_URL}/addFile/${officeId}/${fileType}`,
				formData,
				{
					headers: { 'Content-Type': 'multipart/form-data' },
				}
			);
			if (res.status === 200) {
				toast.success(res.data.message);
				await getAllFiles();
			} else toast.error(res.data.message);
		} catch (error) {
			toast.error(error.response?.data?.message || 'Failed to add file');
		} finally {
			setInitialLoadingFiles(false);
		}
	};

	const updateFile = async (officeName, fileType, fileName, formData) => {
		setInitialLoadingFiles(true);
		try {
			const res = await axios.put(
				`${BASE_URL}/updateFile/${officeName}/${fileType}/${fileName}`,
				formData,
				{
					withCredentials: true,
				}
			);
			if (res.status === 200) {
				toast.success(res.data.message);
				await getFileData(officeName, fileType);
				await getAllFiles();
			} else toast.error(res.data.message);
		} catch (error) {
			toast.error(
				error.response?.data?.message || 'Failed to update file'
			);
		} finally {
			setInitialLoadingFiles(false);
		}
	};

	const deleteFile = async (officeName, fileType, fileName) => {
		if (isDeleting) return;
		setIsDeleting(true);
		setInitialLoadingFiles(true);
		try {
			const res = await axios.delete(
				`${BASE_URL}/deleteFile/${officeName}/${fileType}/${fileName}`,
				{
					withCredentials: true,
				}
			);
			if (res.status === 200) {
				toast.success(res.data.message);
				await getFileData(officeName, fileType);
				await getAllFiles();
			} else {
				toast.error(res.data.message || 'Unexpected error');
			}
		} catch (error) {
			toast.error(
				error.response?.data?.message || 'Failed to delete file'
			);
		} finally {
			setInitialLoadingFiles(false);
			setIsDeleting(false);
		}
	};

	// --- Derived states ---

	useEffect(() => {
		if (isAuthenticated && offices) {
			const data = offices.filter(office =>
				user?.role !== 'admin'
					? user?.officeAccess.includes(office.officeName)
					: true
			);
			setLimitedOffices(data);
		}
	}, [isAuthenticated, offices, user?.role, user?.officeAccess]);

	useEffect(() => {
		const allFiles = limitedOffices.flatMap(o => o.files || []);
		setLimitedFiles(allFiles);
	}, [limitedOffices]);

	// --- Polling data fetch every 7 seconds ---

	useEffect(() => {
		if (!isAuthenticated) return;

		// Initial calls
		getOffices();
		getFileTypes();
		getAllFiles();
		checkAuth();

		const officeInterval = setInterval(getOffices, 5000);
		const fileTypesInterval = setInterval(getFileTypes, 5000);
		const allFilesInterval = setInterval(getAllFiles, 5000);
		const checkAuthInterval = setInterval(checkAuth, 7000);

		return () => {
			clearInterval(officeInterval);
			clearInterval(fileTypesInterval);
			clearInterval(allFilesInterval);
			clearInterval(checkAuthInterval);
		};
	}, [isAuthenticated]);

	return (
		<Context.Provider
			value={{
				loading,
				setInitialLoadingOffices,
				setInitialLoadingFiles,
				setInitialLoadingTypes,
				toast,
				register,
				login,
				logout,
				user,
				isAuthenticated,
				isAdmin,
				addOffice,
				updateOffice,
				deleteOffice,
				offices,
				limitedOffices,
				addFileType,
				fileTypes,
				addFile,
				updateFile,
				deleteFile,
				getFileData,
				fileData,
				files,
				limitedFiles,
			}}
		>
			{children}
			<ToastContainer position="bottom-right" autoClose={700} />
			{(initialLoadingOffices ||
				initialLoadingFiles ||
				initialLoadingTypes) && (
				<div className="loader">
					<img src={plane} className="plane" />
				</div>
			)}
		</Context.Provider>
	);
};
