# 👑 MediRoyal: AI-Powered Medicine Finder

Scan a prescription, find which shop has each medicine, and compare prices. A full stack project with OCR, login, cart, orders, bill and delivery tracking.

> **Demo project.** All shops, prices and stock are sample data. Orders, payment and delivery are simulated. For information only; please ask a pharmacist before buying medicines.

## Features

- 🔍 Search medicines by name, with shop-wise price comparison and a "Best Price" badge
- 📷 Take a photo or 🧾 upload a prescription image
- 🤖 **AI part:** Tesseract OCR reads the prescription text, and fuzzy matching finds the medicines even with spelling mistakes
- 🔐 Register, sign in, and forgot password (reset link flow)
- 🛒 Cart and demo order placement with live stock update
- 📦 Order tracking (Placed → Packed → Out for Delivery → Delivered)
- 🧾 Printable bill / invoice (save as PDF)
- 👑 Royal navy and gold mobile-first UI

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, CSS |
| Backend | Django, Django REST Framework, Token authentication |
| AI / OCR | Tesseract OCR (pytesseract), difflib fuzzy matching |
| Database | SQLite |

## How to Run

**Requirements:** Python 3, Node.js, [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki) installed on Windows.

**Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install django djangorestframework django-cors-headers pillow pytesseract
python manage.py migrate
python seed.py
python manage.py runserver
```

**Frontend** (in a second terminal)
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Try the included `rx.png` as a sample prescription.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/search/?q=dolo` | Search medicine, prices by shop |
| `POST /api/scan/` | Upload prescription image (OCR) |
| `POST /api/register/`, `/api/login/` | Create account, sign in |
| `POST /api/forgot/`, `/api/reset/` | Password reset |
| `POST /api/orders/place/` | Place order (token required) |
| `GET /api/orders/` | My orders with tracking |

## Future Improvements

- Use an LLM (Claude API) to extract medicine names, doses and days from messy prescriptions
- Handwritten prescription support
- Real pharmacy stock integration
- Deployment (Render and Vercel)

## Author

**Pon Mahalakshmi**: BCA graduate, aspiring Backend / Full Stack Developer
