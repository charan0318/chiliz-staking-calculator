# Chiliz (CHZ) Staking Rewards Calculator 🔴

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge)](https://chiliz-staking-calculator.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)

A powerful, real-time staking rewards calculator for Chiliz (CHZ) blockchain validators. Calculate potential earnings, compare validators, and plan your staking strategy with live data.

![Chiliz Staking Calculator Preview](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

---

## Features ✨

### Real-Time Calculator 📊
- **Live Validator Data** — Fetches current APR, commission rates, and total stake from Chiliz staking API
- **Multi-Currency Support** — View rewards in 30+ currencies (USD, EUR, GBP, INR, etc.) with live exchange rates
- **Flexible Time Periods** — Calculate daily, weekly, monthly, or yearly rewards

### Analytics & Insights 📈
- **Historical APR Charts** — Track validator performance over time with interactive Recharts graphs
- **Validator Comparison** — Sort and filter validators by APR, commission, total stake, or delegators
- **Network Statistics** — View total staked CHZ, active validators, and network health

### Delegation Calculator 🎯
- **Target-Based Planning** — Enter your desired reward and find how much CHZ to stake
- **Reverse Calculator** — Work backwards from reward goals to required investment

### User Experience 🎨
- **Responsive Design** — Works seamlessly on desktop, tablet, and mobile
- **Dark Theme** — Easy on the eyes with a polished dark UI
- **Tutorial Mode** — Interactive guide for first-time users
- **Share Results** — Generate shareable links with your calculations

---

## Quick Start 🚀

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/charan0318/chiliz-staking-calculator.git

# Navigate to project directory
cd chiliz-staking-calculator

# Install dependencies (use legacy-peer-deps for React 19 compatibility)
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

---

## Tech Stack 🛠️

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool & Dev Server |
| **Tailwind CSS** | Styling |
| **Recharts** | Interactive Charts |
| **CoinGecko API** | CHZ Price Data |
| **Chiliz Staking API** | Validator Data |

---

## Project Structure 📁

```
chiliz-staking-calculator/
├── api/
│   └── chiliz.ts          # API calls, caching, and data fetching
├── assets/
│   └── customLogo.ts      # Custom logo assets
├── components/
│   ├── CalculatorInput.tsx    # Main input form
│   ├── ResultsDisplay.tsx     # Rewards display
│   ├── DelegationCalculator.tsx # Target-based calculator
│   ├── ValidatorModal.tsx     # Validator details popup
│   ├── TrendChart.tsx         # APR history charts
│   └── icons/                 # Icon components
├── context/
│   └── ThemeContext.tsx       # Theme state management
├── data/
│   ├── knownValidators.ts     # Fallback validator data
│   └── currencyNames.ts       # Currency metadata
├── hooks/
│   └── useClickOutside.ts     # Click outside detection
├── utils/
│   └── currency.ts            # Currency formatting utilities
├── App.tsx                    # Main application component
├── constants.ts               # App constants and URLs
├── types.ts                   # TypeScript type definitions
└── index.tsx                  # Entry point
```

---

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License 📄

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ for the Chiliz community by [ch04niverse](https://x.com/ch04niverse)
</p>