// task dataBase manegment 

class TaskDB{

// save tasks to local storage
saveTasks(tasks){
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


// load tasks from local storage 
loadTasks(){
    console.log("loading tasks from local storage",localStorage.getItem("tasks") );
    return JSON.parse(localStorage.getItem("tasks")) || [];

}

// get task from local storage by id 
getTaskById(taskId){
    const tasks= this.loadTasks();
    const taskById= tasks.find((task)=>task.id===taskId);
    if(taskById)
        return taskById;
    return "ERROR - cant find task by ID";
}

// get tasks from local storage by user name
getTasksByUser(userName = ""){
    const tasks= this.loadTasks();
    if(userName===""){
        return tasks;
    }
    else{
        
        return tasks.filter((task) => task.userName === userName);
    }
}


//add new task to local storage 
addTask(title, desc, userName){
    const tasks= this.loadTasks();
    const newTask={
        userName,
        id: this.updateTaskID(),
        title, 
        desc, 
        date: new Date().toISOString(),   
        status:false
        };
    tasks.push(newTask);
    this.saveTasks(tasks);
    console.log("add new task seccesfully")
    if (!title || !desc || !userName) {
        return { error: "Missing required fields for task creation" };
    }
    return newTask;
}
// update the id for a new task
updateTaskID(){
    var idCounter= localStorage.getItem("idCounter");
    if(idCounter=== null) {
        localStorage.setItem("idCounter",1);
        return 1;
    }
    else{
        idCounter=parseInt(idCounter)+1;
        localStorage.setItem("idCounter",idCounter);
        return idCounter;
    }

}

//update task in local storage
updateTask(taskId, data){

    const tasks= this.loadTasks();
    const task = tasks.find((task)=>task.id=== taskId);
    if(task){
        Object.assign(task,data);
        this.saveTasks(tasks);
        console.log("updated task seccesfully")
        return task;
    }
    return {error: "ERROR - task not found"}
}

// delete task from local storage
deleteTask(taskId){
    const tasks= this.loadTasks();
    const indexToDel= tasks.findIndex((task)=>task.id===taskId);
    if(indexToDel!=-1){
       tasks.splice(indexToDel,1);
       this.saveTasks(tasks); 
       return "delete task ";
    }
    return {error:"ERROR- task to delete not found"};

}
}