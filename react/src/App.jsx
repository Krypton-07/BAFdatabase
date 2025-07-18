import Home from './pages/home/home.jsx';
import File from './pages/file/file.jsx';
import FourZeroFour from './pages/404/404.jsx';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/navbar.jsx';
import Login from './pages/login/login.jsx';
import Register from './pages/register/register.jsx';
import ImgView from './pages/imgView/imgView.jsx';
import AddOffice from './pages/addOffice/addOffice.jsx';
import AddFileType from './pages/addFileType/addFileType.jsx';
import AddFile from './pages/addFile/addFile.jsx';
import FileTypeShow from './pages/fileTypeShow/fileTypeShow.jsx';
import Query from './pages/query/query.jsx';

function App() {
	return (
		<>
			<Navbar />
			<main>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="*" element={<FourZeroFour />} />

					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />

					<Route path="/addOffice" element={<AddOffice />} />
					<Route path="/addFileType" element={<AddFileType />} />
					<Route path="/addFile" element={<AddFile />} />

					<Route path="/office/:name" element={<FileTypeShow />} />
					<Route path="/:name/file/:fileType" element={<File />} />
					<Route
						path="/:name/file/:fileType/:fileName"
						element={<ImgView />}
					/>
					<Route
						path="/:name/file/:fileType/query/:fileName"
						element={<Query />}
					/>
				</Routes>
			</main>
		</>
	);
}

export default App;
