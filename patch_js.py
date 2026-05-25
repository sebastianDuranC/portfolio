with open('app.js', 'r') as f:
    content = f.read()

# Add login method to LinuxOS class
login_method = """
    login() {
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            loginScreen.classList.add('fade-out');
            setTimeout(() => {
                loginScreen.style.display = 'none';
                // Automatically open terminal on startup to show neofetch
                this.openWindow('terminal');
            }, 500); // Wait for transition to complete
        }
    }

    setupClock() {"""

content = content.replace("    setupClock() {", login_method)

with open('app.js', 'w') as f:
    f.write(content)
