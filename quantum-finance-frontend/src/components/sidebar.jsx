import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";

const YAHOO_API_KEY = process.env.REACT_APP_YAHOO_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;

export default function Sidebar({ symbol, latestData, sidebarOpen, setSidebarOpen }) {
	const [companyInfo, setCompanyInfo] = useState(null);
	const [news, setNews] = useState([]);
	const [loading, setLoading] = useState(true);
	const [stockQuote, setStockQuote] = useState(null);

	// Fetch Data When Symbol Changes
	useEffect(() => {
		if (!symbol) return;

		async function fetchCompanyData() {
			setLoading(true);
			try {
				// Fetch Company Profile (Alpha Vantage API) 25 calls per day
				const companyRes = await axios.get(
					`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
				);

				if (companyRes.data) {
					setCompanyInfo({
						name: companyRes.data.Name || "N/A",
						industry: companyRes.data.Industry || "N/A",
						sector: companyRes.data.Sector || "N/A",
						marketCap: companyRes.data.MarketCapitalization
							? `$${(companyRes.data.MarketCapitalization / 1e9).toFixed(2)}B`
							: "N/A",
						website: companyRes.data.OfficialSite || "#",
						description: companyRes.data.description || "N/A",
					});
				}

				// Fetch Stock Quote (Yahoo Finance)
				const stockRes = await axios.get(
					`https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/quotes`,
					{
						params: { ticker: symbol },
						headers: {
							"x-rapidapi-key": YAHOO_API_KEY,
							"x-rapidapi-host": "yahoo-finance15.p.rapidapi.com"
						},
					}
				);

				const stockData = stockRes.data.body?.[0] || {};
				setStockQuote({
					regularMarketPrice: stockData.regularMarketPrice || "N/A",
					previousClose: stockData.regularMarketPreviousClose || "N/A",
					dayHigh: stockData.regularMarketDayHigh || "N/A",
					dayLow: stockData.regularMarketDayLow || "N/A",
					yearHigh: stockData.fiftyTwoWeekHigh || "N/A",
					yearLow: stockData.fiftyTwoWeekLow || "N/A",
					peRatio: stockData.trailingPE || "N/A",
					dividendYield: stockData.dividendYield ? `${stockData.dividendYield}%` : "N/A",
					dividendDate: stockData.dividendDate
						? new Date(stockData.dividendDate * 1000).toLocaleDateString()
						: "N/A",
					eps: stockData.epsTrailingTwelveMonths || "N/A",
					marketCap: stockData.marketCap
						? `$${(stockData.marketCap / 1e9).toFixed(2)}B`
						: "N/A",
					earningsDate: stockData.earningsTimestamp
						? new Date(stockData.earningsTimestamp * 1000).toLocaleDateString()
						: "N/A",
				});

				// Fetch Company News (Yahoo Finance)
				const newsRes = await axios.get(
					`https://yahoo-finance15.p.rapidapi.com/api/v1/markets/news`,
					{
						params: { ticker: symbol },
						headers: {
							"x-rapidapi-key": YAHOO_API_KEY,
							"x-rapidapi-host": "yahoo-finance15.p.rapidapi.com"
						},
					}
				);

				setNews(newsRes.data?.body || []);
			} catch (error) {
				console.error("Error fetching company data:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchCompanyData();
	}, [symbol]);

	// Hide sidebar if closed
	if (!sidebarOpen) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ x: "100%" }}
				animate={{ x: 0 }}
				exit={{ x: "100%" }}
				transition={{ duration: 0.3 }}
				className="fixed top-0 right-0 w-[400px] h-full bg-gray-800 shadow-lg text-white p-6 overflow-y-auto"
			>
				{/* Sidebar Header */}
				<div className="flex justify-between items-center">
					<h2 className="text-xl font-bold">Stock Details</h2>
					<button
						onClick={() => setSidebarOpen(false)}
						className="text-gray-400 hover:text-white text-xl"
					>
						✖
					</button>
				</div>

				{/* Loading Spinner */}
				{loading ? (
					<p className="text-gray-400 mt-6">Loading data...</p>
				) : (
					<>
						{/* Company Profile */}
						{companyInfo && (
							<div className="mt-6 space-y-3 text-lg">
								<h3 className="text-lg font-semibold text-center">🏢 Company Profile</h3>
								<p>Name: <span className="text-blue-300">{companyInfo.name}</span></p>
								<p>Sector: <span className="text-blue-300">{companyInfo.sector}</span></p>
								<p>Industry: <span className="text-blue-300">{companyInfo.industry}</span></p>
								<p>Market Cap: <span className="text-yellow-400">{companyInfo.marketCap}</span></p>
								<p className="truncate">📄 {companyInfo.description}</p>
								<a
									href={companyInfo.website}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-400 hover:underline"
								>
									Visit Website
								</a>
							</div>
						)}

						{/* Stock Performance */}
						<div className="mt-4 space-y-3 text-lg">
							<h3 className="text-lg font-semibold text-center">📈 Stock Performance</h3>
							<p>📊 Price: <span className="text-green-400">${stockQuote.regularMarketPrice}</span></p>
							<p>📉 Prev Close: <span className="text-red-400">${stockQuote.previousClose}</span></p>
							<p>📈 Day High: <span className="text-green-400">${stockQuote.dayHigh}</span></p>
							<p>📉 Day Low: <span className="text-red-400">${stockQuote.dayLow}</span></p>
							<p>📈 52W High: <span className="text-green-300">${stockQuote.yearHigh}</span></p>
							<p>📉 52W Low: <span className="text-red-300">${stockQuote.yearLow}</span></p>
							<p>📊 P/E Ratio: <span className="text-blue-400">{stockQuote.peRatio}</span></p>
							<p>💰 Dividend Yield: <span className="text-yellow-400">{stockQuote.dividendYield}</span></p>
							<p>📅 Earnings: <span className="text-yellow-400">{stockQuote.earningsDate}</span></p>
						</div>

						{/* News Section */}
						<div className="mt-6">
							<h3 className="text-lg font-semibold text-center">📰 Recent News</h3>
							<br></br>
							<ul className="space-y-3">
									{news.slice(0, 5).map((article, index) => (
										<div key={index} className="p-3 bg-gray-700 rounded-lg shadow hover:bg-gray-600 transition">
											<a href={article.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
												{article.title}
											</a>
											<p className="text-gray-400 text-sm">{new Date(article.pubDate).toLocaleDateString()}</p>
										</div>
									))}
							</ul>
						</div>
					</>
				)}
			</motion.div>
		</AnimatePresence>
	);
}
