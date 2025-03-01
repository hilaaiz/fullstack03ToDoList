// user dataBase manegment 

class UserDB{

    // save users to local storage
    saveUsers(users){
        localStorage.setItem("users", JSON.stringify(users));
    }

    // load users from local storage \
    loadUsers(){
        console.log("loading user from local storage",localStorage.getItem("users") );
        return JSON.parse(localStorage.getItem("users")) || [];

    }

    // search user in local storage by user name
    searchUser(userName){
        const users= this.saveUsers();
        return users.find((user)=>user.userName=== userName);
    }

    // get all users from local storage
    getUsers(){
        console.log("get list of users from local storage");
        return this.loadUsers();
    }

    // add new user to local storage
    addUser(userName, password){
        const users = this.loadUsers();
        const existingUser= users.find((user)=>user.userName=== userName);
        if(existingUser!=undefined)
            return "User already exists"
        const newUser= {userName,password};
        users.push(newUser);
        this.saveUsers(users);
        return newUser;
    }

    //update user in local storage
    updateUser(userName, data){
        const users= this.loadUsers();
        const user = users.find((user)=>user.userName=== userName);
        if(user){
            Object.assign(user,data);
            this.saveUsers(users);
            return true;
        }
        return false;
    }

    // delete user from local storage
    deleteUser(userName) {
        const users = this.loadUsers();
        const indexToDel = users.findIndex((user) => user.userName === userName);
        if (index !== -1) {
          users.splice(index, 1);
          this.saveUsers(users);
          return true;
        }
        return false;
      }
}
