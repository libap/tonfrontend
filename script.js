// Mock data for demonstration
const mockTokenData = {
    currentPrice: 2.5,
    allTimeHigh: 5.0,
    tvl: 1000000,
    maxPercentage: 150,
    currentPercentage: 25,
    change24h: -3.5,
    balance: 1000,
    availableTokens: 1000000,
    volume: 5000000
};

const mockTransactions = [
    { date: '2023-03-15', quantity: 100, type: 'Received', address: '0x1234...5678', price: 2.3 },
    { date: '2023-03-14', quantity: 50, type: 'Sent', address: '0x8765...4321', price: 2.4 },
    { date: '2023-03-13', quantity: 200, type: 'Received', address: '0x2468...1357', price: 2.2 },
    { date: '2023-03-12', quantity: 75, type: 'Sent', address: '0x1357...2468', price: 2.5 },
    { date: '2023-03-11', quantity: 150, type: 'Received', address: '0x3691...2580', price: 2.1 }
];

// Mock price history data
const mockPriceHistory = [
    { date: '2023-03-11', price: 2.1 },
    { date: '2023-03-12', price: 2.3 },
    { date: '2023-03-13', price: 2.2 },
    { date: '2023-03-14', price: 2.4 },
    { date: '2023-03-15', price: 2.5 }
];

let priceChart;
let currentTransactions = [];
let currentSortColumn = 'date';
let currentSortOrder = 'desc';

document.addEventListener('DOMContentLoaded', () => {
    const fetchDataBtn = document.getElementById('fetchData');
    fetchDataBtn.addEventListener('click', fetchData);

    document.getElementById('walletAddress').value = 'EQCWseU-R6xDi5by5eQOWqIxuyhc3WEBif1Eio7gNxeZQCOG';
    document.getElementById('tokenAddress').value = 'EQC_1YoM8RBixN95lz7odcF3Vrkc_N8Ne7gQi7Abtlet_Efi';

    document.querySelectorAll('#transactionTable th').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.column;
            sortTransactions(column);
        });
    });
});

function fetchData() {
    const walletAddress = document.getElementById('walletAddress').value;
    const tokenAddress = document.getElementById('tokenAddress').value;

    if (!walletAddress || !tokenAddress) {
        alert('Please enter both wallet and token addresses.');
        return;
    }

    // Simulate API call to check if the token is in the wallet
    setTimeout(() => {
        const hasToken = Math.random() < 0.8; // 80% chance of having the token
        if (hasToken) {
            showPopup('Token found in the wallet!', 'success');
            updateTokenInfo(mockTokenData);
            currentTransactions = [...mockTransactions];
            updateTransactionHistory(currentTransactions, mockTokenData.currentPrice);
            createOrUpdateChart(mockPriceHistory);

            document.getElementById('tokenInfo').classList.remove('hidden');
            document.getElementById('chartContainer').classList.remove('hidden');
            document.getElementById('transactionHistory').classList.remove('hidden');
        } else {
            showPopup('Token not found in the wallet. Please check the addresses and try again.', 'error');
        }
    }, 1000); // Simulate a 1-second delay for the API call
}

function showPopup(message, type) {
    const popup = document.createElement('div');
    popup.className = `popup ${type}`;
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 3000);
}

function updateTokenInfo(data) {
    document.getElementById('currentPrice').textContent = `$${data.currentPrice.toFixed(2)}`;
    document.getElementById('allTimeHigh').textContent = `$${data.allTimeHigh.toFixed(2)}`;
    document.getElementById('tvl').textContent = `$${data.tvl.toLocaleString()}`;
    document.getElementById('maxPercentage').textContent = `${data.maxPercentage}%`;
    document.getElementById('currentPercentage').textContent = `${data.currentPercentage}%`;
    document.getElementById('change24h').textContent = `${data.change24h}%`;
    document.getElementById('balance').textContent = data.balance.toLocaleString();
    document.getElementById('availableTokens').textContent = data.availableTokens.toLocaleString();
    document.getElementById('volume').textContent = `$${data.volume.toLocaleString()}`;
}

function updateTransactionHistory(transactions, currentPrice) {
    const tbody = document.getElementById('transactionBody');
    tbody.innerHTML = '';

    transactions.forEach(tx => {
        const currentValue = tx.quantity * currentPrice;
        const originalValue = tx.quantity * tx.price;
        const percentageChange = ((currentValue - originalValue) / originalValue) * 100;

        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${tx.date}</td>
            <td>${tx.quantity}</td>
            <td>${tx.type}</td>
            <td>${tx.address}</td>
            <td>$${tx.price.toFixed(2)}</td>
            <td>$${currentValue.toFixed(2)}</td>
            <td class="${percentageChange >= 0 ? 'positive' : 'negative'}">${percentageChange.toFixed(2)}%</td>
        `;
        row.addEventListener('click', () => addTransactionToChart(tx));
    });
}

function createOrUpdateChart(priceHistory) {
    const ctx = document.getElementById('priceChart').getContext('2d');

    if (priceChart) {
        priceChart.destroy();
    }

    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: priceHistory.map(item => item.date),
            datasets: [{
                label: 'Token Price',
                data: priceHistory.map(item => item.price),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

function addTransactionToChart(transaction) {
    if (!priceChart) return;

    const datasetIndex = priceChart.data.datasets.findIndex(dataset => dataset.label === 'Transactions');

    if (datasetIndex === -1) {
        priceChart.data.datasets.push({
            label: 'Transactions',
            data: [{
                x: transaction.date,
                y: transaction.price
            }],
            backgroundColor: transaction.type === 'Received' ? 'green' : 'red',
            pointRadius: 8,
            pointHoverRadius: 12
        });
    } else {
        priceChart.data.datasets[datasetIndex].data.push({
            x: transaction.date,
            y: transaction.price
        });
    }

    priceChart.update();
}

function sortTransactions(column) {
    if (column === currentSortColumn) {
        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortOrder = 'asc';
    }

    currentTransactions.sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];

        if (column === 'price' || column === 'quantity') {
            valueA = parseFloat(valueA);
            valueB = parseFloat(valueB);
        }

        if (valueA < valueB) return currentSortOrder === 'asc' ? -1 : 1;
        if (valueA > valueB) return currentSortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    updateTransactionHistory(currentTransactions, mockTokenData.currentPrice);

    // Update sort indicators
    document.querySelectorAll('#transactionTable th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        if (th.dataset.column === currentSortColumn) {
            th.classList.add(`sort-${currentSortOrder}`);
        }
    });
}