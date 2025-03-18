import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import Notification from "../components/notifications";

const API_KEY = process.env.REACT_APP_TWELVEDATA_API;

export default function Home() {
	const [query, setQuery] = useState("");
	const [stocks, setStocks] = useState([]);
	const [market, setMarket] = useState("All");
	const [loading, setLoading] = useState(false);
	const [notification, setNotification] = useState(null);
	const [input_error, setInputError] = useState(false);

	const navigate = useNavigate();

	// Function to fetch stocks from API
	async function fetchStocks() {
		if (!query.trim()) {
			setNotification({ message: "Please enter a stock symbol!", type: "error" });
			setInputError(true);
			setStocks([]);
			return;
		}

		setLoading(true);
		try {
			const response = await axios.get(`https://api.twelvedata.com/symbol_search?symbol=${query}&apikey=${API_KEY}`);

			var results = response.data?.data ?? [];

			if (results.length === 0) {
				setNotification({ message: "No stocks found!", type: "warning" });
				setInputError(true);
			} else {
				setInputError(false);
			}

			// 🔹 Apply Market Filters Correctly
			if (market === "United States") {
				results = results.filter(stock => stock.exchange === "NASDAQ" || stock.exchange === "NYSE");
			} else if (market === "Crypto") {
				results = results.filter(stock => stock.instrument_type === "crypto");
			}

			setStocks(results);
		} catch (error) {
			setNotification({ message: "Error fetching stocks. Try again!", type: "error" });
			setStocks([]);
		} finally {
			setLoading(false);
		}
	}


	function clearSearch() {
		setQuery("");
		setStocks([]);
		setNotification(null);
		setInputError(false);
	}

	function handleKeyPress(event) {
		if (event.key === "Enter") {
			fetchStocks();
		}
	}

	// Remove input error highlight after 5 seconds
	useEffect(() => {
		if (input_error) {
			const timer = setTimeout(() => {
				setInputError(false);
			}, 4000);

			return () => clearTimeout(timer);
		}
	}, [input_error]);

	return (
		<div className="relative min-h-screen flex flex-col items-center justify-center text-white p-6">
			{/* Notification Popup */}
			<AnimatePresence>
				{notification && (
					<Notification
						message={notification.message}
						type={notification.type}
						on_close={() => setNotification(null)}
					/>
				)}
			</AnimatePresence>

			{/* Heading */}
			<motion.h1 className="text-4xl font-bold text-center">
				📈 Welcome To Quantum Finance
			</motion.h1>

			{/* Subheading */}
			<motion.p className="text-gray-400 text-lg mt-2">
				Search for a stock to view market trends & gather quantum AI predictions.
			</motion.p>

			{/* Search Bar */}
			<motion.div className="mt-6 w-full max-w-lg flex items-center">
				<input
					type="text"
					placeholder="Enter stock symbol (e.g., AAPL, TSLA)"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={handleKeyPress}
					className={`w-full p-3 rounded-md text-black outline-none transition-all duration-300 ${
						input_error ? "border-2 border-red-500" : "border-2 border-transparent"
					}`}
				/>
				<button
					onClick={() => fetchStocks()}
					className="bg-blue-600 px-5 py-3 rounded-md hover:bg-blue-700 ml-2"
				>
					Search
				</button>
				<button
					onClick={clearSearch}
					className="bg-slate-400 px-5 py-3 rounded-md hover:bg-slate-300 ml-2"
				>
					Clear
				</button>
			</motion.div>

			{/* Filters */}
			<div className="flex flex-wrap justify-center gap-4 mt-4">
				<select value={market} onChange={(e) => setMarket(e.target.value)} className="bg-gray-800 text-white p-2 rounded-md">
					<option value="All">All Markets</option>
					<option value="United States">NYSE/NASDAQ</option>
					<option value="Crypto">Cryptocurrency (WIP)</option>
				</select>
			</div>

			{/* Stock Results */}
			{stocks.length > 0 && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="mt-6 w-full max-w-lg bg-gray-800 rounded-lg p-4 shadow-md"
				>
					<h2 className="text-xl font-semibold">Search Results</h2>
					{loading ? (
						<p className="text-gray-400">Loading...</p>
					) : (
						<ul className="mt-3 space-y-2">
							<AnimatePresence>
								{stocks.map((stock, index) => (
									<motion.li
										key={stock.symbol}
										initial={{ opacity: 0, y: -5 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -5 }}
										transition={{ duration: 0.4 }}
										whileHover={{ scale: 1.05 }}
										className="p-2 cursor-pointer hover:bg-gray-700 rounded-md transition flex items-center gap-3"
										onClick={() => navigate(`/dashboard/${stock.symbol}`)}
									>
										<span className="text-lg">
											{stock.instrument_name} ({stock.symbol})
										</span>
									</motion.li>
								))}
							</AnimatePresence>
						</ul>
					)}
				</motion.div>
			)}
		</div>
	);
}
