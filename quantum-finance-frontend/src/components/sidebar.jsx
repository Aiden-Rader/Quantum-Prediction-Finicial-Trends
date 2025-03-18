import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";

const YAHOO_API_KEY = process.env.REACT_APP_YAHOO_API_KEY;
const POLYGONIO_API_KEY = process.env.REACT_APP_POLYGON.IO_API_KEY;

export default function Sidebar({ symbol, sidebarOpen, setSidebarOpen }) {
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
				// Fetch Company Profile (Polygon.io)
				const companyRes = await axios.get(
					`https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${POLYGONIO_API_KEY}`
				);

				const companyData = companyRes.data.results || {};
				if (companyData && companyRes.status == 200) {
					setCompanyInfo({
						name: companyData.name || "N/A",
						sector: companyData.sic_description || "N/A",
						marketCap: companyData.market_cap ? `$${(companyData.market_cap / 1e9).toFixed(2)}B` : "N/A",
						website: companyData.homepage_url || "#",
						description: companyData.description || "N/A",
						logo: companyData.branding.logo_url || "https://via.placeholder.com/150",
						icon: companyData.branding.icon_url || "https://via.placeholder.com/150"
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
				if (stockData && stockRes.status == 200) {
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
				}

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

				if (newsRes.status == 200) {
					setNews(newsRes.data.body || []);
				}
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
					<div className="flex items-center gap-2">
						<img src={companyInfo.icon} alt="Icon" className="w-6 h-6" />
						<h2 className="text-xl font-bold">Stock Details - ({symbol})</h2>
					</div>
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
								<p>Market Cap: <span className="text-yellow-400">{companyInfo.marketCap}</span></p>
									<p>Description: <span className="text-green-200">{companyInfo.description}</span></p>
									<span>Company Website: <a
										href={companyInfo.website}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-400 hover:underline"
									>
										{companyInfo.website}
									</a>
									</span>
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
