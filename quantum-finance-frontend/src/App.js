import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home.jsx";
import Dashboard from "./pages/dashboard.jsx";

export default function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/dashboard/:symbol" element={<Dashboard />} />
			</Routes>
		</Router>
	);
}