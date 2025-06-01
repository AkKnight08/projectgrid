# TaskGrid - Project Management Dashboard

A modern, responsive project management dashboard built with React and Tailwind CSS. TaskGrid helps you organize and track your projects and tasks in a visual grid interface.

## Features

- 📱 Responsive design that works on all devices
- 🎨 Beautiful, modern UI with dark mode support
- 📊 Drag-and-drop project grid layout
- ✅ Task management with progress tracking
- 🔐 Authentication (Phase 1: Local, Phase 2: Firebase)
- 💾 Data persistence (Phase 1: LocalStorage, Phase 2: Firestore)
- 📅 Calendar view for task scheduling
- 📈 Analytics dashboard
- 🔍 Global search functionality
- 🔔 Notifications system

## Tech Stack

- **Frontend Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Routing:** React Router
- **UI Components:** Headless UI
- **Icons:** Heroicons
- **Grid Layout:** react-grid-layout
- **Charts:** Recharts
- **Authentication:** Firebase Auth (Phase 2)
- **Database:** Firebase Firestore (Phase 2)

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm 7.x or later

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/taskgrid.git
   cd taskgrid
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
taskgrid/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── auth/
│   │   ├── layout/
│   │   ├── projects/
│   │   ├── ui/
│   │   └── analytics/
│   ├── pages/
│   ├── routes/
│   ├── store/
│   └── utils/
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## Development Roadmap

### Phase 1 (Current)
- [x] Basic project structure
- [x] UI components and layout
- [x] Local state management
- [x] LocalStorage persistence
- [x] Basic authentication flow

### Phase 2
- [ ] Firebase integration
- [ ] Real-time data sync
- [ ] Advanced analytics
- [ ] Team collaboration features
- [ ] Calendar integration
- [ ] Email notifications

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Headless UI](https://headlessui.dev/)
- [Heroicons](https://heroicons.com/)
