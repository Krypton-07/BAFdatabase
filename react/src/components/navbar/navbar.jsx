import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import styles from './navbar.module.css';
import { UseContext } from '../../context';

const Navbar = () => {
	const { isAuthenticated, logout, isAdmin, files, limitedFiles, user } =
		UseContext();
	const navigate = useNavigate();

	const [isShortScreen, setIsShortScreen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchInput, setSearchInput] = useState('');

	useEffect(() => {
		const handleResize = () => setIsShortScreen(window.innerWidth <= 936);
		handleResize();

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const searchResults = useMemo(() => {
		if (user?.role === 'admin') {
			if (!searchInput || !files) return [];
			const input = searchInput.toLowerCase();

			return files?.filter(e => e.name.toLowerCase().includes(input));
		} else if (user?.role === 'user') {
			if (!searchInput || !limitedFiles) return [];
			const input = searchInput.toLowerCase();

			return limitedFiles?.filter(e =>
				e.name.toLowerCase().includes(input)
			);
		}
	}, [searchInput, files, limitedFiles, user?.role]);

	const handleSearch = useCallback(e => setSearchInput(e.target.value), []);

	const goHome = useCallback(() => navigate('/'), [navigate]);
	const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

	const openSearch = useCallback(() => {
		setIsSearchOpen(true);
		setIsMobileMenuOpen(false);
	}, []);

	const closeSearch = useCallback(() => {
		setIsSearchOpen(false);
		setSearchInput('');
	}, []);

	const handleLogout = useCallback(() => {
		logout();
		closeMobileMenu();
	}, [logout, closeMobileMenu]);

	const menuRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = e => {
			if (
				isMobileMenuOpen &&
				menuRef.current &&
				!menuRef.current.contains(e.target)
			) {
				setIsMobileMenuOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () =>
			document.removeEventListener('mousedown', handleClickOutside);
	}, [isMobileMenuOpen]);

	const renderAuthLinks = useCallback(() => {
		const LinkItem = ({ to, children, onClick }) => (
			<NavLink
				to={to}
				onClick={onClick}
				className={({ isActive }) =>
					isActive
						? `${styles.navLink} ${styles.active}`
						: styles.navLink
				}
			>
				{children}
			</NavLink>
		);

		if (!isAuthenticated) {
			return (
				<>
					<LinkItem to="/login" onClick={closeMobileMenu}>
						Login
					</LinkItem>
				</>
			);
		}

		return (
			<>
				<button
					onClick={openSearch}
					aria-label="Open search"
					aria-expanded={isSearchOpen}
					aria-controls="search-bar"
				>
					<i className="fas fa-search" />
				</button>

				{isAdmin && (
					<>
						<LinkItem to="/addOffice" onClick={closeMobileMenu}>
							Add Office
						</LinkItem>
						<LinkItem to="/addFileType" onClick={closeMobileMenu}>
							Add FileType
						</LinkItem>
						<LinkItem to="/addFile" onClick={closeMobileMenu}>
							Add File
						</LinkItem>
						<LinkItem to="/register" onClick={closeMobileMenu}>
							Register
						</LinkItem>
					</>
				)}

				<button onClick={handleLogout}>Log Out</button>
			</>
		);
	}, [
		isAuthenticated,
		isAdmin,
		closeMobileMenu,
		openSearch,
		handleLogout,
		isSearchOpen,
	]);

	return (
		<header className={styles.header}>
			<nav className={styles.navbar}>
				<h2 onClick={goHome} className={styles.navbarTitle}>
					<i className="fas fa-database"></i>
					<p>BAF</p>
				</h2>

				{isShortScreen ? (
					<>
						<button
							className={styles.hamburger}
							onClick={() => setIsMobileMenuOpen(true)}
						>
							☰
						</button>

						{isMobileMenuOpen && (
							<aside className={styles.mobileMenu} ref={menuRef}>
								<button
									className={styles.cross}
									onClick={closeMobileMenu}
									aria-label="Close menu"
								>
									×
								</button>
								<section
									className={styles.mobileMenuNavbarLinks}
								>
									{renderAuthLinks()}
								</section>
							</aside>
						)}
					</>
				) : (
					<section className={styles.navbarLinks}>
						{renderAuthLinks()}
					</section>
				)}
			</nav>

			{isSearchOpen && (
				<div
					className={styles.searchContainer}
					id="search-bar"
					role="search"
				>
					<nav className={styles.searchBar}>
						<input
							type="text"
							placeholder="Search files..."
							value={searchInput}
							onChange={handleSearch}
							autoFocus
							className={styles.searchInput}
						/>
						<button
							onClick={closeSearch}
							aria-label="Close search"
							className={styles.searchCloseButton}
						>
							&times;
						</button>
					</nav>

					{searchInput && (
						<section className={styles.searchResults}>
							{searchResults.length > 0 ? (
								searchResults.map((result, index) => (
									<NavLink
										key={index}
										to={`/${result.officeName}/file/${result.fileType}/query/${result.name}`}
										onClick={closeSearch}
										className={styles.searchResultItem}
									>
										{result.name}
										<span className={styles.subText}>
											<span>/</span>
											{result.officeName}
											<span>/</span>
											{result.fileType}
										</span>
									</NavLink>
								))
							) : (
								<p className={styles.noResultsText}>
									No results found
								</p>
							)}
						</section>
					)}
				</div>
			)}
		</header>
	);
};

export default Navbar;
