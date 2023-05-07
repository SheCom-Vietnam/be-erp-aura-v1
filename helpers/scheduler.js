const schedule = require('node-schedule');
const axios = require("axios");

const AURAATTENDANCEBOT = {
  appId:"cli_a4987ffe8e78d010",
  appSecret:"fb6T4NaJ4FFN88IUIlYw6cFsCoLiOuqP"
}

const ChatID = "oc_9ac737739d7c7fcd10e0c7721ce4211a"

const listMail = 
    [
    "tai.ncx.aura@gmail.com",
    "ly.nt.aura@gmail.com",
    "nhi.pta.aura@gmail.com",
    "truonghuyvungoc@gmail.com",
    "giang.lnb.aura@gmail.com",
    "sang.ttk.aura@gmail.com",
    "nguyet.nt.aura@gmail.com"
    ]

const tenantTokenAppBot = async () => {
  try {
    const { appId, appSecret } = AURAATTENDANCEBOT;
    const data = { app_id: appId, app_secret: appSecret };
    const config = { method: "POST", url: "https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal", headers: { "Content-Type": "application/json" }, data };
    const { data: { tenant_access_token } } = await axios(config);
    return tenant_access_token;
  } catch (error) {
    throw new Error(error.message);
  }
};

const getUserIDsFromMail = (emails, token) => {
  if (emails.length === 0 && !token) return [];
    
  const data = JSON.stringify({ emails });
  const config = {
    method: "POST",
    url: "https://open.larksuite.com/open-apis/contact/v3/users/batch_get_id?user_id_type=user_id",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data,
  };

  return axios(config)
    .then((response) => {
      if (response && response.data && response.data.data && response.data.data.user_list) {
        return response.data.data.user_list.map((item) => item.user_id);
      } else {
        return [];
      }
    })
    .catch((error) => {
      console.log(error);
      return [];
    });
};


function getDateNowFormat() {
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); 
    const yyyy = today.getFullYear();

    today = yyyy+mm+dd;
    return today
}

function getDateNowFormat2() {
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); 
    const yyyy = today.getFullYear();

    today = dd + '-' + mm + '-' + yyyy;
    return today
}


const getRecordsAttendanceOfUser = async (token, listMail, date) => {
  try {
    const userIDs = await getUserIDsFromMail(listMail, token);
    if (!userIDs.length) return null;
    
    const data = JSON.stringify({
      user_ids: userIDs,
      check_date_from: date,
      check_date_to: date
    });

    const config = {
      method: 'POST',
      url: 'https://open.larksuite.com/open-apis/attendance/v1/user_tasks/query?employee_type=employee_id',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      data: data
    };

    const response = await axios(config);
    return response?.data?.data?.user_task_results ?? null;
  } catch (error) {
    console.error(error);
    return null;
  }
};


const createMessage = (data) => {
    const { listNameLate, listNameLack } = data.reduce((result, item) => {
        if (item.records[0].check_in_result === "Late") {
            result.listNameLate.push(item.employee_name);
        } else if (item.records[0].check_in_result === "Lack") {
            result.listNameLack.push(item.employee_name);
        }
        return result;
    }, { listNameLate: [], listNameLack: [] });

    return { late: listNameLate, lack: listNameLack };
};

const sendMess = async () => {
    let _date1 = getDateNowFormat()
    let _date2 = getDateNowFormat2()
    const _token = await tenantTokenAppBot()

    console.log(_token)
    let messs = await getRecordsAttendanceOfUser(_token,listMail,_date1)
    
    let _listName= createMessage(messs)
    
    let _listNameLate =_listName.late
    let _listNameLack = _listName.lack
    
  const a ={
    "msg_type": "post",
    "content": {
        "post": {
            "en_us": {
                "title": "Attendances",
                "content": [
            [
                {
                    tag: "text",
                    text: `🗓 Danh sách đi trễ ngày ${_date2}:`,
                },
            ],
            [
                {
                    tag: "text",
                    text: `${_listNameLate.length>0  ?"      "+ _listNameLate : "      Không có ai đi trễ"}`,
                },
            ],
            [
              {
                tag: "text",
                text: "",
              },
            ],
            [
                {
                    tag: "text",
                    text: `🗓 Danh sách vắng ${_date2}:`,
                },
            ],
            [
                {
                    tag: "text",
                    text: `${_listNameLack.length>0  ?"      "+ _listNameLack : "      Không có ai vắng"}`,
                },
            ]
                ]
            }
        }
    }
}  
  
  
    // if(!_token) return    
    // const option = {
    //     // url: "https://open.larksuite.com/open-apis/im/v1/messages?receive_id_type=chat_id",
    //     url:"https://open.larksuite.com/open-apis/bot/v2/hook/5e2c737a-aee3-4d0c-a1dc-7d4dc419b486",
    //     method: "POST",
    //     data: {
    //       receive_id: ChatID,
    //       content: JSON.stringify(a),
    //       msg_type: "post",
    //     },
    //     headers: {
    //       Authorization: `Bearer ${_token}`,
    //     },
    // }
    // await axios(option);
  
  const response = await axios.post(
  'https://open.larksuite.com/open-apis/bot/v2/hook/5e2c737a-aee3-4d0c-a1dc-7d4dc419b486',
  a,
  {
    headers: {
      'Content-Type': 'application/json'
    }
  }
  );
  console.log(response)
}


//RUN SEND 12h
async function runSchedule() {
  try {
    schedule.scheduleJob('0 12 * * *', async () => {
   await sendMess();
});
  } catch (error) {
    console.error('Lỗi khi đặt lịch trình:', error);
  }
}


module.exports = {
    runSchedule,
};
