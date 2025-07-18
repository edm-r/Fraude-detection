# Fraud Detection Dashboard

A comprehensive React-based fraud detection dashboard for financial institutions. This application provides real-time fraud analysis capabilities for both single transactions and batch processing via CSV uploads.

## Features

### 🛡️ Core Functionality
- **Single Transaction Analysis**: Submit individual transactions for real-time fraud detection
- **Batch CSV Processing**: Upload and analyze multiple transactions simultaneously
- **Interactive Dashboard**: View fraud statistics, trends, and recent transaction activity
- **Detailed Transaction Views**: Comprehensive analysis with risk factors and model insights

### 📊 Analytics & Visualization
- Real-time fraud detection statistics
- Interactive charts showing fraud trends and distribution
- Risk factor analysis with color-coded indicators
- Export capabilities for analysis results

### 🎨 User Experience
- Clean, professional interface with Tailwind CSS
- Responsive design for desktop and mobile devices
- Real-time notifications and loading states
- Intuitive navigation and user flows

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Charts**: Recharts
- **HTTP Client**: Axios
- **CSV Processing**: PapaParse
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Backend API server running on `http://localhost:5000`

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# Create .env file
REACT_APP_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## API Integration

The application expects a Flask backend with the following endpoints:

### Single Transaction Prediction
```
POST /predict_transaction
Content-Type: application/json

{
  "TransactionDT": 86400,
  "TransactionAmt": 100.0,
  "ProductCD": "W",
  // ... other transaction fields
}

Response:
{
  "label": "fraud" | "legitimate",
  "probability": 0.85,
  "fraud_score": 0.15
}
```

### Batch Prediction
```
POST /predict_batch
Content-Type: application/json

{
  "transactions": [
    { /* transaction 1 */ },
    { /* transaction 2 */ }
  ]
}

Response:
{
  "predictions": [
    {
      "label": "fraud" | "legitimate",
      "probability": 0.85,
      "fraud_score": 0.15
    }
  ]
}
```

## CSV Format

For batch processing, CSV files should include these columns:

### Required Fields
- `TransactionDT` - Transaction datetime (numeric)
- `TransactionAmt` - Transaction amount
- `ProductCD` - Product code (W, C, R, S, H)
- `card1`, `card2`, `card3` - Card identifiers
- `card4` - Card type (discover, visa, mastercard, etc.)
- `card5`, `card6` - Additional card information

### Optional Fields
- `P_emaildomain`, `R_emaildomain` - Email domains
- `addr1`, `addr2` - Address information
- `dist1`, `dist2` - Distance features
- `C1-C14` - Count features
- `D1-D15` - Timedelta features
- `V1-V20` - Vesta engineered features
- `M1-M9` - Match features

Missing columns will be filled with appropriate default values.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout/         # Layout components (Header, Layout)
│   └── UI/             # UI components (LoadingSpinner, FraudBadge, etc.)
├── pages/              # Page components
│   ├── HomePage.tsx    # Dashboard overview
│   ├── PredictSinglePage.tsx  # Single transaction form
│   ├── PredictCSVPage.tsx     # CSV batch processing
│   └── TransactionDetailsPage.tsx  # Transaction details view
├── services/           # API integration
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx            # Main application component
```

## Features in Detail

### Dashboard Overview
- Transaction statistics and fraud rate metrics
- Interactive pie chart showing fraud vs legitimate distribution
- Line chart displaying monthly fraud trends
- Recent transactions table with quick actions

### Single Transaction Analysis
- Dynamic form with validation
- Real-time fraud prediction
- Risk factor analysis
- Visual fraud indicators

### Batch CSV Processing
- Drag-and-drop file upload
- CSV format validation and preview
- Bulk fraud analysis
- Results export functionality

### Transaction Details
- Comprehensive transaction information
- Risk factor breakdown
- Raw data view
- Action buttons for manual review

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Consistent code formatting
- Component-based architecture

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy the `dist` folder to your web server or hosting platform.

3. Ensure the backend API is accessible from your production domain.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.