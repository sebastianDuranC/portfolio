with open('app.js', 'r') as f:
    content = f.read()

# Add event listener for Enter key on password input
init_method_old = """    init() {
        this.setupClock();
        this.setupDraggableWindows();
        this.setupWindowClickToFront();
    }"""

init_method_new = """    init() {
        this.setupClock();
        this.setupDraggableWindows();
        this.setupWindowClickToFront();
        this.setupLogin();
    }

    setupLogin() {
        const passwordInput = document.getElementById('login-password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.login();
                }
            });
        }
    }"""

content = content.replace(init_method_old, init_method_new)

with open('app.js', 'w') as f:
    f.write(content)
