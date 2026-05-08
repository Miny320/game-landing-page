# Sigma Scripts Marketplace | Premium Game Scripts

Sigma Scripts is a high-end, cinematic marketplace designed for elite gamers looking for premium Cronus Zen and PC game scripts. The platform is built with a focus on **Zero-Lag Performance**, **High-End UI/UX aesthetics**, and **Seamless Mobile Accessibility**.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: Orbitron (Headings) & Inter (Body)
- **Deployment Ready**: Optimized for ultra-fast asset loading and global preloading.

---

## 🎨 UI/UX Design Philosophy

The website follows a **Premium Dark Gaming Aesthetic**:
- **Cinematic Hero**: A full-screen, high-performance video background with 1.5x speed for a fast-paced, elite feel.
- **Glassmorphism**: Cards use multi-layered backdrop blurs (`backdrop-blur-3xl`) and subtle white borders to create a "floating glass" effect.
- **Liquid Glows**: Interactive elements are surrounded by Cyan-accented liquid glows and pulse animations.
- **Micro-interactions**: Every button and card has smooth spring animations (`framer-motion`) to provide tactical feedback to the user.
- **Mobile First**: A custom-built mobile navigation system ensuring 100% compatibility across all devices.

---

## 📂 Project Structure

```text
src/
├── app/                  # Next.js App Router (Pages & Global Styles)
│   ├── layout.tsx        # Global Layout & Preloading Logic
│   └── page.tsx          # Homepage Assembly
├── components/           # UI Components
│   ├── layout/           # Global components (Navbar, Footer, SmoothScroll)
│   ├── sections/         # Feature-specific sections (Hero, Showcase, Reviews)
│   └── ui/               # Reusable atomic UI elements (Buttons, Cards)
└── visuals/              # High-performance video & image assets
```

---

## 🛠️ Key Features & Sections

### 1. Zero-Lag Hero Section
- Uses advanced `canplaythrough` pre-buffering to eliminate mid-video freezing.
- Features an **Invisible Interaction Unmute** system: The video starts instantly (muted) and seamlessly unmutes on the user's first click or scroll, bypassing browser security blocks.

### 2. Premium Script Packs
- A grid of high-conversion cards showcasing popular scripts for games like *Apex Legends*, *Fortnite*, and *NBA 2K26*.
- Includes pricing, feature lists, and hover-glow effects.

### 3. Community Showcase
- A horizontal auto-scrolling carousel of community gameplay.
- Zero-overlay video cards allowing the gameplay to be the center of attention.

### 4. Interactive Trust Bar
- Dynamic stats section highlighting system stability and security with kernel-level updates.

### 5. Smart Mobile Navigation
- A fully responsive Navbar that transforms into a blur-heavy mobile overlay on smaller screens.

---

## 📦 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Production Build**:
   ```bash
   npm run build
   ```

---

## 🛡️ Security & Performance
- **Asset Preloading**: Key videos are preloaded in the document head to ensure 0% delay on arrival.
- **Optimized Rendering**: Minimized layout shifts (CLS) and optimized React re-renders for the smoothest possible scrolling experience.

Developed with passion for the **Sigma Scripts** community.
