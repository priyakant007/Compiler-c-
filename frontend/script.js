console.log("C++ Compiler Script starting...");

let codeEditor, customInput, runBtn, clearBtn, terminalOutput, lineNumbers, exitCodeStat;
let API_URL = 'https://compiler-c.onrender.com';

try {
    codeEditor = document.getElementById('codeEditor');
    customInput = document.getElementById('customInput');
    runBtn = document.getElementById('runBtn');
    clearBtn = document.getElementById('clearBtn');
    terminalOutput = document.getElementById('terminalOutput');
    lineNumbers = document.getElementById('lineNumbers');
    
    const exitCodeStatContainer = document.getElementById('exitCodeStat');
    if (exitCodeStatContainer) {
        exitCodeStat = exitCodeStatContainer.querySelector('.stat-val');
    }

    // Dynamically match API URL host to current browser host (localhost vs 127.0.0.1)
    if (window.location.hostname === '127.0.0.1') {
        API_URL = 'http://127.0.0.1:5000/run';
    } else if (window.location.hostname) {
        API_URL = `${window.location.protocol}//${window.location.hostname}:5000/run`;
    }
    console.log("Resolved API URL to:", API_URL);

    // 1. Dynamic Line Numbers
    function updateLineNumbers() {
        if (!codeEditor || !lineNumbers) return;
        const lines = codeEditor.value.split('\n');
        const count = Math.max(lines.length, 1);
        
        let numbersHtml = '';
        for (let i = 1; i <= count; i++) {
            numbersHtml += `<span>${i}</span>`;
        }
        lineNumbers.innerHTML = numbersHtml;
    }

    if (codeEditor) {
        // Initialize line numbers on load
        updateLineNumbers();

        // Listen for code inputs to update line numbers
        codeEditor.addEventListener('input', updateLineNumbers);

        // Sync scroll of line numbers with editor scrolling
        codeEditor.addEventListener('scroll', () => {
            if (lineNumbers) lineNumbers.scrollTop = codeEditor.scrollTop;
        });

        // Smart indentation inside textarea (Tab key support)
        codeEditor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = codeEditor.selectionStart;
                const end = codeEditor.selectionEnd;
                const value = codeEditor.value;

                codeEditor.value = value.substring(0, start) + "    " + value.substring(end);
                codeEditor.selectionStart = codeEditor.selectionEnd = start + 4;
                updateLineNumbers();
            }
        });
    }

    // 2. Execution logic
    async function runCode() {
        console.log("Run button clicked / shortcut pressed.");
        if (!codeEditor || !terminalOutput) {
            console.error("Required DOM elements are missing.");
            return;
        }

        const code = codeEditor.value.trim();
        const input = customInput ? customInput.value : '';

        if (!code) {
            terminalOutput.className = 'terminal-output error-text';
            terminalOutput.textContent = 'Error: Code editor is empty. Please write some C++ code.';
            return;
        }

        // Toggle Loading state in UI
        if (runBtn) {
            runBtn.disabled = true;
            runBtn.innerHTML = `<span class="spinner"></span> <span>Running...</span>`;
        }
        
        terminalOutput.className = 'terminal-output system-text';
        terminalOutput.textContent = 'Compiling and executing code... Please wait.';
        
        if (exitCodeStat) {
            exitCodeStat.textContent = '-';
            exitCodeStat.style.color = 'var(--text-primary)';
        }

        try {
            console.log("Sending compile request to:", API_URL);
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code, input })
            });

            console.log("Received server response status:", response.status);
            if (!response.ok) {
                throw new Error(`Server returned HTTP status ${response.status}`);
            }

            const result = await response.json();
            console.log("Parsed result:", result);

            terminalOutput.innerHTML = ''; // Clear previous messages
            
            if (result.success) {
                if (exitCodeStat) {
                    exitCodeStat.textContent = result.exitCode !== null ? result.exitCode : '0';
                    exitCodeStat.style.color = result.exitCode === 0 ? 'var(--terminal-success)' : 'var(--terminal-error)';
                }

                if (result.stdout) {
                    const stdoutSpan = document.createElement('span');
                    stdoutSpan.className = 'terminal-output';
                    stdoutSpan.textContent = result.stdout;
                    terminalOutput.appendChild(stdoutSpan);
                }

                if (result.stderr) {
                    const stderrSpan = document.createElement('span');
                    stderrSpan.className = 'terminal-output error-text';
                    stderrSpan.textContent = `\n[Runtime Error/stderr]:\n${result.stderr}`;
                    terminalOutput.appendChild(stderrSpan);
                }

                if (!result.stdout && !result.stderr) {
                    const systemSpan = document.createElement('span');
                    systemSpan.className = 'terminal-output system-text';
                    systemSpan.textContent = '[Program finished execution with no output]';
                    terminalOutput.appendChild(systemSpan);
                }
            } else {
                if (exitCodeStat) {
                    exitCodeStat.textContent = 'Err';
                    exitCodeStat.style.color = 'var(--terminal-error)';
                }

                const errorHeaderSpan = document.createElement('span');
                errorHeaderSpan.className = 'terminal-output error-text';
                errorHeaderSpan.style.fontWeight = 'bold';
                errorHeaderSpan.textContent = `[${result.error}]:\n`;
                terminalOutput.appendChild(errorHeaderSpan);

                const errorDetailsSpan = document.createElement('span');
                errorDetailsSpan.className = 'terminal-output error-text';
                errorDetailsSpan.textContent = result.details;
                terminalOutput.appendChild(errorDetailsSpan);
            }
        } catch (error) {
            console.error("Execution failed:", error);
            if (exitCodeStat) {
                exitCodeStat.textContent = 'Failed';
                exitCodeStat.style.color = 'var(--terminal-error)';
            }
            
            terminalOutput.className = 'terminal-output error-text';
            terminalOutput.textContent = `Connection Error: Unable to communicate with the compilation server.\nDetails: ${error.message}\n\nPlease ensure that the Node.js backend server is running (usually on http://localhost:5000).`;
        } finally {
            // Restore button state
            if (runBtn) {
                runBtn.disabled = false;
                runBtn.innerHTML = `<svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg><span>Run Code</span><span class="shortcut">Ctrl+Enter</span>`;
            }
        }
    }

    // Click handler for Run Button
    if (runBtn) {
        runBtn.addEventListener('click', runCode);
    }

    // 3. Clear Console Logic
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (terminalOutput) {
                terminalOutput.className = 'terminal-output placeholder-text';
                terminalOutput.textContent = 'Console cleared. Click "Run Code" to compile and run.';
            }
            if (exitCodeStat) {
                exitCodeStat.textContent = '-';
                exitCodeStat.style.color = 'var(--text-primary)';
            }
        });
    }

    // 4. Keyboard Shortcut: Ctrl + Enter to Run
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runCode();
        }
    });

    console.log("C++ Compiler Script initialized successfully!");
} catch (e) {
    console.error("Initialization error in script.js:", e);
}
