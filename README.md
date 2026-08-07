# 🛡️ Fake Internship & Job Scam Detector

An AI-powered web application that helps students and job seekers identify fake internship and job opportunities before they become victims of scams. The platform analyzes job postings using Artificial Intelligence, detects suspicious patterns, and provides a scam risk score along with detailed explanations.
---

## 🚀 Features
1🔍 AI-powered job and internship scam detection
2 📄 Analyze job descriptions by pasting text
3 🌐 Analyze job posting URLs
4 📊 Scam probability score with detailed explanation
5 ⚠️ Detect common red flags such as:
  * Unrealistic salary offers
  * Requests for upfront payments
  * Poor grammar and suspicious language
  * Missing company information
  * Urgent hiring pressure
6 📈 Risk level classification (Low, Medium, High)
7 💡 AI-generated recommendations for users
8 📱 Responsive and modern user interface
9 🔐 Secure user authentication
10👨‍💼 Admin dashboard for managing users and reports

🛠️ Tech Stack
### Frontend

* React 19
* TanStack Start
* TanStack Router
* TypeScript
* Tailwind CSS 4
* shadcn/ui
* Radix UI

### Backend
* Node.js
* Express.js

### Database
* Supabase (PostgreSQL)

### AI
* Google Gemini API (or any supported AI model)


## 📂 Project Structure
```text
Fake-Internship-Job-Scam-Detector/
├── backend/
├── src/
│   ├── components/
│   ├── routes/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   └── router.tsx
├── public/
├── package.json
├── vite.config.ts
└── README.md
```


## ⚙️ Installation
### Clone the repository
```bash
git clone https://github.com/your-username/fake-job-scam-detector.git
```

### Navigate to the project
```bash
cd fake-job-scam-detector
```

### Install dependencies
```bash
npm install
```

### Start the development server
```bash
npm run dev
```

## 🔑 Environment Variables
Create a `.env` file in the project root.
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_secret_key
```

## 📖 How It Works
1. User logs into the application.
2. User pastes a job description or job posting URL.
3. The system extracts the job information.
4. AI analyzes the content for scam indicators.
5. The application calculates a risk score.
6. Users receive:
   * Scam probability
   * Risk level
   * Detected red flags
   * AI explanation
   * Safety recommendations


## 📸 Future Enhancements
* Browser extension for instant job verification
* OCR support for screenshots of job posts
* Email scam detection
* WhatsApp and Telegram job message analysis
* Company credibility verification
* Community reporting system
* Multilingual support
* Resume-to-job matching

## 🤝 Contributing
Contributions are welcome. Fork the repository, create a feature branch, make your changes, and submit a pull request.
## 👨‍💻 Author
**Sagar Sahu**

If you found this project helpful, consider giving it a ⭐ on GitHub.
