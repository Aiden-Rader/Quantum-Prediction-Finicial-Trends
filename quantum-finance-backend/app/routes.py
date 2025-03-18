from flask import Blueprint, request, jsonify
from ai_predictor import predict_next_price

api_bp = Blueprint("api", __name__)

@api_bp.route("/predict", methods=["POST"])
def predict():
	try:
		data = request.json
		predicted_price = predict_next_price(data)
		return jsonify({"predicted_price": predicted_price})
	except Exception as e:
		return jsonify({"error": str(e)}), 500
