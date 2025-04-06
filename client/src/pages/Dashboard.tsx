import { Col, Row } from 'antd';
import MonthlyChart from '../components/Charts/MonthlyChart';
import Loader from '../components/Loader';
import { useCountProductsQuery } from '../redux/features/management/productApi';
import { useYearlySaleQuery } from '../redux/features/management/saleApi';
import DailyChart from '../components/Charts/DailyChart';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

interface PredictedData {
  Month: number;
  Predicted_Category: string;
  Predicted_Sales: number;
  Predicted_Sub_Category: string;
}

const Dashboard = () => {
  const { data: products, isLoading } = useCountProductsQuery(undefined);
  const { data: yearlyData, isLoading: isLoading1 } = useYearlySaleQuery(undefined);
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const months = Array.from(
    { length: 12 - currentMonth + 1 },
    (_, i) => i + currentMonth
  ).filter(month => month > currentMonth);

  const [selectedMonth, setSelectedMonth] = useState<number>(
    Math.max(4, currentMonth)
  );
  const [predictedData, setPredictedData] = useState<PredictedData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:5000/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            year: 2025,
            month: selectedMonth,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch predictions');
        }

        const data = await response.json();
        setPredictedData(data);
      } catch (error) {
        console.error('Error fetching predictions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [selectedMonth]);

  // Transform data to include category with sub-category
  const chartData = predictedData.map(item => ({
    category: item.Predicted_Sub_Category,
    sales: item.Predicted_Sales
  }));

  if (isLoading && isLoading1) return <Loader />;
  
  return (
    <>
      <Row style={{ paddingRight: '1rem' }}>
        <Col xs={{ span: 24 }} lg={{ span: 8 }} style={{ padding: '.5rem' }}>
          <div className='number-card'>
            <h3>Total Stock</h3>
            <h1>{products?.data?.totalQuantity || 0}</h1>
          </div>
        </Col>
        <Col xs={{ span: 24 }} lg={{ span: 8 }} style={{ padding: '.5rem' }}>
          <div className='number-card'>
            <h3>Total Item Sell </h3>
            <h1>
              {yearlyData?.data.reduce(
                (acc: number, cur: { totalQuantity: number }) => (acc += cur.totalQuantity),
                0
              )}
            </h1>
          </div>
        </Col>
        <Col xs={{ span: 24 }} lg={{ span: 8 }} style={{ padding: '.5rem' }}>
          <div className='number-card'>
            <h3>Total Revenue</h3>
            <h1>
              $
              {yearlyData?.data.reduce(
                (acc: number, cur: { totalRevenue: number }) => (acc += cur.totalRevenue),
                0
              )}
            </h1>
          </div>
        </Col>
      </Row>

      <div
        style={{
          border: '1px solid gray',
          margin: '1rem',
          padding: '1rem',
          borderRadius: '10px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Predicted Sales by Sub-Category</h2>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              minWidth: '150px'
            }}
          >
            {months.map(month => (
              <option key={month} value={month}>
                {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        
        {loading ? (
          <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader />
          </div>
        ) : (
          <div style={{ height: '500px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 120 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#1890ff" name="Predicted Sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div
        style={{
          border: '1px solid gray',
          margin: '1rem',
          padding: '1rem',
          borderRadius: '10px',
        }}
      >
        <h1 style={{ textAlign: 'center', marginBottom: '.5rem' }}>Sale and Revenue</h1>
        <DailyChart />
      </div>
      
      <div
        style={{
          border: '1px solid gray',
          margin: '1rem',
          padding: '1rem',
          borderRadius: '10px',
        }}
      >
        <h1 style={{ textAlign: 'center', marginBottom: '.5rem' }}>Product Category </h1>
        <MonthlyChart />
      </div>
    </>
  );
};

export default Dashboard;