# FlexReport Frontend

This is the **Vue 3 + TypeScript + Tailwind CSS** frontend for the FlexReport platform. It connects to the Laravel backend to let users log in, manage report templates, and generate downloadable PDF/Excel reports using dynamic filters and column selections.

[Url to website](https://vercel.app)

---

## ⚙️ Tech Stack

- [Vue 3](https://vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PrimeVue](https://www.primefaces.org/primevue/) (UI Components)
- [Pinia](https://pinia.vuejs.org/) (State management)
- [Laravel](https://laravel.com/) (Backend)
- [jspdf](https://www.npmjs.com/package/jspdf) (PDF generation)
- [SheetJS](https://www.npmjs.com/package/xlsx) (Excel generation)

---

## 🚀 Features

- 🔐 Login with JWT
- 📋 Create dynamic report templates from database schema
- 📄 Generate and download reports as **PDF** or **Excel**
- 🔎 Smart filtering (text dropdown, number/date range, boolean options)
- ✅ Save templates for reuse
- 👤 Auth-based access to user templates

---

## 🧪 Test User

To try the app immediately, use this test account:

```txt
Email:    admin@example.com
Password: secret123
```

---

## 🛠️ Project Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set environment variables

Create a `.env` file:

```bash
cp .env.example .env
```

Then edit it to point to your deployed Laravel backend:

```env
VITE_API_BASE_URL=https://flexreport-backend-abcdef.a.run.app/api
```

> Replace with your actual Cloud Run backend URL.

### 3. Run the development server

```bash
pnpm run dev
```

---

## 📁 Project Structure

```txt
src/
├── components/
│   ├── LoginPage.vue
│   ├── ReportPage.vue
│   ├── CreateTemplatePage.vue
│   └── ...
├── auth/
│   └── useAuth.ts
├── lib/
│   └── axios.ts
├── router/
│   └── routes.ts
├── types/
│   └── index.ts
├── App.vue
├── main.ts
└── ...
```

---

## 📦 Build for Production

```bash
pnpm run build
```

---

## 🧪 Lint and Format

```bash
pnpm run lint
```

---

## 📝 License

This project is open-source and available under the [MIT license](LICENSE).

---

## 👨‍💻 Author

Developed by [Owent Ovandy](https://github.com/OnLeeTwo)
