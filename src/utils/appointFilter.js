import { getDateByWeekAndDay } from './timeCalculator'

function appointFilter(data, open_date) {
  const appointDateArr = [];
  const validAppointArr = [];
  const now = new Date().getTime();
  data.forEach(item => {
    const id = item.id;
    const date = getDateByWeekAndDay(open_date, item.week, item.day);
    const timeStr = date + ' ' + item.start_time;
    const timeStamp = new Date(timeStr).getTime();
    appointDateArr.push({id, date, timeStamp});
  })

  const expiredIds = [];
  const apDateLen = appointDateArr.length;
  for(let i=0;i<apDateLen;i++) {
    if(appointDateArr[i].timeStamp-now<=0) {
      // 已过期
      expiredIds.push(appointDateArr[i].id);
    }
  }
  data.forEach(item => {
    if(!expiredIds.includes(item.id)) {
      validAppointArr.push(item);
    }
  })
  return {
    validAppointArr
  }
}

export default appointFilter;