import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGetAllProductsQuery } from '../../redux/features/management/productApi';
import { Spin } from 'antd';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF'];

const MonthlyChart = () => {
  const { data: products, isFetching } = useGetAllProductsQuery({});

  if (isFetching) {
    return <Spin size="large" style={{ display: 'block', margin: 'auto' }} />;
  }

  const categoryStockData = products?.data?.reduce((acc, product) => {
    const category = product.category.name;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += product.stock;
    return acc;
  }, {});

  const stockData = Object.entries(categoryStockData).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={stockData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#003366" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyChart;
