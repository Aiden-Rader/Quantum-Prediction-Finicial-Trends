import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import StockChart from "../components/stockchart";
import PredictionWidget from "../components/predictionwidget";
import Notification from "../components/notifications";
import Sidebar from "../components/sidebar";

const API_KEY = process.env.REACT_APP_TWELVEDATA_API;

export default function Dashboard() {
	const navigate = useNavigate();
	const { symbol } = useParams();
	const [stockData, setStockData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [notification, setNotification] = useState(null);
	const [lastUpdated, setLastUpdated] = useState(null);
	const [interval, setIntervalValue] = useState("1day");
	const [sidebarOpen, setSidebarOpen] = useState(false);

	// Function to fetch stock data (Polling)
	async function fetchStockData(selectedInterval = "1day") {
		try {
			const response = await axios.get(
				`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${selectedInterval}&outputsize=30&apikey=${API_KEY}`
			);

			if (response.data?.values) {
				setStockData(response.data);
				setLastUpdated(new Date().toLocaleTimeString());
			} else {
				setNotification({ message: "Stock data not found", type: "warning" });
			}
		} catch (err) {
			console.error("Error fetching stock data:", err);
			setNotification({ message: "Failed to fetch stock data", type: "error" });
		} finally {
			setLoading(false);
		}
	}

	// Polling every 60 seconds & when interval changes
	useEffect(() => {
		setLoading(true);
		fetchStockData(interval);

		const pollingInterval = setInterval(() => {
			fetchStockData(interval);
		}, 60000);

		return () => clearInterval(pollingInterval);
	}, [symbol, interval]);

	// Handle Loading & Errors
	if (loading) {
		return <p className="text-white">Loading stock data...</p>;
	}

	const latestData = stockData?.values?.[0] || {};
	const meta = stockData?.meta || {};

	return (
		<div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
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

			{/* Go Back Button */}
			<button
				onClick={() => navigate(-1)}
				className="absolute top-5 left-5 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md shadow-md transition"
			>
				⬅ Go Back To Search
			</button>

			{/* Sidebar Toggle Button */}
			<button
				onClick={() => setSidebarOpen(true)}
				className="absolute top-5 right-5 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md shadow-md transition"
			>
				☰
			</button>

			{/* Sidebar Component */}
			<Sidebar symbol={symbol} latestData={latestData} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

			{!stockData ? (
				<p className="text-gray-400">No stock data available.</p>
			) : (
				< >
					<motion.h1
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="text-3xl font-bold"
					>
						{symbol} - {meta.exchange || "Unknown Exchange"}
					</motion.h1>
					<p className="text-sm text-gray-400">Last Updated: {lastUpdated}</p>

					{/* Interval Selection */}
					<div className="mt-4">
							<label for="interval" className="mr-2 text-gray-400">Select Interval:</label>
						<select
							value={interval}
							onChange={(e) => setIntervalValue(e.target.value)}
							className="p-2 rounded-md bg-gray-800 text-white"
						>
							<option value="1min">1 Min</option>
							<option value="5min">5 Min</option>
							<option value="30min">30 Min</option>
							<option value="1h">1 Hour</option>
							<option value="1day">1 Day</option>
							<option value="1week">1 Week</option>
							<option value="1month">1 Month</option>
						</select>
					</div>

					{/* Stock Chart */}
					<div className="w-full max-w-4xl mt-6">
						<StockChart stockData={stockData} />
					</div>

					{/* AI Prediction Widget */}
					<div className="w-full max-w-2xl mt-6">
						<PredictionWidget stockData={stockData} />
					</div>
				</ >
			)}
		</div>
	);
}
