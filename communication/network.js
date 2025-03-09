
class Network {
    constructor() {
        this.server = new Server(); 
        this.packetLossRate = 0.2;
    }
    // send request to server func
    sendToServer(request, callback = () => {}) {
        console.log("ending request to server:", request);

        // create delay
        const delay = Math.floor(Math.random() * 2000) + 1000;

        setTimeout(() => {
        
            // packet loss
            if (Math.random() < this.packetLossRate) {
                console.warn(" ERROR - Request lost");
                callback({ status: 503, message: "Network Error: Request lost" });
                return;
            }

            this.server.requestHandler(request, (response) => {
                console.log("Response received from server:", response);
                callback(response);
            });

        }, delay);
    }

    // change loss rate func
    setPacketLossRate(rate) {
        if (rate < 0.1) rate = 0.1;
        if (rate > 0.5) rate = 0.5;
        this.packetLossRate = rate;
        console.log("Packet loss rate set to ${(rate * 100).toFixed(0)}%");
    }
}

// create network
const network = new Network();

