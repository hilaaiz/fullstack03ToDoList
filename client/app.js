// // app.js

// // // Configure initial app settings
// // const AppConfig = {
// //     apiEndpoints: {
// //         auth: '/auth',
// //         tasks: '/tasks'
// //     },
// //     defaultRoute: '#login',
// //     networkConfig: {
// //         dropRate: 0.1,
// //         minDelay: 1000,
// //         maxDelay: 3000
// //     }
// // };

// // // Route handler configurations
// // const RouteHandlers = {
// //     '#login': {
// //         requiresAuth: false,
// //         template: 'login-template'
// //     },
// //     '#register': {
// //         requiresAuth: false,
// //         template: 'register-template'
// //     },
// //     '#app': {
// //         requiresAuth: true,
// //         template: 'app-template'
// //     }
// // };

// class TaskMasterApp {
//     constructor() {
//         // Initialize core components
//         this.initializeComponents();
        
//         // Initialize app state
//         this.state = {
//             currentUser: null,
//             tasks: [],
//             isLoading: false,
//             filters: {
//                 search: '',
//                 priority: 'all'
//             }
//         };

//         // Start the application
//         this.start();
//     }

//     // initializeComponents() {
//     //     // Initialize network instance
//     //     this.network = new Network();
        
//     //     // Initialize databases
//     //     this.userDB = new Database('users');
//     //     this.taskDB = new Database('tasks');
//     //     this.userDB.init();
//     //     this.taskDB.init();

//     //     // Initialize servers
//     //     this.authServer = new Server(this.userDB);
//     //     this.taskServer = new Server(this.taskDB);

//     //     // Initialize client
//     //     this.client = new Client();
//     // }

//     start() {
//         // Register global error handler
//         window.onerror = this.handleError.bind(this);

//         // Initialize loading indicator
//         this.setupLoadingIndicator();

//         // Setup global event listeners
//         this.setupGlobalEventListeners();

//         // Handle initial route
//         this.handleInitialRoute();
//     }

//     setupLoadingIndicator() {
//         const loadingSpinner = document.getElementById('loading-spinner');
        
//         // Show/hide loading spinner
//         this.showLoading = () => {
//             loadingSpinner.classList.remove('hidden');
//             this.state.isLoading = true;
//         };

//         this.hideLoading = () => {
//             loadingSpinner.classList.add('hidden');
//             this.state.isLoading = false;
//         };
//     }

//     setupGlobalEventListeners() {
//         // Listen for all FAJAX requests
//         document.addEventListener('fajax-request-start', () => this.showLoading());
//         document.addEventListener('fajax-request-end', () => this.hideLoading());

//         // Listen for authentication events
//         document.addEventListener('auth-status-changed', (event) => {
//             this.handleAuthStatusChange(event.detail);
//         });

//         // Listen for task updates
//         document.addEventListener('task-updated', () => {
//             this.client.loadTasks();
//         });

//         // Listen for filter changes
//         const searchInput = document.getElementById('search-tasks');
//         if (searchInput) {
//             searchInput.addEventListener('input', (e) => {
//                 this.state.filters.search = e.target.value;
//                 this.applyFilters();
//             });
//         }

//         const priorityFilter = document.getElementById('filter-priority');
//         if (priorityFilter) {
//             priorityFilter.addEventListener('change', (e) => {
//                 this.state.filters.priority = e.target.value;
//                 this.applyFilters();
//             });
//         }
//     }

//     handleInitialRoute() {
//         const currentHash = window.location.hash || AppConfig.defaultRoute;
//         const routeConfig = RouteHandlers[currentHash];

//         if (!routeConfig) {
//             window.location.hash = AppConfig.defaultRoute;
//             return;
//         }

//         if (routeConfig.requiresAuth && !this.state.currentUser) {
//             window.location.hash = '#login';
//             return;
//         }

//         this.client.handleNavigation();
//     }

//     applyFilters() {
//         const filteredTasks = this.state.tasks.filter(task => {
//             // Apply search filter
//             const matchesSearch = task.title.toLowerCase().includes(this.state.filters.search.toLowerCase()) ||
//                                 task.description.toLowerCase().includes(this.state.filters.search.toLowerCase());

//             // Apply priority filter
//             const matchesPriority = this.state.filters.priority === 'all' || 
//                                   task.priority === this.state.filters.priority;

//             return matchesSearch && matchesPriority;
//         });

