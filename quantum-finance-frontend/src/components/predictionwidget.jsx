// const PredictionWidget = ({ prediction }) => (
// 	<div className="bg-gray-800 p-4 rounded-lg shadow">
// 		<h2 className="font-semibold text-lg">Prediction & Insights</h2>
// 		<p className="mt-2">
// 			Model suggests stock will move: <strong>{prediction.direction}</strong><br />
// 			Confidence: <strong>{prediction.confidence}%</strong>
// 		</p>
// 		<p className="text-sm mt-2">{prediction.insights}</p>
// 	</div>
// );

// export default PredictionWidget;

export default function PredictionWidget() {
	return (
		<div className="bg-gray-800 rounded-lg shadow-md p-4">
			<h2 className="text-lg font-bold mb-2">Quantum Prediction 🔮</h2>
			<p className="mb-2">Prediction: <span className="font-semibold text-green-400">Bullish 📈</span></p>
			<p className="text-sm text-gray-400">Confidence: 85%</p>
			<p className="mt-2 text-sm text-gray-300">
				Quantum model indicates a high probability of upward movement based on recent market trends.
			</p>
		</div>
	);
}
