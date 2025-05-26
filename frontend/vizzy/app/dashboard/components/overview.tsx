'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useEffect, useState } from 'react';
import { getUserOverview } from '@/lib/api/overview/get-user-overview';
import { getAuthTokensAction } from '@/lib/actions/auth/token-action';

type MonthlyData = {
  name: string;
  total: number;
};

export function Overview() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { accessToken } = await getAuthTokensAction();

        if (!accessToken) {
          throw new Error('No access token found');
        }

        const overview = await getUserOverview(accessToken);
        const formattedData = Object.entries(overview).map(
          ([month, total]) => ({
            name: month.charAt(0).toUpperCase() + month.slice(1),
            total,
          }),
        );
        setData(formattedData);
      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `€ ${value.toLocaleString('pt-pt')}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
