import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Line, Legend, Rectangle } from "recharts";

export default function StockChart({ stockData }) {
	if (!stockData || !stockData.values || stockData.values.length === 0) {
		return <p className="text-white">No stock data available.</p>;
	}

	// Extract stock values
	const stockDataValues = stockData.values;

	// Format data for Recharts
	const formattedData = stockDataValues
		.map((item) => ({
			date: new Date(item.datetime).toLocaleDateString(),
			open: parseFloat(item.open),
			high: parseFloat(item.high),
			low: parseFloat(item.low),
			close: parseFloat(item.close),
		}))
		.reverse();

	// Determine if stock is up or down
	var firstClose = formattedData[0]?.close;
	var lastClose = formattedData[formattedData.length - 1]?.close;
	const trendUp = lastClose > firstClose;
	const lineColor = trendUp ? "#4CAF50" : "#EF4444";
	const percentChange = ((lastClose - firstClose) / firstClose * 100).toFixed(2);

	return (
		<div className="w-full max-w-5xl p-4 bg-gray-800 rounded-lg shadow-lg">
			<h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
				Stock Price Chart
				<span className={trendUp ? "text-green-400" : "text-red-400"}>
					{trendUp ? "⬆" : "⬇"} {percentChange}%
				</span>
			</h2>

			<ResponsiveContainer width="100%" height={400}>
				<ComposedChart data={formattedData}>
					<CartesianGrid strokeDasharray="3 3" stroke="#555" />
					<XAxis dataKey="date" stroke="#ddd" tick={{ fontSize: 12 }} />
					<YAxis stroke="#ddd" domain={["auto", "auto"]} />
					<Tooltip
						formatter={(value, name) => [`$${value}`, name]}
						contentStyle={{ backgroundColor: "#333", color: "#fff" }}
					/>

					{/* Custom Candlestick Rendering */}
					{formattedData.map((data, index) => (
						<Rectangle
							key={index}
							x={index * 10}
							y={Math.min(data.open, data.close)}
							width={8}
							height={Math.abs(data.open - data.close)}
							fill={data.open < data.close ? "rgba(34, 197, 94, 0.7)" : "rgba(239, 68, 68, 0.7)"} // Softer transparency
							stroke={data.open < data.close ? "green" : "red"} // Thin outline
							strokeWidth={1}
						/>
					))}

					{/* High-Low Wicks */}
					<Bar dataKey="high" fill="transparent" stroke="gray" />
					<Bar dataKey="low" fill="transparent" stroke="gray" />

					{/* Dynamic Line Chart */}
					<Line type="monotone" dataKey="close" stroke={lineColor} strokeWidth={2} />
				</ComposedChart>
			</ResponsiveContainer>
		</div>
	);
}