export const getMonthlyOrdersData = () => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{
    label: 'Monthly Orders',
    data: [12, 15, 18, 14, 16, 19],
    backgroundColor: '#4CAF50'
  }]
})

export const getPaymentStatusData = () => ({
  labels: ['Paid', 'Pending', 'Delinquent'],
  datasets: [{
    label: 'Payment Status',
    data: [65, 25, 10],
    backgroundColor: ['#4CAF50', '#FFA726', '#EF5350']
  }]
})

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

export const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}
