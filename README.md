# ⚽ European Football Schedule 2026-27

An interactive, self-contained schedule browser for the 2026–27 European club football season. Keep track of fixtures across the **Premier League**, **La Liga**, **Bundesliga**, **Ligue 1**, and the **UEFA Champions League**.

![Day View](https://pub-227e9e1887224eafbf51e8c0f4728352.r2.dev/day-view.png)

## 🌟 Features

- **Day View:** Browse matches day-by-day with an interactive horizontal date strip.
- **Month Calendar:** Get a birds-eye view of the season. Gold stars mark days with marquee rivalry matches.
- **Team Explorer:** Search for any of the 76 teams across the top 5 leagues to view their full remaining season schedule.
- **Local Time Conversion:** All kickoff times are automatically converted to your device's local time zone, with a small tag showing the original published time.
- **Export & Share:** Export single matches, entire days, or a team's rest-of-season schedule to `.ics` format. You can also copy a day's schedule as text to your clipboard.
- **Premium UI:** Fluid transitions, beautiful dark-mode styling, and smooth animations.

![Team View](https://pub-227e9e1887224eafbf51e8c0f4728352.r2.dev/team-view.png)

## 🛠️ Tech Stack

- **Framework:** [React](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** Vanilla CSS with custom CSS variables (no external UI libraries)
- **Data:** 100% embedded JSON (no backend or API required)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18 or newer recommended) and `npm` installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/smakthe/football-schedule
   cd football-schedule
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Development Server

Start the Vite development server:
```bash
npm run dev
```
Open the provided `localhost` link in your browser to view the app. The server supports hot module replacement (HMR), so any changes you make to the code will instantly reflect in the browser.

## 📦 Building for Production

To create a production-ready build, run:
```bash
npm run build
```
This will generate highly-optimized static files in the `dist/` directory. You can preview the production build locally by running:
```bash
npm run preview
```
The `dist/` folder can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

## 🤝 Contributing

Contributions are welcome! If you'd like to help improve the app, update fixtures, or add new features:

1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature/amazing-feature`).
3. Make your changes.
4. Run `npm run lint` to ensure there are no code quality issues.
5. Commit your changes (`git commit -m 'Add amazing feature'`).
6. Push to the branch (`git push origin feature/amazing-feature`).
7. Open a Pull Request.
