# Derm AI - AI-Powered Dermatology Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-13.5.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-007ACC?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.3-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)

An AI-powered dermatology assistant that helps users analyze skin conditions using computer vision and machine learning.

## ✨ Features

- 🖼️ Image-based skin analysis
- 📊 Risk assessment and severity classification
- 📱 Mobile-friendly responsive design
- 🔒 Secure and private processing
- 📱 PWA support
- 🌤️ UV index and environmental monitoring
- 📈 Health recommendations based on skin analysis

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/UdeepChowdary/derm_ai.git
   cd derm_ai
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Update the environment variables in .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: Tailwind CSS
- **AI/ML**: TensorFlow.js, Face Landmark Detection
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **UI Components**: Radix UI, Lucide Icons
- **API Integration**: Next.js API Routes

## 📂 Project Structure

```
derm_ai/
├── app/                    # App router pages and layouts
├── components/             # Reusable UI components
├── config/                 # Configuration files
├── lib/                    # Utility functions and hooks
├── public/                 # Static assets
├── styles/                 # Global styles
└── types/                  # TypeScript type definitions
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [TensorFlow.js](https://www.tensorflow.org/js) - Machine Learning for JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
- [Lucide Icons](https://lucide.dev/) - Beautiful & consistent icons
