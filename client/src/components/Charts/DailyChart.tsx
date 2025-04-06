import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGetAllProductsQuery } from '../../redux/features/management/productApi';
import { Spin } from 'antd';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28EFF'];

const DailyChart = () => {
  const { data: products, isFetching } = useGetAllProductsQuery({});

  if (isFetching) {
    return <Spin size="large" style={{ display: 'block', margin: 'auto' }} />;
  }

  const salesData = products?.data?.map((product) => ({
    name: product.name,
    value: product.stock,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={salesData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {salesData?.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DailyChart;
