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
        // שליחת בקשת GET לשרת כדי לשלוף את פרטי המשתמש
        const getUserRequest = new FXMLHttpRequest();
        getUserRequest.open("GET", "/users");
        getUserRequest.setCallback(() => {
            if (getUserRequest.readyState === 4) {
                const response = JSON.parse(getUserRequest.response);
                console.log("תגובה מהשרת בטעינת לוח הבקרה:", response);
    
                if (getUserRequest.status === 200) {
                    const user = response.find(u => u.userName === username);
    
                    if (!user) {
                        alert("שם המשתמש לא נמצא במערכת.");
                        return;
                    }
    
                    // הצגת לוח הבקרה לאחר קבלת הנתונים מהשרת
                    renderPage(appTemplate);
                    document.getElementById("user-name").innerText = user.userName;
    
                    // הוספת אירוע לחצן התנתקות
                    document.getElementById("logout-btn").addEventListener("click", () => {
                        // שליחת בקשת DELETE לשרת למחיקת המשתמש המחובר
                        const deleteUserRequest = new FXMLHttpRequest();
                        deleteUserRequest.open("DELETE", "/users");
                        deleteUserRequest.setCallback(() => {
                            if (deleteUserRequest.readyState === 4) {
                                if (deleteUserRequest.status === 200) {
                                    alert("התנתקת בהצלחה.");
                                    renderPage(loginTemplate);
                                    handleLogin();
                                } else {
                                    alert("שגיאה בהתנתקות.");
                                }
                            }
                        });
    
                        // שליחת הבקשה לשרת למחיקת המשתמש המחובר
                        deleteUserRequest.send(JSON.stringify({ userName: username }));
                    });
                } else {
                    alert("שגיאה בטעינת פרטי המשתמש.");
                }
            }
        });
    
        // שליחת בקשת GET לשרת לשליפת כל המשתמשים
        getUserRequest.send();
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

    //  check user logged in- if not alert login
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
        alert("עליך להתחבר קודם");
        return;
    }

    // Fetch tasks from server instead of LocalStorage
    const getTasksRequest = new FXMLHttpRequest();
    getTasksRequest.open("GET", "/tasks");
    getTasksRequest.setCallback(() => {
        if (getTasksRequest.readyState === 4) {
            const response = JSON.parse(getTasksRequest.response);
            console.log("משימות שהתקבלו מהשרת:", response);

            if (getTasksRequest.status === 200) {
                const tasks = response.filter(task => task.userName === loggedInUser);
                renderTasks(tasks);
            } else {
                alert("שגיאה בטעינת המשימות.");
            }
        }
    });

    // Send the request to get all tasks from the server
    getTasksRequest.send();

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

    // Create a new task through server
    createTaskBtn.addEventListener('click', function() {
        if (!taskTitleInput.value.trim()) {
            alert('נא להזין שם משימה');
            return;
        }

        // Check if we're in edit mode
        if (createTaskBtn.dataset.editing) {
            updateTask();
            return;
        }

        const newTask = {
            userName: loggedInUser,
            title: taskTitleInput.value,
            desc: taskDescInput.value,
            priority: taskPrioritySelect.value,
            category: taskCategorySelect.value,
            status: taskCompleteCheckbox.checked
        };

        // Send new task to the server
        const addTaskRequest = new FXMLHttpRequest();
        addTaskRequest.open("POST", "/tasks");
        addTaskRequest.setCallback(() => {
            if (addTaskRequest.readyState === 4) {
                const response = JSON.parse(addTaskRequest.response);
                console.log("תגובה לאחר הוספת משימה:", response);

                if (addTaskRequest.status === 201) {
                    renderTask(response);
                    resetForm();
                } else {
                    alert("שגיאה ביצירת המשימה: " + response);
                }
            }
        });

        addTaskRequest.send(JSON.stringify(newTask));
    });

    // Delete task using server
    deleteTaskBtn.addEventListener('click', function() {
        if (!createTaskBtn.dataset.editing) return;

        const taskId = parseInt(createTaskBtn.dataset.editing);

        if (confirm('האם אתה בטוח שברצונך למחוק את המשימה?')) {
            const deleteTaskRequest = new FXMLHttpRequest();
            deleteTaskRequest.open("DELETE", "/tasks");
            deleteTaskRequest.setCallback(() => {
                if (deleteTaskRequest.readyState === 4) {
                    if (deleteTaskRequest.status === 200) {
                        alert("המשימה נמחקה בהצלחה.");
                        resetForm();
                        refreshTaskListFromServer();
                    } else {
                        alert("שגיאה במחיקת המשימה.");
                    }
                }
            });

            deleteTaskRequest.send(JSON.stringify({ id: taskId }));
        }
    });

    // Render tasks received from the server
    function renderTasks(tasks) {
        taskList.innerHTML = '';
        tasks.forEach(renderTask);
    }

    function updateTask() {
        //  בדיקה אם שם המשימה תקין
        if (!taskTitleInput.value.trim()) {
            alert('נא להזין שם משימה');
            return;
        }
        
        //  מזהה את המשימה לעדכון
        const taskId = parseInt(createTaskBtn.dataset.editing);
        if (!taskId) {
            alert('שגיאה בזיהוי המשימה לעדכון');
            return;
        }
    
        //  יצירת אובייקט המשימה המעודכן
        const updatedTask = {
            id: taskId,
            title: taskTitleInput.value,
            desc: taskDescInput.value, // שדה התיאור נקרא desc בשרת
            priority: taskPrioritySelect.value,
            category: taskCategorySelect.value,
            status: taskCompleteCheckbox.checked
        };
    
        //  יצירת בקשת FAJAX לעדכון המשימה בשרת
        const updateTaskRequest = new FXMLHttpRequest();
        updateTaskRequest.open("PUT", "/tasks");
        
        updateTaskRequest.setCallback(() => {
            if (updateTaskRequest.readyState === 4) {
                console.log(" תגובה מהשרת לעדכון משימה:", updateTaskRequest.response);
                console.log(" סטטוס התגובה:", updateTaskRequest.status);
            
                if (updateTaskRequest.status === 200) {
                    alert("המשימה עודכנה בהצלחה!");
                    resetForm();
                    refreshTaskListFromServer();
                    console.log(" המשימה עודכנה ורענון בוצע בהצלחה.");
                } else {
                    alert("שגיאה בעדכון המשימה: " + updateTaskRequest.response);
                    console.log(" שגיאה בעדכון המשימה:", updateTaskRequest.response);
                }
            } else {
                console.log("⌛ מחכים לתשובת השרת, מצב נוכחי:", updateTaskRequest.readyState);
            }
            
        });
    
        //  שליחת הבקשה לשרת עם נתוני המשימה
        updateTaskRequest.send(JSON.stringify(updatedTask));
    }


    function renderTask(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        if (task.status) {
            taskElement.classList.add('completed');
        }
        taskElement.dataset.id = task.id;

        // בדיקה אם המשימה במצב עריכה
        const isEditing = taskElement.dataset.id === createTaskBtn.dataset.editing;

        const descriptionPreview = truncateDescription(task.desc, 4, isEditing);
        const categoryText = getCategoryText(task.category);

        taskElement.innerHTML = `
            <div class="task-item-title">${task.title}</div>
            <div class="task-item-description">${descriptionPreview}</div>
            <div class="task-item-footer">
                <div class="priority-badge ${task.priority}">${getPriorityText(task.priority)}</div>
                <div class="task-item-category">${categoryText}</div>
            </div>
        `;

        taskElement.addEventListener('click', function() {
            openTaskForEditing(task.id);
        });

        taskList.appendChild(taskElement);
    }


    function truncateDescription(text, wordCount, isEditing = false) {
        if (!text) return '';
        
        // במצב עריכה מחזירים את הטקסט המלא
        if (isEditing) return text;

        const words = text.split(' ');

        // אם הטקסט קצר מהמגבלה, מחזירים אותו כמו שהוא
        if (words.length <= wordCount) return text;

        // מחזירים רק את המילים המותרות ומוסיפים שלוש נקודות לסימון קיצור
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
    // שליחת בקשה לשרת כדי לקבל את כל המשימות
    const getTaskRequest = new FXMLHttpRequest();
    getTaskRequest.open("GET", "/tasks");
    
    getTaskRequest.setCallback(() => {
        if (getTaskRequest.readyState === 4) {
            const response = JSON.parse(getTaskRequest.response);
            
            // בדיקה אם הבקשה הצליחה והמשימות התקבלו
            if (getTaskRequest.status === 200 && Array.isArray(response)) {
                const task = response.find(t => t.id === taskId);
                if (!task) {
                    alert("המשימה לא נמצאה.");
                    return;
                }

                // מילוי הטופס בנתוני המשימה
                taskTitleInput.value = task.title;
                taskDescInput.value = task.desc; // עדכון למבנה הנכון
                taskPrioritySelect.value = task.priority;
                taskCategorySelect.value = task.category;
                taskCompleteCheckbox.checked = task.status;

                // עדכון התג של עדיפות
                priorityBadge.className = 'priority-badge ' + task.priority;
                priorityBadge.textContent = getPriorityText(task.priority);

                // שינוי כפתור היצירה לעדכון
                createTaskBtn.textContent = 'עדכן משימה';
                createTaskBtn.dataset.editing = task.id;

                // הצגת כפתור המחיקה
                deleteTaskBtn.classList.remove('hidden');

                // גלילה לאזור הטופס
                document.querySelector('.task-container').scrollIntoView({
                    behavior: 'smooth'
                });
            } else {
                alert("שגיאה בטעינת פרטי המשימה.");
            }
        }
    });

    // שליחת בקשת ה-GET לשרת
    getTaskRequest.send();
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
    function refreshTaskListFromServer() {
        const loggedInUser = localStorage.getItem("loggedInUser");
        if (!loggedInUser) {
            alert("עליך להתחבר קודם");
            return;
        }
    
        // יצירת בקשת GET לשרת לקבלת כל המשימות של המשתמש הנוכחי
        const getTasksRequest = new FXMLHttpRequest();
        getTasksRequest.open("GET", "/tasks");
        
        getTasksRequest.setCallback(() => {
            if (getTasksRequest.readyState === 4) {
                const response = JSON.parse(getTasksRequest.response);
                console.log(" תגובה מהשרת בשליפת משימות:", response);
    
                if (getTasksRequest.status === 200) {
                    // ניקוי רשימת המשימות הקיימת והצגת משימות חדשות מהשרת
                    taskList.innerHTML = '';
                    response.forEach(task => renderTask(task));
                } else {
                    alert("שגיאה בטעינת המשימות: " + response);
                }
            }
        });
    
        // שליחת הבקשה לשרת עם שם המשתמש המחובר
        getTasksRequest.send(JSON.stringify({ userName: loggedInUser }));
    }   
    
}

function updateUserAvatar(username) {
    const avatarElement = document.getElementById('user-avatar');
    if (avatarElement && username) {
        // Get the first letter of the username
        const initial = username.charAt(0).toUpperCase();
        avatarElement.textContent = initial;
    }
}

    // Add this line to your renderDashboard function
    function renderDashboard(username) {
        renderPage(appTemplate);
        document.getElementById("user-name").innerText = username;
        updateUserAvatar(username);
        
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



