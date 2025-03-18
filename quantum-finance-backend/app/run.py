import os
import joblib
import numpy as np
from collections import deque
from flask import Flask, request, jsonify

app = Flask(__name__)

# Get the absolute path to the ML-model-training directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "ML-model-training", "stock_model.pkl"))
SCALER_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "ML-model-training", "scaler.pkl"))

# Try and Load model and scaler from pkl files
try:
	model = joblib.load(MODEL_PATH)
	scaler = joblib.load(SCALER_PATH)
	print('Successfully loaded model and scaler')
except FileNotFoundError as e:
	print(f"Error: {e}. Ensure that the model and scaler files exist.")
	model, scaler = None, None
except Exception as e:
	print(f"Unexpected error loading model or scaler: {e}")
	model, scaler = None, None

# Store last 5 days of full stock features (Open, High, Low, Close, Volume)
feature_history = deque(maxlen=5)

def predict_next_price():

	if model is None or scaler is None:
		return {"error": "Model or scaler not loaded. Cannot make predictions."}

	try:
		# Ensure we have 5 full days before predicting
		if len(feature_history) < 5:
			needed = 5 - len(feature_history)
			return {"error": f"Not enough historical data. Need {needed} more days."}

		# Convert the last 5 days into a NumPy array
		input_features = np.array(feature_history).flatten().reshape(1, -1)

		# Scale input data
		scaled_features = np.array([scaler.transform(day.reshape(1, -1)).flatten() for day in input_features[0].reshape(5, 5)]).flatten().reshape(1, -1)

		# Make prediction
		predicted_price = model.predict(scaled_features)

		# Inverse transform the predicted price
		predicted_price_original = scaler.inverse_transform([[0, 0, 0, predicted_price[0], 0]])[0][3]

		return jsonify({"predicted_price": float(predicted_price_original)})

	except Exception as e:
		print("Prediction Error:", e)
		return {"error": str(e)}

@app.route('/predict', methods=['POST'])
def predict():
	try:
		data = request.get_json()
		if not data:
			return jsonify({"error": "No data received"}), 400

		# Ensure all required fields are present
		required_fields = ["open", "high", "low", "close", "volume"]
		if not all(field in data for field in required_fields):
			return jsonify({"error": f"Missing required fields. Expected {required_fields}, got {list(data.keys())}"}), 400

		# Store full feature set
		feature_history.append([
			data["open"], data["high"], data["low"], data["close"], data["volume"]
		])

		# Call the prediction function
		prediction_result = predict_next_price()
		return prediction_result

	except Exception as e:
		return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
	app.run(debug=True)
