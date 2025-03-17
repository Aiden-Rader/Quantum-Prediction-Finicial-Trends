import React from "react";
import StockChart from './stockchart';
import StockList from './stocklist';
import PredictionWidget from './predictionwidget';

const Dashboard = () => (
	<div className="p-6">
		<h1 className="text-2xl font-semibold mb-4">Quantum Financial Trends</h1>
		<div className="grid grid-cols-3 gap-4">
			<div className="col-span-2">
				<StockChart />
			</div>
			<div className="col-span-1 flex flex-col gap-4">
				<PredictionWidget />
				<StockList />
			</div>
		</div>
	</div>
);

export default Dashboard;