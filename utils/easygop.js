const token = "SE3#aNMrJYjihagzecTK";
const host = "https://api.staging.easygop.com/api/v1/deep-partner";
module.exports = {
     routes: {
          acquireUser: `${host}/request/user`,
     },
     headers:{
          'Authorization' : `Bearer ${token}`,
          'Content-Type': 'application/json',
     },
}