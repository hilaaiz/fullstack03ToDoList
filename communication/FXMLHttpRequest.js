class FXMLHttpRequest {
    constructor() {
        this.method = null;     // kind of request- post,get,put,delete
        this.url = null;         // the URL that send to user ot task DB
        this.data = null;       
        this.callback = () => {}; // callback func   
        this.readyState = 0;     //0-unset: ,1-opened:call for open,2-headers_received:call for send, 3- loading:get data, 4-done
        this.status = 0;         // status- 404,200
        this.response = null;   // response from server
    }

    setCallback(callback) {
        this.callback = callback;
    }

    // create 
    open(method, url) {
        this.method = method;// kind of request
        this.url = url;
        this.readyState = 1; // change to opened
        console.log("in open - create the request ");
    }

    // send to server
    send(data = null) {
        this.data = data;
        this.readyState = 2; // change to headers_received

        
        const request = {
            method: this.method,
            url: this.url,
            data: this.data ? JSON.parse(this.data) : {}
        };

        // sending to server using network
        network.sendToServer(request, (response) => {
            this.readyState = 4; // change to done
            this.status = response.status; 

            if(response.data !== undefined){
                  this.response = JSON.stringify(response.data); 
            }
            else{
                this.response = JSON.stringify({ message: response.message });
            }
            
            console.log("Response received", response);

            // callback
            if (typeof this.callback === "function") {
                this.callback();
            }
        });
        console.log("in send -  sending request", this.data);

    }

     
}
