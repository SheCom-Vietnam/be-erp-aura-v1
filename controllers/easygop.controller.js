const {routes,headers} = require('../utils/easygop');
const axios = require('axios');
const supabase = require('../config/supabase');

const CircularJSON = require('circular-json');
class EasygopController{
     acquireNewUser =  async (req,res) => {
          try{
               let userInfo = req.body;
               userInfo = CircularJSON.stringify(userInfo);
               console.log(userInfo);
               let result = await axios.post(
                    routes.acquireUser,
                    CircularJSON.parse(userInfo),
                    {
                         headers: headers
                    }
               );
               res.status(200).json(result.data);
          } catch(e) {
               console.log(e);
          }
     }
}

module.exports = new EasygopController();