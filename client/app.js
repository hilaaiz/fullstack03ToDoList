// app.js

document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("root");
    const loginTemplate = document.getElementById("login-template").content;
    const registerTemplate = document.getElementById("register-template").content;
    const appTemplate = document.getElementById("app-template").content;

    function renderPage(template) {
        root.innerHTML = "";
        root.appendChild(template.cloneNode(true));
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
    
            // יצירת אובייקט FAJAX לשליחת בקשה לשרת
            const addUserRequest = new FXMLHttpRequest();
            addUserRequest.open("POST", "/users");
            addUserRequest.setCallback(() => {
                if (addUserRequest.readyState === 4) {
                    const response = JSON.parse(addUserRequest.response);
                    console.log("תגובה מהשרת בהרשמה:", response);
    
                    if (addUserRequest.status === 400) {
                        alert("שגיאה בהרשמה: שם המשתמש כבר קיים, בחר שם אחר");
                        return;
                    }
    
                    if (addUserRequest.status === 201) {
                        alert("ההרשמה בוצעה בהצלחה! כעת ניתן להתחבר.");
                        renderPage(loginTemplate);
                        handleLogin();
                    }
                }
            });
    
            // שליחת הבקשה לשרת
            addUserRequest.send(JSON.stringify({
                userName: username,
                email: email,
                password: password
            }));
        });
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
    
            // יצירת בקשת GET לשרת כדי לקבל את פרטי המשתמש
            const getUserRequest = new FXMLHttpRequest();
            getUserRequest.open("GET", "/users");
            getUserRequest.setCallback(() => {
                if (getUserRequest.readyState === 4) {
                    const response = JSON.parse(getUserRequest.response);
                    console.log("תגובה מהשרת בלוגין:", response);
    
                    // בדיקה אם המשתמש קיים במערכת
                    if (getUserRequest.status === 200 && Array.isArray(response)) {
                        const user = response.find(u => u.userName === username);
    
                        if (!user) {
                            alert("שם המשתמש לא קיים.");
                            return;
                        }
    
                        // בדיקת הסיסמה
                        if (user.password !== password) {
                            alert("הסיסמה שגויה.");
                            return;
                        }
    
                        // התחברות מוצלחת
                        alert(`ברוך הבא, ${username}!`);
                        localStorage.setItem("loggedInUser", username);
                        renderDashboard(username);
                    } else {
                        alert("שגיאה בטעינת פרטי המשתמש.");
                    }
                }
            });
    
            // שליחת הבקשה לשרת לקבלת כל המשתמשים
            getUserRequest.send();
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

    function initTaskManager() {
        // Select DOM elements
        const taskPrioritySelect = document.getElementById('task-priority');
        const priorityBadge = document.querySelector('.priority-badge');
        const createTaskBtn = document.querySelector('.create-task');
        const deleteTaskBtn = document.querySelector('.delete-task');
        const taskList = document.querySelector('.task-list');
        const taskTitleInput = document.querySelector('.task-title');
        const taskDescInput = document.querySelector('.task-description');
        const taskCategorySelect = document.getElementById('task-category');
        const taskCompleteCheckbox = document.getElementById('task-complete');
        
        // Load tasks from localStorage
        const loggedInUser = localStorage.getItem("loggedInUser");
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(task => task.userName === loggedInUser);
        
        // Update priority badge based on selected priority
        taskPrioritySelect.addEventListener('change', function() {
            priorityBadge.className = 'priority-badge ' + this.value;
            
            // Update text content based on priority
            if (this.value === 'high') {
                priorityBadge.textContent = 'דחופה';
            } else if (this.value === 'medium') {
                priorityBadge.textContent = 'בינונית';
            } else {
                priorityBadge.textContent = 'נמוכה';
            }
        });
        
        // Create a new task
        createTaskBtn.addEventListener('click', function() {
            // Validate task title
            if (!taskTitleInput.value.trim()) {
                alert('נא להזין שם משימה');
                return;
            }
            // Check if we're in edit mode
            if (createTaskBtn.dataset.editing) {
                updateTask();
                return;
            }

            const loggedInUser = localStorage.getItem("loggedInUser");
            if (!loggedInUser) {
            alert("עליך להתחבר קודם");
            return;
            }
            
            // Create new task object
            const newTask = {
                id: Date.now(),
                userName: loggedInUser,
                title: taskTitleInput.value,
                description: taskDescInput.value,
                priority: taskPrioritySelect.value,
                category: taskCategorySelect.value,
                completed: taskCompleteCheckbox.checked,
                createdAt: new Date().toISOString()
            };
            
            // Add to tasks array
            tasks.push(newTask);
            
            // Save to localStorage
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            // Render the task
            renderTask(newTask);
            
            // Clear form
            resetForm();
        });
        
    // Delete task button event listener
    deleteTaskBtn.addEventListener('click', function() {
        if (!createTaskBtn.dataset.editing) return;
        
        const taskId = parseInt(createTaskBtn.dataset.editing);
        
        // Confirm deletion
        if (confirm('האם אתה בטוח שברצונך למחוק את המשימה?')) {
            // Remove task from array
            tasks = tasks.filter(task => task.id !== taskId);
            
            // Save to localStorage
            localStorage.setItem('tasks', JSON.stringify(tasks));
            
            // Reset the form
            resetForm();
            
            // Re-render task list
            refreshTaskList();
        }
    });
    
    // Render a single task item
    function renderTask(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        if (task.completed) {
            taskElement.classList.add('completed');
        }
        taskElement.dataset.id = task.id;
        
        const descriptionPreview = truncateDescription(task.description, 4);
        const categoryText = getCategoryText(task.category);
        
        taskElement.innerHTML = `
            <div class="task-item-title">${task.title}</div>
            <div class="task-item-description">${descriptionPreview}</div>
            <div class="task-item-footer">
                <div class="priority-badge ${task.priority}">${getPriorityText(task.priority)}</div>
                <div class="task-item-category">${categoryText}</div>
            </div>
        `;
        
        // Add click event to open/edit task
        taskElement.addEventListener('click', function() {
            openTaskForEditing(task.id);
        });
        
        taskList.appendChild(taskElement);
    }
    
    // Truncate description to specified number of words
    function truncateDescription(text, wordCount) {
        if (!text) return '';
        const words = text.split(' ');
        if (words.length <= wordCount) return text;
        return words.slice(0, wordCount).join(' ') + '...';
    }
    
    // Helper function to get priority text in Hebrew
    function getPriorityText(priority) {
        switch(priority) {
            case 'high': return 'דחופה';
            case 'medium': return 'בינונית';
            case 'low': return 'נמוכה';
            default: return '';
        }
    }
    
    // Helper function to get category text in Hebrew
    function getCategoryText(category) {
        switch(category) {
            case 'home': return 'בית';
            case 'work': return 'עבודה';
            case 'studies': return 'לימודים';
            case 'finances': return 'פיננסים';
            case 'other': return 'אחר';
            default: return '';
        }
    }
    
    // Open task for editing
    function openTaskForEditing(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        // Fill form with task data
        taskTitleInput.value = task.title;
        taskDescInput.value = task.description;
        taskPrioritySelect.value = task.priority;
        taskCategorySelect.value = task.category;
        taskCompleteCheckbox.checked = task.completed;
        
        // Update priority badge
        priorityBadge.className = 'priority-badge ' + task.priority;
        priorityBadge.textContent = getPriorityText(task.priority);
        
        // Change create button to update
        createTaskBtn.textContent = 'עדכן משימה';
        createTaskBtn.dataset.editing = taskId;
        
        // Show delete button
        deleteTaskBtn.classList.remove('hidden');
        
        // Scroll to form
        document.querySelector('.task-container').scrollIntoView({
            behavior: 'smooth'
        });
    }
    
    // Update an existing task
    function updateTask() {
        // Validate task title
        if (!taskTitleInput.value.trim()) {
            alert('נא להזין שם משימה');
            return;
        }
        
        const taskId = parseInt(createTaskBtn.dataset.editing);
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) return;
        
        // Update task object
        tasks[taskIndex] = {
            ...tasks[taskIndex],
            title: taskTitleInput.value,
            description: taskDescInput.value,
            priority: taskPrioritySelect.value,
            category: taskCategorySelect.value,
            completed: taskCompleteCheckbox.checked,
            updatedAt: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Reset form
        resetForm();
        
        // Refresh task list
        refreshTaskList();
    }
    
    // Reset form to create mode
    function resetForm() {
        taskTitleInput.value = '';
        taskDescInput.value = '';
        taskPrioritySelect.value = 'high';
        taskCategorySelect.value = 'home';
        taskCompleteCheckbox.checked = false;
        
        // Reset priority badge
        priorityBadge.className = 'priority-badge high';
        priorityBadge.textContent = 'דחופה';
        
        // Reset button
        createTaskBtn.textContent = 'צור משימה';
        delete createTaskBtn.dataset.editing;
        
        // Hide delete button
        deleteTaskBtn.classList.add('hidden');
    }
    
    // Refresh the task list
    function refreshTaskList() {
        taskList.innerHTML = '';
        tasks.forEach(renderTask);
    }
    
    // Render existing tasks
    refreshTaskList();
}    
    
    // Add this line to your renderDashboard function
    function renderDashboard(username) {
        renderPage(appTemplate);
        document.getElementById("user-name").innerText = username;
        document.getElementById("logout-btn").addEventListener("click", () => {
            localStorage.removeItem("loggedInUser");
            renderPage(loginTemplate);
            handleLogin();
        });
        
        // Initialize task manager
        initTaskManager();
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



