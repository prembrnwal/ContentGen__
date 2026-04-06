# ContentGen Pro

AI-powered content generation for professionals. Built with React.

## Project Structure

```
src/
├── App.js                    # Root component & page routing
├── index.js                  # React entry point
├── constants/
│   └── theme.js              # Colors, templates, tones, feature data
├── components/
│   ├── GlobalStyle.js        # Global CSS injector (fonts, animations)
│   ├── Icon.js               # SVG icon library
│   ├── Primitives.js         # Badge, Tag, Spinner
│   ├── Buttons.js            # BtnPrimary, BtnGhost, IconBtn
│   ├── Toast.js              # Toast notification
│   ├── SectionBlock.js       # Collapsible content section
│   ├── Modal.js              # Full content detail modal
│   ├── Sidebar.js            # App sidebar navigation
│   ├── Header.js             # Landing/Login top nav
│   ├── StatCard.js           # Dashboard stat card
│   ├── TemplateBtn.js        # Template selector + FilterChip
│   └── HistoryRow.js         # History list item
└── pages/
    ├── LandingPage.js        # Marketing landing page
    ├── LoginPage.js          # Login / Sign up
    ├── AppPage.js            # Main app shell (sidebar + topbar)
    ├── DashboardPage.js      # Stats & recent content dashboard
    ├── GeneratePage.js       # AI content generator
    └── HistoryPage.js        # Generated content history
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Running the App

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
```

## API Configuration

This app calls the Anthropic API directly from the browser. In production, you should proxy these requests through your own backend to keep your API key secure.

The API is called in `src/pages/GeneratePage.js` inside the `generate()` function.

## Features

- **Landing Page** — Hero, stats, and feature showcase
- **Auth Pages** — Login and Sign Up (simulated)
- **Dashboard** — Content stats and recent activity
- **Generator** — AI content generation with template & tone selection
- **History** — Browse, filter, reuse, and delete past content
