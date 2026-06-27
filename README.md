# Aether Online C++ Compiler

A premium, modern, and lightweight Online C++ Compiler web application built using **Node.js/Express** on the backend and **Vanilla HTML/CSS/JS** on the frontend. The project supports compiling C++ code, passing custom stdin input, capturing execution outputs, handling infinite loop timeouts, and boasts a gorgeous dark glassmorphic UI.

---

## Features

-  **Sleek Dark Theme**: Modern glassmorphism UI with smooth animations, glow effects, and typography.
-  **Interactive Code Panel**: Real-time dynamic line numbering, `Tab` indentation support, and syntax-like layout.
-  **Custom Input (stdin)**: Pass custom arguments and data directly to the C++ program's standard input stream.
-  **Infinite Loop Protection**: Automatic 5-second timeout execution limit to prevent freezing server resources.
-  **Developer Convenience**: Run code with the keyboard shortcut `Ctrl + Enter` (or `Cmd + Enter`).
-  **Smart Routing**: Dynamic hostname resolution (automatically switches backend API endpoints between `localhost` and `127.0.0.1` based on how the page is loaded).

---

## Project Structure

```text
code compiler/
├── backend/
│   ├── main.cpp          # Temporary C++ file written during compilation
│   ├── server.js         # Node.js + Express compilation and runner server
│   └── package.json      # Backend dependency manifest
├── frontend/
│   ├── index.html        # Main compiler UI layout
│   ├── style.css         # Custom dark stylesheet
│   └── script.js         # Frontend interactive logic
└── README.md             # Project documentation
```

---

## Prerequisites

Before running the application, make sure you have the following installed on your machine:

1. **Node.js** (v14 or higher) - [Download Node.js](https://nodejs.org/)
2. **GCC/g++ Compiler** - Make sure `g++` is installed and added to your system's environment `PATH` variable.
   - *To verify, open terminal/command prompt and run:*
     ```bash
     g++ --version
     ```

---

## Setup & Installation

Follow these quick steps to get the compiler up and running:

### 1. Install Backend Dependencies
Navigate to the `backend/` directory in your terminal and install the Node modules:
```bash
cd backend
npm install
```

### 2. Start the Backend Server
Start the Express server on port `5000`:
```bash
node server.js
```
*You will see the console message:*
```text
C++ Compiler Backend is running on http://localhost:5000
```
Keep this terminal window running.

### 3. Open the Frontend UI
You can launch the user interface in two ways:
- **Option A (Recommended)**: Open your browser and navigate directly to **`http://localhost:5000`** (the backend serves the web interface automatically!).
- **Option B**: Double-click the file [frontend/index.html](frontend/index.html) in your Windows File Explorer, or serve it using VS Code's *Live Server* extension.

---

## Custom Settings and Timeout

- **Execution Timeout**: Set to **5.0 seconds** in [backend/server.js](backend/server.js). You can modify the timeout milliseconds inside the `setTimeout` block if needed.
- **Port**: Default port is `5000`. If you wish to change the port, set the `PORT` environment variable or modify `PORT` in [backend/server.js](backend/server.js).
