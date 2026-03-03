# mudo.games

## Project Overview
`mudo.games` is a static landing page built with **Astro 5** that automatically showcases the latest videos from a YouTube channel. It fetches data directly from the YouTube RSS feed at build time, providing a fast, SEO-friendly, and always-up-to-date experience.

### Key Features
- **Automated Updates:** Rebuilds daily via GitHub Actions to fetch the latest videos.
- **Rich UI:** Modern, responsive design with glassmorphism, parallax effects, and custom animations.
- **Categorized Content:** Displays videos in specific sections: *Destacado* (Featured), *Spotlight*, *Shorts*, and *Timeline*.
- **Direct Playback:** Integrated modal for watching videos without leaving the site.
- **State Management:** Tracks "viewed" videos locally using `localStorage`.

### Tech Stack
- **Framework:** [Astro 5](https://astro.build/)
- **Data Parsing:** `fast-xml-parser` for handling YouTube's RSS XML.
- **Styling:** Vanilla CSS with modern features (CSS Variables, `@keyframes`, `clamp()`).
- **Deployment:** GitHub Pages.

---

## Building and Running

### Prerequisites
- Node.js (Latest LTS recommended).
- A valid `YOUTUBE_CHANNEL_ID`.

### Setup
1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Configure environment:**
    Create a `.env` file in the root directory based on `.env.example`:
    ```env
    YOUTUBE_CHANNEL_ID=your_channel_id_here
    YOUTUBE_CHANNEL_NAME=mudo.games
    ```

### Commands
| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the development server at `http://localhost:4321`. |
| `npm run build` | Generates a static production build in the `dist/` folder. |
| `npm run preview` | Starts a local server to preview the production build. |

---

## Development Conventions

### Architecture
- **Static Site Generation (SSG):** The site fetches the YouTube feed during the build process. Any update to the channel requires a new build to be reflected on the site.
- **Single Page:** All content is managed within `src/pages/index.astro`.

### Styling
- **Global Styles:** Located in `src/styles/global.css`.
- **Design System:** Uses a consistent set of CSS variables defined in `:root` for colors, fonts, and shadows.
- **Visual Effects:** Includes heavy use of `radial-gradient` for backgrounds, `backdrop-filter` for glass effects, and custom `@keyframes` for "floating" or "pulsing" elements.

### Components & Logic
- **Data Fetching:** Handled in the frontmatter of `src/pages/index.astro`.
- **Video Detection:** Logic in `index.astro` identifies "Shorts" based on URL patterns or `#shorts` tags in titles.
- **Interactivity:** Client-side scripts are embedded within `is:inline` script tags in the Astro file for modal management and parallax effects.

### CI/CD
- **GitHub Actions:** The workflow in `.github/workflows/deploy.yml` handles the build and deployment to GitHub Pages. It is scheduled to run daily at 14:01 CDMX.
