# FifoQueueAsync

A First-In-First-Out Queue with Async support.
You can use it as a regular queue, or you can use it 
as an automated async queue.

You can achieve async mode by setting up a dequeueWorker.

const queue = new FifoQueueAsync( \
&nbsp; &nbsp; dequeueWorker=[optional] [default = null], \
&nbsp; &nbsp; dequeueBatchSize=[optional] [default = 1], \
&nbsp; &nbsp; dequeueDelay=[optional] [default = 10] \
);

dequeueWorker = accepts a function that is called when auto-dequeue is executed \
Auto-dequeue is only executed in async mode.

dequeueBatchSize = how many elements are returned when dequeued. \
This applies for both sync and async mode.

dequeueDelay = how many milliseconds of a minimum delay you want between \
auto-dequeue worker executed.


Sync mode: \
&nbsp; &nbsp; enqueue: queue.enqueue([element]) \
&nbsp; &nbsp; enqueue: queue.enqueue([element]) \
&nbsp; &nbsp; enqueue: queue.enqueue([element]) \
&nbsp; &nbsp; dequeue: queue.dequeue(batchSize [optional] [default=1]) \
 \
Async mode: \
&nbsp; &nbsp; enqueue: queue.enqueue([element]) \
&nbsp; &nbsp; enqueue: queue.enqueue([element]) \
&nbsp; &nbsp; enqueue: queue.enqueue([element]) \
&nbsp; &nbsp; dequeue: queue.startAutoDequeue() \   
 \
Once auto-dequeue begins, it will keep running until queue is empty.

Each time quto-dequeue is executed, it will call dequeueWorker function \
that was setup in constructor. \
It will also pass dequeued elements and isEmpty flag (if queue is empty now or not). \
dequeueWorkerCallback(dequeuedElements, isEmpty)
\
\
Queue methods:
- enqueue(element)
- dequeue(batchSize [optional] [default=1])
- size() // returns queue size
- isEmpty() // returns true | false depending if queue is empty or not
- peek() // returns next element to be dequeued without dequeueing it
- clear() // empties the queue
- removeDequeueWorkerCallback() // removes dequeueWorker function
                                // which turns off auto-dequeue/async mode