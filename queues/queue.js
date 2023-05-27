const Queue = require('bee-queue');

const options = {
  isWorker: false, // Không cần worker
  redis: {
    removeOnSuccess: true, // Gỡ bỏ công việc khi hoàn thành
  },
};

const queue = new Queue('myQueue', options);

module.exports = queue;