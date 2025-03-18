import { useEffect } from "react";
import { motion } from "framer-motion";

export default function Notification({ message, type = "info", on_close }) {
	const type_styles = {
		error: "bg-red-500 text-white",
		success: "bg-green-500 text-white",
		warning: "bg-yellow-500 text-black",
		info: "bg-blue-500 text-white",
	};

	// Setting a timeout function
	useEffect(() => {
		if (message) {
			const timer = setTimeout(() => {
				on_close();
			}, 4000);

			return () => clearTimeout(timer);
		}
	}, [message, on_close]);

	// If no message, return null
	if (!message) {
		return null;
	}

	return (
		// Notification container
		<motion.div
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -10 }}
			className={`fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center justify-between gap-4 
				${type_styles[type] || type_styles["info"]
			}`}
		>
			{/* Notification message */}
			<span>{message}</span>

			{/* Close button */}
			<button
				onClick={on_close}
				className="ml-3 text-white font-bold"
			>
				✖
			</button>
		</motion.div>
	);
}

