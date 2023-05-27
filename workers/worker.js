const queue = require('../queues/queue');
const pancakeServices = require("../services/pancake.services");


queue.process(function(job, done) {
  console.log('Processing job:', job.data);

  // Thực hiện xử lý công việc từ hàng đợi
  // Các đoạn mã xử lý công việc trong hookCustomer sẽ được đặt ở đây

    
  done();
});