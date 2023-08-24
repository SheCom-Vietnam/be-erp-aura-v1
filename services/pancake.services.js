const handleHook = async (data) => {
  const { account, custom_fields } = data;
  const io = res.io;
  const optionsUser = {
    name: account?.account_name.trim(),
    avatar: custom_fields?.psid && custom_fields?.page_id ? `https://pancake.vn/api/v1/pages/${custom_fields?.page_id}/avatar/${custom_fields?.psid}` : null,
    phone: account?.phone_office ? account.phone_office.trim() : null,
    phone_update_date: account?.phone_office ? new Date(Date.now()) : null,
    id: account?.sic_code.trim(),
    customer_resource: custom_fields.pancake_ticket_name,
    gender: account?.gender && account?.gender == 1 ? "female" : "male",
    service_staff: process.env.PANCAKE_SERVICE_STAFF_DEFAULT, //Vũ Ngọc Trường HUy
    status: process.env.PANCAKE_STATUS_DEFAULT, //Mới
    live_chat: null,
    clinic: null,
  };

  if (CLINICS.includes(custom_fields.pancake_locale_tag)) {
    optionsUser.clinic = null;
    optionsUser.live_chat = custom_fields.pancake_assign_tag;
  } else {
    optionsUser.clinic = null;
    optionsUser.live_chat = custom_fields.pancake_locale_tag;
  }

  if (
    !CLINICS.includes(custom_fields.pancake_locale_tag) &&
    !CLINICS.includes(custom_fields.pancake_assign_tag)
  ) {
    optionsUser.live_chat = custom_fields.pancake_locale_tag;
    optionsUser.clinic = null;
  }
  if (
    CLINICS.includes(custom_fields.pancake_locale_tag) &&
    CLINICS.includes(custom_fields.pancake_assign_tag)
  ) {
    optionsUser.live_chat = null;
    optionsUser.clinic = null;
  }

  let checkHaveUser = false
  let _userInfoForSicCode = null
  let _userInfoForPhone = null

  const { data: userForSicCode } = await supabase //Tìm user theo sic_code
    .from("users")
    .select("id,phone,live_chat,name")
    .eq("id", account.sic_code.trim());

  if (userForSicCode && userForSicCode.length > 0) {
    checkHaveUser = true
    _userInfoForSicCode = userForSicCode
  }

  if (optionsUser.phone !== null) {
    const { data: userForPhone } = await supabase //Tìm user theo phone
      .from("users")
      .select("id,phone,live_chat,name")
      .eq("phone", optionsUser.phone);

    if (userForPhone && userForPhone.length > 0) {
      checkHaveUser = true
      _userInfoForPhone = userForPhone
    }
  }

  if (_userInfoForPhone && _userInfoForSicCode) {
    //Nếu id của 2 record khác nhau thì xoá cái vừa tạo đi
    if ((_userInfoForPhone[0].id !== _userInfoForSicCode[0].id) && (_userInfoForPhone[0].name == _userInfoForSicCode[0].name)) {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", _userInfoForSicCode[0].id);
      if (error) {
        console.log(error)
      }
      _userInfoForSicCode = _userInfoForPhone
    }
  }

  if (!checkHaveUser) {
    //Không có User thì tạo mới user
    const { data: newUser } = await supabase
      .from("users")
      .insert([optionsUser])
      .select("*,status(*),service_staff(*)")
      .single();

    if (newUser) {
      io.emit("pancake_hook", newUser);
    }
    else if (error) {
      console.log(error)
    }
  }

  if (optionsUser.avatar !== null && _userInfoForSicCode[0].avatar !== optionsUser.avatar) {
    //Update avatar for user
    const { data: updatedPhoneUser, error } = await supabase
      .from("users")
      .update([
        {
          avatar: optionsUser.avatar.trim()
        },
      ])
      .eq("id", _userInfoForSicCode[0].id)
      .select("*,status(*),service_staff(*)")
      .single();

    if (error) {
      console.log(error);
    }
    else if (updatedPhoneUser) {
      io.emit("pancake_hook", updatedPhoneUser);
    }
  }

  if (optionsUser.name !== null && _userInfoForSicCode[0].name !== optionsUser.name) {
    //Update avatar for user
    const { data: updatedPhoneUser, error } = await supabase
      .from("users")
      .update([
        {
          name: optionsUser.avatar.trim()
        },
      ])
      .eq("id", _userInfoForSicCode[0].id)
      .select("*,status(*),service_staff(*)")
      .single();

    if (error) {
      console.log(error);
    }
    else if (updatedPhoneUser) {
      io.emit("pancake_hook", updatedPhoneUser);
    }
  }

  if (optionsUser.phone !== null && _userInfoForSicCode[0].phone !== optionsUser.phone) {
    //Update phone for user
    const { data: updatedPhoneUser, error } = await supabase
      .from("users")
      .update([
        {
          phone: optionsUser.phone.trim(),
          phone_update_date: optionsUser.phone_update_date,
        },
      ])
      .eq("id", _userInfoForSicCode[0].id)
      .select("*,status(*),service_staff(*)")
      .single();

    if (error) {
      console.log(error);
    }
    else if (updatedPhoneUser) {
      io.emit("pancake_hook", updatedPhoneUser);
    }
  }

  if (optionsUser.live_chat && _userInfoForSicCode[0].live_chat !== optionsUser.live_chat) {
    //Update live_chat for user
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update([{ live_chat: optionsUser.live_chat }])
      .id("id", account.sic_code)
      .select("*,status(*),service_staff(*)")
      .single();

    if (updatedUser) {
      io.emit("pancake_hook", updatedUser);
    } else if (error) {
      console.log(error);
    }
  }
}

module.exports = {
  handleHook
};