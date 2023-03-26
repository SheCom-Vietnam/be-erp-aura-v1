const axios = require("axios");
const crypto = require('crypto');

const tenantToken = async (appId,appSecret) => {
  try {
     var data = JSON.stringify({
        "app_id": appId,
        "app_secret": appSecret
    });
    var config = {
        method: 'POST',
        url: 'https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal',
        headers: {
            'Content-Type': 'application/json'
        },
        data : data
    };
      const token = await axios(config);
      console.log("================================================")
      console.log(token.data.tenant_access_token)
      console.log("================================================")
      return token.data.tenant_access_token
  } catch (e) {
    throw new Error(message);
  }
};

const getUserIdWithPhoneOrEmail = async (accountName,token) => {
  try {
     let data = JSON.stringify({
  "emails": [
    accountName
  ]
  ,
  "mobiles": [
    accountName
  ]
    });
    
var config = {
  method: 'POST',
  url: 'https://open.larksuite.com/open-apis/contact/v3/users/batch_get_id?user_id_type=user_id',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  data : data
};
    const response = await axios(config)
    
    if (!response.data.data.user_list) return null;
 
    let userList = response.data.data.user_list;
    console.log(response.data.data)

    if (userList[0].hasOwnProperty("user_id")) {
      return userList[0].user_id
    } 
    else if (userList[1].hasOwnProperty("user_id")) {
      return userList[1].user_id
    } 
    else{ return null}
   
  } catch (e) {
    throw new Error(message);
  }
};


// Decrypt function for Encrypt Key
const encryptKey = 'cq9IZUAnMt6mYy77YdOljcNQl6iWS0sp';
// const encryptKey ="P37w+VZImNgPEO1RBhJ6RtKl7n6zymIbEG1pReEzghk="

 class AESCipher {
    constructor(key) {
        const hash = crypto.createHash('sha256');
        hash.update(key);
        this.key = hash.digest();
    }
    decrypt(encrypt) {
        const encryptBuffer = Buffer.from(encrypt, 'base64');
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, encryptBuffer.slice(0, 16));
        let decrypted = decipher.update(encryptBuffer.slice(16).toString('hex'), 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
function unDecrypt(encrypt) {
  const cipher = new AESCipher(encrypt)
  console.log("cipher",cipher)
  console.log("cipher",cipher.decrypt(encryptKey))
    return cipher.decrypt(encryptKey);
}

// Function to handle verification request
async function handleVerificationRequest(reqBody) {
    if (encryptKey) {
          const decryptedBody = JSON.parse(unDecrypt(reqBody.encrypt));
          console.log("decryptedBody",decryptedBody)
        if (decryptedBody.type !== 'url_verification') {
            throw new Error('Invalid verification request');
        }
        return decryptedBody.challenge;
    } else {
        if (reqBody.type !== 'url_verification') {
            throw new Error('Invalid verification request');
        }
        return reqBody.challenge;
    }
}

module.exports = {
  tenantToken,
  getUserIdWithPhoneOrEmail,
  handleVerificationRequest
};