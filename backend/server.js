const express = require('express');
const cors = require('cors');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the frontend can communicate with the backend
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// Serve the frontend static files (HTML, CSS, JS) at http://localhost:5000
app.use(express.static(path.join(__dirname, '../frontend')));

// Endpoint to run C++ code
app.post('/run', (req, res) => {
  const { code, input } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  // 1. Save code into main.cpp
  const codePath = path.join(__dirname, 'main.cpp');
  try {
    fs.writeFileSync(codePath, code);
  } catch (err) {
    console.error('Failed to write main.cpp:', err);
    return res.status(500).json({ error: 'Failed to save code to file.' });
  }

  // 2. Generate unique name for compilation output to avoid file access/lock collisions on Windows
  const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const exePath = path.join(__dirname, `main_${uniqueSuffix}`);

  // 3. Compile using g++
  // Wrap paths in quotes to support spaces in directory paths (e.g., "code compiler")
  const compileCmd = `g++ "${codePath}" -o "${exePath}"`;

  exec(compileCmd, (compileError, stdout, stderr) => {
    if (compileError) {
      // Compilation failed, return stderr (which contains compile errors)
      return res.json({
        success: false,
        error: 'Compilation Error',
        details: stderr || compileError.message
      });
    }

    // 4. Run the compiled executable
    const child = spawn(exePath);

    let output = '';
    let errorOutput = '';
    let killedDueToTimeout = false;

    // Timeout of 5 seconds to prevent infinite loops from freezing the server
    const timeout = setTimeout(() => {
      killedDueToTimeout = true;
      child.kill();
    }, 5000);

    // Pass custom input to program's standard input (stdin)
    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end(); // Close stdin so the program knows no more input is coming

    // Gather standard output (stdout)
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Gather standard error (stderr)
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Process finished execution
    child.on('close', (codeSignal) => {
      clearTimeout(timeout);

      // Clean up the unique executable file
      try {
        if (fs.existsSync(exePath)) {
          fs.unlinkSync(exePath);
        }
      } catch (err) {
        console.error('Failed to delete temporary executable:', err);
      }

      if (killedDueToTimeout) {
        return res.json({
          success: false,
          error: 'Time Limit Exceeded',
          details: 'Your program ran for too long (exceeded 5 seconds timeout).'
        });
      }

      res.json({
        success: true,
        stdout: output,
        stderr: errorOutput,
        exitCode: codeSignal
      });
    });

    // Spawn error handling (e.g., couldn't run exe)
    child.on('error', (err) => {
      clearTimeout(timeout);
      try {
        if (fs.existsSync(exePath)) {
          fs.unlinkSync(exePath);
        }
      } catch (e) {}

      res.json({
        success: false,
        error: 'Execution Error',
        details: err.message
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`C++ Compiler Backend is running on port ${PORT}`);
});
