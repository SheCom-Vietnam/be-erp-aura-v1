const axios = require('axios');
const supabase = require('../config/supabase');

const getWebhookBotLark = async (clinic_id) => {
  try {
    const { data, error } = await supabase
      .from('bot_lark')
      .select('*')
      .eq('clinic_id', clinic_id);
    if (error) {
      return null;
    } else if (data.length > 0) {
      return data[0].webhook_url;
    }
  } catch (err) {
    throw new Error(err);
  }
};
const getGroupByWebhook = async (webhookUrl) => {
  try {
    const { data, error } = await supabase
      .from('bot_lark')
      .select('*')
      .eq('webhook_url', webhookUrl);
    if (error) {
      return null;
    } else if (data.length > 0) {
      return data[0].group;
    }
  } catch (err) {
    throw new Error(err);
  }
};

const isExistWebhookUrl = async (webhookUrl) => {
  const { data, error } = await supabase
    .from('bot_lark')
    .select('*')
    .eq('webhook_url', webhookUrl);
  if (data[0] == null) {
    return true;
  } else {
    return false;
  }
};

module.exports = { getWebhookBotLark, isExistWebhookUrl, getGroupByWebhook };
