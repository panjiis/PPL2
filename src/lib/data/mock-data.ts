export const mockApi = {
  getAnalyticsData: (range: string) => {
    const todayData = {
      salesReport: {
        title: "Sales Report (Daily)",
        description: "Today's sales revenue trend.",
        chartData: [
          { name: '08:00', value: 2 }, { name: '10:00', value: 5 }, { name: '12:00', value: 8 },
          { name: '14:00', value: 12 }, { name: '16:00', value: 15 }, { name: '18:00', value: 21 },
        ],
        yAxisFormatter: (value: number) => `Rp${value} Jt`
      },
      revenueWidget: {
        title: "Today's Revenue",
        value: "Rp 21.550.000",
        trend: "+5% from yesterday",
      },
      transactionsWidget: {
        title: "Today's Transactions",
        value: "45",
        description: "Total transactions since midnight."
      },
      topProductWidget: {
        title: "Today's Top Product",
        name: "Product Z",
        unitsSold: "15 units sold today",
      },
      commissionOverview: {
        paid: 'Rp 2.500.000',
        pending: 'Rp 1.200.000',
        rejected: 'Rp 0',
      }
    };

    const weekData = {
      salesReport: {
        title: "Sales Report (Weekly)",
        description: "This week's sales revenue trend.",
        chartData: [
          { name: 'Mon', value: 15 }, { name: 'Tue', value: 20 }, { name: 'Wed', value: 18 },
          { name: 'Thu', value: 25 }, { name: 'Fri', value: 30 }, { name: 'Sat', value: 45 },
          { name: 'Sun', value: 42 },
        ],
        yAxisFormatter: (value: number) => `Rp${value} Jt`
      },
      revenueWidget: {
        title: "This Week's Revenue",
        value: "Rp 195.000.000",
        trend: "+8% from last week",
      },
      transactionsWidget: {
        title: "This Week's Transactions",
        value: "289",
        description: "Total transactions in the last 7 days."
      },
      topProductWidget: {
        title: "This Week's Top Product",
        name: "Product Y",
        unitsSold: "78 units sold this week",
      },
      commissionOverview: {
        paid: 'Rp 22.100.000',
        pending: 'Rp 8.500.000',
        rejected: 'Rp 1.100.000',
      }
    };

    const monthData = {
      salesReport: {
        title: "Sales Report (Monthly)",
        description: "This month's sales revenue trend.",
        chartData: [
          { name: 'Minggu 1', value: 180 }, { name: 'Minggu 2', value: 210 },
          { name: 'Minggu 3', value: 195 }, { name: 'Minggu 4', value: 250 },
        ],
        yAxisFormatter: (value: number) => `Rp${value} Jt`
      },
      revenueWidget: {
        title: "This Month's Revenue",
        value: "Rp 835.000.000",
        trend: "+12% from last month",
      },
      transactionsWidget: {
        title: "This Month's Transactions",
        value: "1.240",
        description: "Total transactions this month."
      },
      topProductWidget: {
        title: "This Month's Top Product",
        name: "Product X",
        unitsSold: "120 units sold this month",
      },
      commissionOverview: {
        paid: 'Rp 88.700.000',
        pending: 'Rp 15.250.000',
        rejected: 'Rp 5.000.000',
      }
    };

    const yearData = {
      salesReport: {
        title: "Sales Report (Yearly)",
        description: "Monthly sales revenue trend throughout the year.",
        chartData: [
          { name: 'Jan', value: 240 }, { name: 'Feb', value: 290 }, { name: 'Mar', value: 310 },
          { name: 'Apr', value: 350 }, { name: 'May', value: 330 }, { name: 'Jun', value: 410 },
          { name: 'Jul', value: 390 }, { name: 'Aug', value: 450 }, { name: 'Sep', value: 420 },
          { name: 'Oct', value: 480 },
        ],
        yAxisFormatter: (value: number) => `Rp${value} Jt`
      },
      revenueWidget: {
        title: "This Year's Revenue",
        value: "Rp 9.87 Miliar",
        trend: "+15% from last year",
      },
      transactionsWidget: {
        title: "This Year's Transactions",
        value: "14.5k",
        description: "Total transactions since the beginning of the year."
      },
      topProductWidget: {
        title: "This Year's Top Product",
        name: "Product A",
        unitsSold: "1.5k units sold this year",
      },
      commissionOverview: {
        paid: 'Rp 950.000.000',
        pending: 'Rp 45.000.000',
        rejected: 'Rp 21.000.000',
      }
    };

    const allTimeData = {
      salesReport: {
        title: "Sales Report (All Time)",
        description: "All-time sales revenue trend.",
        chartData: [
          { name: '2022', value: 8500 }, { name: '2023', value: 10200 },
          { name: '2024', value: 15300 }, { name: '2025', value: 9870 },
        ],
        yAxisFormatter: (value: number) => `Rp${value/1000} M`
      },
      revenueWidget: {
        title: "Total Revenue",
        value: "Rp 43.87 Miliar",
        trend: "+15% from last year",
      },
      transactionsWidget: {
        title: "Total Transactions",
        value: "52.1k",
        description: "Total transactions throughout time."
      },
      topProductWidget: {
        title: "All Time Top Product",
        name: "Product B",
        unitsSold: "8.2k units sold",
      },
       commissionOverview: {
        paid: 'Rp 4.2 Miliar',
        pending: 'Rp 45.000.000',
        rejected: 'Rp 150.000.000',
      }
    };

    switch (range) {
      case "today": return todayData;
      case "thisWeek": return weekData;
      case "thisMonth": return monthData;
      case "thisYear": return yearData;
      case "allTime": return allTimeData;
      default: return todayData;
    }
  }
};

export const inventoryOverview = {
  totalProducts: 875,
  lowStockItems: 42,
  stockByWarehouse: [
    { name: 'Warehouse A', value: 4500 },
    { name: 'Warehouse B', value: 3200 },
    { name: 'Warehouse C', value: 5100 },
  ]
};
