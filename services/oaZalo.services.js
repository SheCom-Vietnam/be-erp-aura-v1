const axios = require('axios');
const supabase = require("../config/supabase");
const moment = require('moment')

let oaSendMessage = async (access,zaloId,message) => {
        try {
           await axios.post(`https://openapi.zalo.me/v2.0/oa/message`,
        {
          'recipient': {
            'user_id': zaloId
          },
          'message': {
            'text': message
          }
        }
        ,
        {
          headers: {
            'Content-Type': 'application/json',
            'access_token': access
          }
        }
      )
        }
        catch (e) {  throw new Error(message) }
}

const  checkTimeOaToken = (time) => {
    let flag = true
    const _time = moment(time).startOf().fromNow();
    let timeAgo = parseInt(_time.split(" ")[0]);
    if (timeAgo > 24) flag = false
    return flag
}

const getTokenOnDb = async () => {
        try {
       let { data: oa_token } = await supabase
      .from('oa_token')
      .select('*')
      .single()
            if (oa_token) {
               return oa_token
    }
        }
        catch (e) { throw new Error(message) }
}

const reNewOaToken = async (refreshToken) => {
        try {
          const res = await axios.post(`https://oauth.zaloapp.com/v4/oa/access_token?refresh_token=${refreshToken}&app_id=1145209093077346322&grant_type=refresh_token`, {},
        {
          headers: {
            secret_key: 'n3MMGIN5VSpzR19B3qsN',
          }
        }
          )
    if (res) {
      let  token = {access_token: res.data.access_token, refresh_token: res.data.refresh_token }
        return token
    }
    }
        catch (e) { throw new Error(message) }
}


const updateNewOaTokenOnDb = async (token) => {
        try {
        const { data, error } = await supabase
        .from('oa_token')
        .update({
          access_token: token.access_token,
          refresh_token: token.refresh_token,
          time: new Date()
        })
         .eq('id', token.id)
      console.log('updateNewOaTokenOnDb',data, error)
        }
        catch (e) { throw new Error(message) }
}
  
  
module.exports = {
    checkTimeOaToken,
    oaSendMessage,
    getTokenOnDb,
    reNewOaToken,
    updateNewOaTokenOnDb
}