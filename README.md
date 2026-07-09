# Smart Library Seat Reservation System

## Introduction
The **Smart Library Seat Reservation System** is an innovative solution that automates seat reservation and occupancy monitoring in a library environment. It integrates IoT hardware (ESP32, RFID modules, and seat sensors) with a modern React frontend and Firebase backend, providing real-time seat status updates through a web dashboard.

## Features
- **Role‑based Authentication** – Admin and Student roles with Firebase Authentication.
- **Admin Dashboard** – Manage seats, users, and view real‑time occupancy.
- **Student Dashboard** – Browse available seats, reserve seats, and monitor reservation status.
- **RFID‑Based Identification** – Students authenticate using RFID cards.
- **Real‑time Seat Monitoring** – Pressure sensors/buttons detect seat occupancy.
- **Live Updates** – Firebase Realtime Database pushes status changes instantly to the dashboards.
- **ESP32 Wi‑Fi Communication** – Seamless data transfer between hardware and cloud.
- **Responsive UI** – Built with React and Vite for fast development and hot‑module replacement.

## System Architecture
```
Student RFID Card → ESP32 + RFID Reader → Firebase → React Web Dashboard
Seat Sensor (Pressure/Button) → ESP32 → Firebase → Admin / Student Dashboard
```

## Technologies Used
### Frontend
- React.js
- Vite
- JavaScript / TypeScript
- HTML5 & CSS3

### Backend / Cloud
- Firebase Authentication
- Firebase Firestore (Realtime Database)

### Hardware
- ESP32 Development Board
- MFRC522 RFID Module
- Pressure Sensor / Push Button
- LEDs for seat status indication

### Development Tools
- Arduino IDE for ESP32 firmware
- VS Code

## Project Structure
```
Smart-Library-System/
├─ public/                 # Static assets
├─ src/
│   ├─ components/        # Reusable UI components
│   ├─ context/           # React context (e.g., AuthContext)
│   ├─ hooks/             # Custom hooks
│   ├─ pages/             # Page components (Dashboard, Login, etc.)
│   ├─ routes/            # React Router configuration
│   ├─ services/          # Firebase service wrappers
│   ├─ utils/             # Utility functions
│   └─ App.jsx            # Root component
├─ vite.config.js          # Vite configuration
├─ package.json            # Project dependencies
└─ README.md               # Project documentation
```

## Installation and Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
1. Clone the repository.
2. Create a Firebase project and enable **Authentication** and **Firestore**.
3. Copy the Firebase config into a `.env` file:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
4. Run the development server and access the dashboard at `http://localhost:5173`.

## Hardware Setup
- Connect the **MFRC522 RFID reader** to the ESP32 via SPI pins.
- Wire the **pressure sensor** to a digital input on the ESP32.
- Attach **LEDs** to indicate seat status (green = free, red = occupied).
- Flash the ESP32 with the provided Arduino sketch (located in `hardware/` folder) which handles RFID reads, sensor detection, and publishes data to Firebase.

## Usage
- **Admin** logs in via the Admin Dashboard to add/remove seats, view live occupancy, and manage student accounts.
- **Student** logs in, sees a map of available seats, reserves a seat, and confirms presence by placing the RFID card on the reader and sitting on the assigned seat.
- The system updates seat status in real time, reflecting changes instantly across all connected clients.

## Future Improvements
- Develop a native mobile application (iOS/Android) for on‑the‑go reservations.
- Support multiple library locations with centralized management.
- Integrate AI‑based occupancy prediction to suggest optimal seating.
- Add QR‑code scanning as an alternative to RFID cards.
- Provide advanced analytics dashboards for library administrators.

## Contributors
- **[Oshan Perera]** – Project Lead

## License
This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---
*This README was generated for a university project and follows best practices for clear documentation.*
