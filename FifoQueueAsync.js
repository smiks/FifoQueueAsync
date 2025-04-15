/*
    FifoQueueAsync

    A First-In-First-Out Queue with Async support.
    You can use it as a regular queue, or you can use it
    as an automated async queue.

    You can achieve async mode by setting up a dequeueWorker.

    const queue = new FifoQueueAsync(
        dequeueWorker=[optional] [default = null],
        dequeueBatchSize=[optional] [default = 1],
        dequeueDelay=[optional] [default = 10]
        manualStop = [optional] [default = false]
    );

    dequeueWorker = accepts a function that is called when auto-dequeue is executed
        Auto-dequeue is only executed in async mode.

    dequeueBatchSize = how many elements are returned when dequeued.
        This applies for both sync and async mode.

    dequeueDelay = how many milliseconds of a minimum delay you want between
        auto-dequeue worker executed.

    manualStop = if set to true, you have to manually stop autoDeque procedure,
        if false, auto dequeue will stop automatically when queue is empty

    Sync mode:
        enqueue: queue.enqueue([element])
        enqueue: queue.enqueue([element])
        enqueue: queue.enqueue([element])
        dequeue: queue.dequeue(batchSize [optional] [default=1])

    Async mode:
        enqueue: queue.enqueue([element])
        enqueue: queue.enqueue([element])
        enqueue: queue.enqueue([element])
        dequeue: queue.startAutoDequeue()

    Once auto-dequeue begins, it will keep running until queue is empty.

    Each time quto-dequeue is executed, it will call dequeueWorker function
    that was setup in constructor.
    It will also pass dequeued elements and isEmpty flag (if queue is empty now or not).
    dequeueWorkerCallback(dequeuedElements, isEmpty)

    Queue methods:
    - enqueue(element)
    - dequeue(batchSize [optional] [default=1])
    - size() // returns queue size
    - isEmpty() // returns true | false depending if queue is empty or not
    - peek() // returns next element to be dequeued without dequeueing it
    - clear() // empties the queue
    - removeDequeueWorkerCallback() // removes dequeueWorker function
                                    // which turns off auto-dequeue/async mode
    - stopAutoDequeue() // stops auto dequeue procedure

*/

class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class FifoQueueAsync{

    constructor(dequeueWorker = null, dequeueBatchSize = 1, dequeueDelay = 10, manualStop = false) {
        this.head = null;
        this.tail = null;
        this.length = 0;
        this.dequeueWorkerCallback = dequeueWorker
        this.dequeueBatchSize = dequeueBatchSize
        this.dequeueDelay = dequeueDelay
        this.manualStop = manualStop
    }

    // returns element to be dequeued next
    getDequeueElement() {
        if (this.length === 0) {
            return null;
        }

        const removedNode = this.head;

        if (this.head === this.tail) {
            // Only one item in the queue
            this.tail = null;
        }

        this.head = this.head.next;
        this.length--;

        return removedNode.value;
    }

    // returns list of dequeued elements (depending on the set batch size)
    getDequeueElements(batchSize = null){
        let elements = []
        const queueSize = this.length
        let dequeueLimit = batchSize === null
            ? Math.min(this.dequeueBatchSize, queueSize)
            : Math.min(batchSize, queueSize)

        for(let i=dequeueLimit; i>0; i--){
            elements.push(this.getDequeueElement())
        }

        // reset pointers if empty
        if (this.length === 0) {
            this.clear()
        }
        return elements
    }

    // Add element to the queue
    enqueue(value) {
        const newNode = new Node(value);
        if (this.length === 0) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            this.tail = newNode;
        }

        this.length++;
    }

    // Remove and return element from the queue
    dequeue(batchSize = 1) {
        if(this.dequeueWorkerCallback !== null && typeof this.dequeueWorkerCallback === 'function'){
            this.dequeueWorker()
            return
        }
        return this.getDequeueElements(batchSize)
    }

    // dequeue worker (calls a preset function and passes dequeued elements, and boolean if is empty)
    dequeueWorker(){
        if(typeof this.dequeueWorkerCallback === 'function'){
            this.dequeueWorkerCallback(this.getDequeueElements(), this.length === 0)
        }
    }

    // start async dequeue but only if dequeueWorker is set
    // function will keep executing until queue is empty (unless manualStop is set to true)
    startAutoDequeue(){
        if(this.dequeueWorkerCallback === null || typeof this.dequeueWorkerCallback !== 'function'){
            return false;
        }

        // manual stop is not set
        if(!this.manualStop){
            if(this.length !== 0){
                this.dequeueWorker()

                setTimeout(() => {
                    this.startAutoDequeue()
                }, this.dequeueDelay)
            }
        } else {
            this.dequeueWorker()

            setTimeout(() => {
                this.startAutoDequeue()
            }, this.dequeueDelay)
        }
    }

    // Return front element without removing it
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.head.value;
    }

    // Check if queue is empty
    isEmpty() {
        return this.length === 0;
    }

    // Return queue size
    size() {
        return this.length;
    }

    // Clear the queue
    clear() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    // sets dequeueWorkerCallback to null which turns off async mode
    removeDequeueWorkerCallback() {
        this.dequeueWorkerCallback = null;
    }

    // stop auto dequeue
    stopAutoDequeue() {
        this.manualStop = false
    }
}

module.exports = FifoQueueAsync;