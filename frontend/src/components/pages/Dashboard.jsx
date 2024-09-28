import React from 'react';
import Navbar from '../shared/Navbar';
import axios from 'axios'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { LineChartComp } from '../shared/LineChartComp';
import { DollarSign, EyeIcon, Receipt, ReceiptIcon, User, Users2 } from 'lucide-react';
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis ,YAxis} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "2022",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "2023",
    color: "hsl(var(--chart-2))",
  },
};

const Dashboard = () => {
  return (
    <div>
      <Navbar />
      <div className='mx-9'>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 w-full mt-4">
          <Card x-chunk="dashboard-01-chunk-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Crimes
              </CardTitle>
              <EyeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">9782</div>
              <p className="text-xs text-muted-foreground text-red-400">
                20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total FIRs
              </CardTitle>
              <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12000</div>
              <p className="text-xs text-muted-foreground text-red-400">
                +18% from last month
              </p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Missing
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2120</div>
              <p className="text-xs text-muted-foreground text-green-400">
                -20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Unidentified Bodies
              </CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1290</div>
              <p className="text-xs text-muted-foreground text-red-400">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Area Chart Component */}
        <div className="mt-8 flex justify-between mb-10">
        <div className='w-[48%]'>
           <LineChartComp/>
        </div>
        <div className='w-[48%] '>
        <iframe
        src="/maharashtra_heatmap.html"
        title="Maharashtra Heatmap"
        style={{ border: 'none', width: '100%', height: '100%' }}
        className='rounded-lg'
      />
    </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
