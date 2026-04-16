# CheckER - Engagement Calculator

![CheckER - Instagram Report](./public/homepage.png)

A modern, open-source web application designed to help creators, marketers, and brands analyze and calculate Engagement Rates (ER) for Instagram and TikTok profiles seamlessly. Built with **Next.js**, **TypeScript**, and **TailwindCSS**.

## ✨ Features

- **Instagram Engagement Analysis:** Calculates Engagement Rate combining Likes and Comments against the Follower count.
- **TikTok Engagement Analysis:** Utilizes the industry-standard HypeAuditor method, evaluating metrics against actual Video Views instead of followers.
- **Quality Grading System:** Automatically assigns quality grades (`A+`, `A`, `B`, `C`, `D`) based on platform-specific benchmark metrics (e.g., categorizing an ER as _Exceptional_, _Viral_, or _Average_).
- **Estimated Post Value:** Calculates an estimated monetary value (Min & Max bounds) for sponsored posts based on followers/views and engagement performance multipliers.
- **Modern UI:** Professional dashboard interface with dark-mode integration and smooth interactions.

## 📊 How It Works (Calculations Used)

CheckER algorithms are tailored closely to the dynamics and algorithms of each specific platform:

### Instagram Method

On Instagram, audience loyalty is often tied to the base Follower count.

- **Engagement Rate (ER):** `((Average Likes + Average Comments) / Followers) * 100`
- Provides metrics on _Comment-to-Like Ratio_.

### TikTok Method (HypeAuditor Standard)

On TikTok, content discovery heavily relies on the "For You Page" (FYP) algorithm, meaning views are a vastly more accurate reflection of reach than followers.

- **Engagement Rate (ER):** `((Average Likes + Average Comments + Average Shares) / Average Views) * 100`
- Provides granular insights like _Like-to-View Ratio_, _Comment-to-Like Ratio_, and _Share-to-View Ratio_.

## 📸 Screenshots & Result Previews

### TikTok Analysis Result

![TikTok Engagement Result](./public/tiktok.png)

### Instagram Analysis Result

![Instagram Engagement Result](./public/instagram.png)

## 🚀 Getting Started

First, clone the repository and install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [TailwindCSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 📝 License

This project is open-source and available under the terms of the MIT License.
