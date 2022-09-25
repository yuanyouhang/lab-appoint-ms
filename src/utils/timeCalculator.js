
// 根据开始日期和周次计算结果日期范围
const dateCalc = (startDateStr, week_number) => {
  const datetime = new Date(startDateStr);
  const days = (week_number - 2) * 7 + (8-datetime.getDay());
  const milliseconds1 = days * 24 * 60 * 60 * 1000;
  const milliseconds2 = (days + 6) * 24 * 60 * 60 * 1000;
  const weekStartDateStr = (new Date(datetime.getTime() + milliseconds1)).toLocaleDateString();
  const weekEndDateStr = (new Date(datetime.getTime() + milliseconds2)).toLocaleDateString();
  return {
    weekStartDateStr,
    weekEndDateStr
  }
}


// 根据开始日期和周次、星期计算结果日期
const getDateByWeekAndDay = (startDateStr, week_number, day) => {
  let day_number;
  switch (day) {
    case '一':
      day_number = 1;
      break;
    case '二':
      day_number = 2;
      break;
    case '三':
      day_number = 3;
      break;
    case '四':
      day_number = 4;
      break;
    case '五':
      day_number = 5;
      break;
    default:
      break;
  }
  const datetime = new Date(startDateStr);
  const days = (week_number - 2) * 7 + (8-datetime.getDay()) + (day_number-1);
  const milliseconds = days * 24 * 60 * 60 * 1000;
  const resultDateStr = (new Date(datetime.getTime() + milliseconds)).toLocaleDateString();
  return resultDateStr;
}

// 根据开学日期计算当前周数
const getCurrentWeek = (open_date) => {
  const open_datetime_str = open_date;// 开学日期字符串
  const now = new Date().getTime();
  const open_datetime = new Date(open_datetime_str).getTime();
  const current_week = Math.floor(((now - open_datetime) / (1000*60*60*24*7)) + 1);
  return current_week;
}


export {
  dateCalc,
  getDateByWeekAndDay,
  getCurrentWeek,
}