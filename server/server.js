class Server {
    // build the dataBases 
    constructor() {
        this.dbTasks = new TaskDB();
        this.dbUsers = new UserDB();
    }

    // main handle func 
    requestHandler(request, callback) {
        const { method, url, data } = request;

        if (url.startsWith("/users")) {
            this.handleUserRequests(method, data, callback);

        } else if (url.startsWith("/tasks")) {
            this.handleTaskRequests(method, data, callback);

        } else {
            callback({ status: 404, message: "Not Found" });
        }
    }

    // handle user request func
    handleUserRequests(method, data, callback) {
        switch (method) {
            case "GET":
                if (data && data.userName) {
                    // get user by name
                    const user = this.dbUsers.searchUser(data.userName);
                    callback({ status: user.startsWith("ERROR") ? 400 : 200, data: user });
                } else {
                    // get users
                    const users = this.dbUsers.getUsers();
                    callback({ status: 200, data: users });
                }
                break;

            case "POST":
                // add new user
                const addResult = this.dbUsers.addUser(data.userName, data.password);
                //callback({ status: addResult.startsWith("ERROR") ? 400 : 201, data: addResult });
                if (addResult && addResult.error) {
                    callback({ status: 400, data: addResult.error });
                } else {
                    callback({ status: 201, data: addResult });
                }
                break;

            case "PUT":
                // update existing user
                const updateResult = this.dbUsers.updateUser(data.userName, data);
                callback({ status: updateResult.error ? 400 : 200, data: updateResult });
                break;

            case "DELETE":
                // delete user by userName
                const deleteResult = this.dbUsers.deleteUser(data.userName);
                callback({ status: deleteResult.startsWith("ERROR") ? 400 : 200, data: deleteResult });
                break;

            default:
                callback({ status: 400, message: "Unsupported user request method" });
        }
    }

    //handle task request func
    handleTaskRequests(method, data, callback) {
        switch (method) {
            case "GET":
                if (data && data.userName) {
                    // get tasks by userName
                    const tasks = this.dbTasks.getTasksByUser(data.userName);
                    callback({ status: 200, data: tasks });
                } else {
                    // get all tasks in the DB
                    const allTasks = this.dbTasks.loadTasks();
                    callback({ status: 200, data: allTasks });
                }
                break;

            case "POST":
                // add new task
                const newTask = this.dbTasks.addTask(data.title, data.desc, data.userName);
                callback({ status: newTask.error ? 400 : 201, data: newTask });
                break;

            case "PUT":
                // update existing task
                const taskUpdateResult = this.dbTasks.updateTask(data.id, data);
                callback({ status: taskUpdateResult.error ? 400 : 200, data: taskUpdateResult });
                break;

            case "DELETE":
                // delete task by taskID
                const taskDeleteResult = this.dbTasks.deleteTask(data.id);
                callback({ status: taskDeleteResult.error ? 400 : 200, data: taskDeleteResult });
                break;

            default:
                callback({ status: 400, message: "Unsupported task request method" });
        }
    }
}
