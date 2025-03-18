export default function Navbar() {
	return (
		<div className="bg-gray-800 px-6 py-3 rounded-lg shadow-md flex items-center justify-between">
			<h1 className="text-lg font-bold">📈 Quantum Finance</h1>
			<button className="bg-blue-600 px-4 py-2 text-sm rounded-md hover:bg-blue-700">
				Settings
			</button>
		</div>
	);
}
