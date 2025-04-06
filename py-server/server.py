import pickle
import pandas as pd
import numpy as np
import xgboost as xgb
from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS

# Load the trained model properly
model = xgb.XGBRegressor()
model.load_model("./model/sales_forecast_model.json")

# Load encoders
with open("./model/label_encoders.pkl", "rb") as f:
    le_category, le_sub_category, sales_data = pickle.load(f)

# Define features used in training
FEATURES = ['Category_Encoded', 'Sub_Category_Encoded', 'Lag_1', 'Lag_2', 'Rolling_Mean_3', 'Month', 'Year']

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    year = int(data['year'])
    month = int(data['month'])
    
    # Prepare future data
    last_month_sales = sales_data[sales_data['Year-Month'] == sales_data['Year-Month'].max()].copy()
    last_month_sales['Lag_2'] = last_month_sales['Lag_1'].fillna(method='bfill')
    
    future_data = last_month_sales.copy()
    future_data['Year-Month'] = pd.Timestamp(year, month, 1)
    future_data['Month'] = month
    future_data['Year'] = year
    
    # Predict
    predictions = model.predict(future_data[FEATURES])
    future_data['Predicted_Sales'] = np.round(predictions).astype(int)
    future_data['Predicted_Category'] = le_category.inverse_transform(future_data['Category_Encoded'])
    future_data['Predicted_Sub_Category'] = le_sub_category.inverse_transform(future_data['Sub_Category_Encoded'])
    
    # Format JSON response
    result = future_data[['Month', 'Predicted_Category', 'Predicted_Sub_Category', 'Predicted_Sales']].to_dict(orient='records')
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
