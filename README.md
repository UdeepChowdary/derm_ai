# Derm AI - Dermatology Assistant

## 🚀 Deployment Link
The application is deployed on Vercel and can be accessed at:
https://derm-ai-eight.vercel.app



## 🩺 Project Overview
Derm AI is a modern, accessible web application for automated skin condition analysis using AI. It integrates with the Autoderm API for real-time image classification, provides actionable clinical recommendations, and ensures user privacy and compliance.

## 🏗️ Architecture & Main Features
- **Next.js 15+** with React 18 and TypeScript for robust, scalable frontend and backend.
- **Autoderm API Integration**: Securely sends user images for AI-powered dermatological analysis.
- **Consent Flow**: GDPR-compliant consent modal before any data processing.
- **Clinical Data Mapping**: Maps AI results to ICD-11 codes and urgency levels using `app/clinical-data/condition-mappings.json`.
- **Frontend Validation**: File type, size, and drag-and-drop support for uploads.
- **Error Handling**: User-friendly error messages for validation, API, and network issues.
- **Accessibility**: WCAG 2.1 compliant, keyboard navigation, screen reader support, high-contrast mode.
- **Responsive UI**: Mobile-first, touch-friendly, dark/light mode, animated feedback.
- **Report Generation**: Downloadable PDF reports with clinical recommendations.
- **History & User Accounts**: (If enabled) Secure report history and authentication.

## 🗂️ Project Structure
- `app/api/classify/route.ts`: Handles image analysis requests, validates input, calls Autoderm API, and returns structured results.
- `app/upload/page.tsx`: Main upload interface, consent modal, image validation, and analysis trigger.
- `app/components/consent-modal.tsx`: Modal for user consent before analysis.
- `app/clinical-data/condition-mappings.json`: Maps AI classes to ICD-11, urgency, and recommendations.
- `components/ui/`: Custom UI components (cards, buttons, dialogs, etc.)
- `hooks/`: Custom React hooks for toast notifications and mobile detection.
- `public/`: Static assets and placeholder images.

## 🛠️ Tech Stack
- Next.js 15+, React 18, TypeScript
- Tailwind CSS, shadcn/ui, Radix UI
- Zod for schema validation
- Vercel for hosting

## 🔒 Privacy & Compliance
- **Consent Modal**: Users must accept data usage terms before analysis.
- **Anonymization**: Images are anonymized and not stored after analysis.
- **GDPR**: No personal data is retained; all processing is transparent.

## 🧑‍⚕️ Clinical Data Handling
- Results are mapped to ICD-11 codes and urgency levels.
- Recommendations are provided for each condition (see `app/clinical-data/condition-mappings.json`).
- Easily extensible for new conditions and mappings.

## 📝 Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```
Visit [http://localhost:3000](http://localhost:3000) to see the application running locally.

### Environment Variables
- `AUTODERM_API_KEY`: Required for Autoderm API integration. Set in your Vercel/hosting environment.

## 🧩 Future Roadmap
- Multilingual support for global accessibility
- Real-time analysis progress bar
- Expanded clinical condition mappings
- Dermatologist review workflow
- User authentication and secure report history
- Enhanced PDF export and sharing

## 💅 UI/UX Documentation
### Design System
- Tailwind CSS, Radix UI, shadcn/ui
- Consistent, accessible, modern medical-themed palette

### Key UI/UX Features
- Responsive, mobile-first design
- Accessibility (WCAG 2.1, keyboard, screen reader, high contrast)
- Clean, minimal interface with clear feedback
- Intuitive navigation and actionable next steps

## 📄 License
MIT License - See LICENSE file for details
