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
    );

    dequeueWorker = accepts a function that is called when auto-dequeue is executed
        Auto-dequeue is only executed in async mode.
    
    dequeueBatchSize = how many elements are returned when dequeued.
        This applies for both sync and async mode.
    
    dequeueDelay = how many milliseconds of a minimum delay you want between 
        auto-dequeue worker executed.

    
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


*/
class FifoQueueAsync{

    constructor(dequeueWorker = null, dequeueBatchSize = 1, dequeueDelay = 10) {
        this.items = [];
        this.front = 0;
        this.rear = 0;
        this.dequeueWorkerCallback = dequeueWorker
        this.dequeueBatchSize = dequeueBatchSize
        this.dequeueDelay = dequeueDelay
    }

    // returns element to be dequeued next
    getDequeueElement() {
        if (this.isEmpty()) {
            return null;
        }
        const item = this.items[this.front];
        delete this.items[this.front];
        this.front++;
        return item;
    }

    // returns list of dequeued elements (depending on the set batch size)
    getDequeueElements(batchSize = null){
        let elements = []
        const queueSize = this.size()
        let dequeueLimit = batchSize === null
                            ? Math.min(this.dequeueBatchSize, queueSize) 
                            : Math.min(batchSize, queueSize)
    
        for(let i=dequeueLimit; i>0; i--){
            elements.push(this.getDequeueElement())
        }

        // reset pointers if empty
        if (this.isEmpty()) {
            this.clear()
        }
        return elements
    }

    // Add element to the queue
    enqueue(element) {
        this.items[this.rear] = element;
        this.rear++;
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
            this.dequeueWorkerCallback(this.getDequeueElements(), this.isEmpty())
        }
    }

    // start async dequeue but only if dequeueWorker is set
    // function will keep executing until queue is empty
    startAutoDequeue(){
        if(this.dequeueWorkerCallback === null || typeof this.dequeueWorkerCallback !== 'function'){
            return false;
        }

        if(!this.isEmpty()){
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
        return this.items[this.front];
    }

    // Check if queue is empty
    isEmpty() {
        return this.front === this.rear;
    }

    // Return queue size
    size() {
        return this.rear - this.front;
    }

    // Clear the queue
    clear() {
        this.items = [];
        this.front = 0;
        this.rear = 0;
    }

    // sets dequeueWorkerCallback to null which turns off async mode
    removeDequeueWorkerCallback() {
        this.dequeueWorkerCallback = null;
    }
}

// TESTS
function test(testAutoDequeue = true) {
    function dequeueWorker(elements, isEmpty){
        console.log(`Got elementes from the queue: ${elements} :: Is queue empty?: ${isEmpty}`)
    }

    const queue = new FifoQueueAsync(
        dequeueWorker=dequeueWorker, 
        dequeueBatchSize=11, 
        dequeueDelay=500
    );

    if(testAutoDequeue){
        for(let i = 0; i < 100; i++){
            queue.enqueue(i)
        }
        console.log(`Queue size: ${queue.size()}`)
        console.log(`First element to be dequeued: ${queue.peek()}`)
        console.log('Starting dequeue worker')
        queue.startAutoDequeue()
    } else {
        queue.clear()
        let el
        for(let i = 0; i < 3; i++){
            queue.enqueue(i)
        }
        queue.removeDequeueWorkerCallback()
        el = queue.dequeue()
        console.log(`Dequeued element: ${el}`)
        el = queue.dequeue()
        console.log(`Dequeued element: ${el}`)
        el = queue.dequeue()
        console.log(`Dequeued element: ${el}`)
        el = queue.dequeue()
        console.log(`Dequeued element: ${el}`)

        for(let i = 0; i < 3; i++){
            queue.enqueue(i)
        }
        queue.removeDequeueWorkerCallback()
        el = queue.dequeue(4)
        console.log(`Dequeued elements: ${el}`)
    } 
}

test(true)