# Star Sailors - Client Application

A Next.js application for space exploration, citizen science, and data classification.

## 🚀 Quick Start

### Setup:

```bash
docker compose up -d db
docker exec -it starsailors_db psql -U postgres
\l
docker compose build flaskapp
docker compose up -d flaskapp
```

## 📁 Project Structure

### Component Architecture

The application uses a **user-centric component organization** based on key user mechanics rather than technical implementation:

```
src/components/
├── 🔍 classification/     # Image/data classification mechanics
│   ├── viewport/          # Analysis viewports & tools
│   ├── telescope/         # Telescope classification system
│   └── tools/            # AI classifiers & analysis tools
│
├── 🚀 deployment/         # Structure & mission deployment
│   ├── structures/        # Building & managing structures
│   ├── equipment/         # Equipment management
│   └── missions/          # Mission planning & execution
│
├── 🌍 discovery/          # Exploration & data discovery
│   ├── planets/           # Planet exploration
│   ├── anomalies/         # Anomaly discovery
│   ├── data-sources/      # Data generators & sources
│   └── weather/           # Weather discovery
│
├── 🔬 research/           # Scientific progression
│   ├── projects/          # Research projects
│   └── SkillTree/         # Skill progression system
│
├── 👥 social/             # Community & sharing features
│   ├── comments/          # Commenting system
│   ├── posts/             # Post sharing
│   └── activity/          # Social activity feeds
│
├── 👤 profile/            # User management & authentication
│   ├── auth/              # Authentication & landing pages
│   ├── setup/             # Profile setup & management
│   ├── dashboard/         # User dashboard components
│   └── inventory/         # User inventory management
│
├── 🎨 ui/                 # Reusable UI components
│   ├── icons/             # Custom icons
│   ├── scenes/            # 3D scenes & graphics
│   └── helpers/           # UI utilities & helpers
│
├── 📐 layout/             # Application layout components
└── 🔌 providers/          # React context providers
```

### Key Directories

#### App Router Structure
- `app/` - Next.js 14 app router with file-based routing
- `app/api/` - Server-side API routes
- `app/(routes)/` - Page components and layouts

#### Core Application
- `src/core/` - Core application logic and context
- `src/shared/` - Shared utilities and helper functions
- `lib/` - External library configurations
- `hooks/` - Custom React hooks
- `types/` - TypeScript type definitions

#### Styling & Assets
- `styles/` - Global CSS and animations
- `public/` - Static assets and images

## 🎯 Component Organization Philosophy

### User-Centric Design
Components are organized by **what users do** rather than technical implementation:

- **Classification**: Users analyze images, classify data, use telescopes
- **Deployment**: Users build structures, manage equipment, plan missions  
- **Discovery**: Users explore planets, find anomalies, discover data
- **Research**: Users progress scientifically, unlock technologies
- **Social**: Users comment, share posts, see community activity
- **Profile**: Users manage accounts, authenticate, track inventory

### Benefits
1. **Intuitive Navigation**: Developers can easily find components by user functionality
2. **Feature Isolation**: Changes to one user mechanic don't affect others
3. **Reusable UI**: Common UI components are properly separated
4. **Clear Dependencies**: Import paths clearly show component relationships
5. **Easier Testing**: Test files can be organized by user feature

## 🛠️ Development Guidelines

### Import Patterns
- Use absolute imports: `@/src/components/classification/...`
- UI components: `@/src/components/ui/...`
- Types: `@/types/...`
- Utilities: `@/src/shared/...`

### Adding New Components
1. Identify the primary user mechanic
2. Place in appropriate feature directory
3. Use UI components from `@/src/components/ui/`
4. Follow existing naming conventions

<!--
Add     "@ducanh2912/next-pwa": "^10.2.9", back
-->

## 🚦 Route Validation

All internal navigation routes have been validated to ensure they point to the correct paths after the reorganization:

- ✅ **Authentication routes**: Updated `/login` → `/auth`
- ✅ **Deployment routes**: Updated `/deploy` → `/activity/deploy`
- ✅ **Planet navigation**: Updated `/scenes/planet` → `/planets/[id]` with proper dynamic routing
- ✅ **Build validation**: All routes compile successfully and generate proper static/dynamic pages

### 📋 Available Routes

- **Core Pages**: `/`, `/account`, `/auth`, `/privacy`, `/terms`, `/tests`
- **Research**: `/research`, `/research/tree`
- **Discovery**: `/planets/[id]`, `/planets/clouds/[id]`, `/planets/edit/[id]`, `/planets/paint/[id]`
- **Social**: `/posts/[id]`, `/posts/surveyor/[id]`
- **Deployment**: `/activity/deploy`
- **Structures**: `/structures/balloon`, `/structures/cameras`, `/structures/seiscam`, `/structures/telescope`
- **Dynamic Structure Routes**: Various `[project]`, `[id]`, and `[mission]` parameters
- **API Endpoints**: Comprehensive gameplay, research, and data upload APIs

All routes maintain backward compatibility while following the new user-centric architecture.
```