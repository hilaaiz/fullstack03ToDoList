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
        const users= this.loadUsers();
        const  wantedUser= users.find((user)=>user.userName=== userName);
        if(wantedUser)
            return wantedUser;
        return "ERROR - user not found"
        
    }

    // get all users from local storage
    getUsers(){
        console.log("get list of users from local storage");
        return this.loadUsers();
    }

    // add new user to local storage
    addUser(userName,email, password){
        const users = this.loadUsers();
        const existingUser= users.find((user)=>user.userName=== userName);
        if(existingUser!=undefined)
            return {error:"ERROR - User already exists"}
        const newUser= {userName,email,password};
        users.push(newUser);
        this.saveUsers(users);
        return newUser;
    }

    //update user in local storage
    updateUser(userName, data){
        const users= this.loadUsers();
        const user = users.find((user)=>user.userName === userName);
        if(user){
            Object.assign(user,data);
            this.saveUsers(users);
            return user;
        }
        return {error: "ERROR - user not found to update"}
    }

    // delete user from local storage
    deleteUser(userName) {
        const users = this.loadUsers();
        const indexToDel = users.findIndex((user) => user.userName === userName);
        if (indexToDel !== -1) {
          users.splice(indexToDel, 1);
          this.saveUsers(users);
          return "delete user seccesfully";
        }
        return {error:"ERROR - user to delete not found"};
      }
}
