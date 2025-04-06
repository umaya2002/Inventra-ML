import pandas as pd
import numpy as np
import xgboost as xgb
import pickle
from sklearn.preprocessing import LabelEncoder

# Load dataset
file_path = "superstore_final_dataset.csv"
df = pd.read_csv(file_path, encoding="ISO-8859-1")

# Convert Order_Date to datetime
df['Order_Date'] = pd.to_datetime(df['Order_Date'], dayfirst=True, errors='coerce')
df.dropna(subset=['Order_Date'], inplace=True)
df['Year-Month'] = df['Order_Date'].dt.to_period('M')

# Aggregate sales data
sales_data = df.groupby(['Year-Month', 'Category', 'Sub_Category']).size().reset_index(name='Sales_Count')
sales_data['Year-Month'] = sales_data['Year-Month'].astype(str)
sales_data['Year-Month'] = pd.to_datetime(sales_data['Year-Month'])

# Label Encoding
le_category = LabelEncoder()
le_sub_category = LabelEncoder()
sales_data['Category_Encoded'] = le_category.fit_transform(sales_data['Category'])
sales_data['Sub_Category_Encoded'] = le_sub_category.fit_transform(sales_data['Sub_Category'])

# Creating lag features
sales_data.sort_values(by=['Year-Month'], inplace=True)
sales_data['Lag_1'] = sales_data.groupby(['Category_Encoded', 'Sub_Category_Encoded'])['Sales_Count'].shift(1)
sales_data['Lag_2'] = sales_data.groupby(['Category_Encoded', 'Sub_Category_Encoded'])['Sales_Count'].shift(2)
sales_data['Rolling_Mean_3'] = sales_data.groupby(['Category_Encoded', 'Sub_Category_Encoded'])['Sales_Count'].transform(lambda x: x.rolling(3, min_periods=1).mean())

# Extract Month and Year
sales_data['Month'] = sales_data['Year-Month'].dt.month
sales_data['Year'] = sales_data['Year-Month'].dt.year

# Drop NaN values
sales_data.dropna(inplace=True)

# Define features and target
FEATURES = ['Category_Encoded', 'Sub_Category_Encoded', 'Lag_1', 'Lag_2', 'Rolling_Mean_3', 'Month', 'Year']
X = sales_data[FEATURES]
y = sales_data['Sales_Count']

# Train model
model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=200, learning_rate=0.1, max_depth=5)
model.fit(X, y)

# Save model properly
model.save_model("sales_forecast_model.json")

# Save encoders separately
with open("label_encoders.pkl", "wb") as f:
    pickle.dump((le_category, le_sub_category, sales_data), f)

print("Model and encoders saved successfully!")