//         this.client.renderTasks(filteredTasks);
//     }

//     handleAuthStatusChange(user) {
//         this.state.currentUser = user;
        
//         // Update UI elements
//         const userNameElement = document.getElementById('user-name');
//         if (userNameElement) {
//             userNameElement.textContent = user ? `שלום, ${user.name}` : '';
//         }

//         // Handle routing
//         if (!user && window.location.hash === '#app') {
//             window.location.hash = '#login';
//         }
//     }

//     handleError(message, source, lineno, colno, error) {
//         console.error('Application Error:', error);
        
//         // Show user-friendly error message
//         this.client.showNotification('אירעה שגיאה במערכת', 'error');
        
//         // Hide loading indicator if error occurred during loading
//         if (this.state.isLoading) {
//             this.hideLoading();
//         }

//         return true; // Prevent default error handling
//     }
// }

// // Initialize the application when the DOM is ready
// document.addEventListener('DOMContentLoaded', () => {
//     window.app = new TaskMasterApp();
// });


// ///////////////
// document.addEventListener("DOMContentLoaded", function () {
//     const root = document.getElementById("root");

//     function loadPage(templateId) {
//         const template = document.getElementById(templateId);
//         if (template) {
//             root.innerHTML = ""; // מנקה את התוכן הקיים
//             const clone = document.importNode(template.content, true);
//             root.appendChild(clone);
//         }
//     }

//     // התחלה עם עמוד ההתחברות
//     loadPage("login-template");

//     // מעבר להרשמה בלחיצה
//     document.addEventListener("click", function (event) {
//         if (event.target.id === "to-register") {
//             event.preventDefault();
//             loadPage("register-template");
//         } else if (event.target.id === "to-login") {
//             event.preventDefault();
//             loadPage("login-template");
//         }
//     });
// });
///////////////
document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("root");
    const loginTemplate = document.getElementById("login-template").content;
    const registerTemplate = document.getElementById("register-template").content;
    const appTemplate = document.getElementById("app-template").content;

    function renderPage(template) {
        root.innerHTML = "";
        root.appendChild(template.cloneNode(true));
    }

    function saveUserToLocalStorage(user) {
        let users = JSON.parse(localStorage.getItem("users")) || {};
        if (users[user.username]) {
            return false;
        }
        users[user.username] = user;
        localStorage.setItem("users", JSON.stringify(users));
        return true;
    }

    function getUserFromLocalStorage(username) {
        let users = JSON.parse(localStorage.getItem("users")) || {};
        return users[username] || null;
    }

    function handleLogin() {
        const loginForm = document.getElementById("login-form");
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("login-user-name").value;
            const password = document.getElementById("login-password").value;
            
            const user = getUserFromLocalStorage(username);
            if (!user) {
                alert("שם המשתמש לא קיים");
                return;
            }
            if (user.password !== password) {
                alert("הסיסמה שגויה");
                return;
            }
            localStorage.setItem("loggedInUser", username);
            renderDashboard(username);
        });
    }

    function handleRegister() {
        const registerForm = document.getElementById("register-form");
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = document.getElementById("register-name").value;
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;
            
            if (password.length < 6) {
                alert("הסיסמה חייבת להכיל לפחות 6 תווים");
                return;
            }
            
            const newUser = { username, email, password };
            if (!saveUserToLocalStorage(newUser)) {
                alert("שם המשתמש כבר תפוס, בחר שם אחר");
                return;
            }
            alert("ההרשמה בוצעה בהצלחה! כעת ניתן להתחבר.");
            renderPage(loginTemplate);
            handleLogin();
        });
    }

    function renderDashboard(username) {
        renderPage(appTemplate);
        document.getElementById("user-name").innerText = username;
        document.getElementById("logout-btn").addEventListener("click", () => {
            localStorage.removeItem("loggedInUser");
            renderPage(loginTemplate);
            handleLogin();
        });
    }

    document.addEventListener("click", function (event) {
        if (event.target.id === "to-register") {
            event.preventDefault();
            renderPage(registerTemplate);
            handleRegister();
        } else if (event.target.id === "to-login") {
            event.preventDefault();
            renderPage(loginTemplate);
            handleLogin();
        }
    });
    

    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
        renderDashboard(loggedInUser);
    } else {
        renderPage(loginTemplate);
        handleLogin();
    }
});

//main page

