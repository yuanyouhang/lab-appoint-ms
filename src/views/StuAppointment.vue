<template>
  <div>
    <el-card shadow="hover" style="min-height: 600px;">
      <template #header>
        <div class="clearfix">
          <span>学生预约信息表(有效预约)</span>
        </div>
      </template>
      <div class="info">
        <el-table
          :data="stuAppointData"
          style="width: 100%"
          height="420"
          border
        >
          <el-table-column property="stu_id" label="学号" />
          <el-table-column property="stu_name" label="姓名" />
          <el-table-column property="stu_class" label="班级" />
          <el-table-column property="college" label="学院" />
          <el-table-column property="phone_number" label="手机号码" />
          <el-table-column label="已预约实验室">
            <template #default="scope">
              {{scope.row.lab_name}}({{scope.row.lab_location}})
            </template>
          </el-table-column>
          <el-table-column label="预约日期">
            <template #default="scope">
              第{{scope.row.week}}周星期{{scope.row.day}}{{scope.row.parid}}
            </template>
          </el-table-column>
          <el-table-column property="appoint_reason" label="预约说明" width="250" />
          <!-- <el-table-column label="是否已签到">
            <template #default="scope">
              <span v-if="scope.row.is_signed === 0">否</span>
              <span v-else>已签到</span>
            </template>
          </el-table-column> -->
          <el-table-column property="appoint_stat" label="状态" />
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <span v-if="scope.row.appoint_stat === '未处理'">
                <el-button
                  size="small"
                  type="primary"
                  @click="agreeAppointment(scope.row)"
                >
                  同意
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click="refuseAppointment(scope.row)"
                >
                  拒绝
                </el-button>
              </span>
              <el-button size="small" type="success" v-else-if="scope.row.appoint_stat === '已同意'">已同意</el-button>
              <el-button size="small" type="info" v-else-if="scope.row.appoint_stat === '已拒绝'">已拒绝</el-button>
              <el-button size="small" type="info" v-else>用户已取消</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="text-align:right;padding:20px;">
          <el-button type="primary" @click="agreeAllAppoint">一键同意</el-button>
        </div>
      </div>
    </el-card>

    <!-- 拒绝预约申请时的弹出框 -->
    <el-dialog v-model="dialogFormVisible" :title="`拒绝${form.stu_name}的预约申请`" center>
      <el-form :model="form">
        <el-form-item label="原因：">
          <el-input v-model="form.reason" type="textarea" :rows="4" placeholder="请输入拒绝的原因..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button size="small" @click="dialogFormVisible = false">取消</el-button>
          <el-button size="small" type="primary" @click="submitRefuseReason">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from "element-plus";
import { ref, onMounted } from "vue";
import axios from '../api/request';
import { getDateByWeekAndDay } from '../utils/timeCalculator'
import appointFilter from '../utils/appointFilter'


const stuAppointData = ref([]);
const dialogFormVisible = ref(false);
const form = ref({
  reason: '',
  id: 0,
  stu_name: '',
});

const sysVar = ref({});

// 获取系统参数
// const getSysVar = async () => {
  
// }

// 查询所有学生预约信息
const findStuAppoint = async () => {
  sysVar.value = await axios.get('/sys-var/findAll');
  const open_date = sysVar.value.open_date;
  const data = await axios.get('/appointment/findStuAppoint');
  stuAppointData.value = appointFilter(data, open_date).validAppointArr;// 未过期的预约
}

// 生成消息内容
const generateMsg = (lab_name, lab_location, week, day, parid, start_time, reason) => {
  const appoint_date = getDateByWeekAndDay(sysVar.value.open_date, week, day);
  const successMsgContent = 
  `
  您预约的实验室：${lab_name}(${lab_location})
  预约时间：第${week}周星期${day}(${appoint_date})${parid}(${start_time})
  已被管理员同意,请提前做好相关实验准备！`;

  const failMsgContent = 
  `
  您预约的实验室：${lab_name}(${lab_location})
  预约时间：第${week}周星期${day}(${appoint_date})${parid}(${start_time})
  已被管理员拒绝
  拒绝原因：${reason}
  如有任何疑问请联系管理员！`;
  return {
    successMsgContent,
    failMsgContent,
  };
}

// 同意预约
const agreeAppointment = ({id, user_id, lab_name, lab_location, week, day, parid, start_time}) => {
  axios.post('/appointment/agreeStuAppoint', {
    id
  })
  .then(res => {
    ElMessage.success(res);
    findStuAppoint();// 更新页面数据
    // 添加预约成功消息到用户消息记录。
    const user_type = 'student';
    const pub_datetime = new Date().toLocaleString();
    const content = generateMsg(lab_name, lab_location, week, day, parid, start_time).successMsgContent;
    axios.post('/message/insertUserMsg', {
      content,
      pub_datetime,
      user_type,
      user_id
    })
  })
}

// 同意全部未处理预约
const agreeAllAppoint = () => {
  // 获取当前表格数据数组中未处理的所有预约
  const unhandleAppoints = stuAppointData.value.filter(item => item.appoint_stat === '未处理');
  const idArr = unhandleAppoints.map(item => item.id);
  // 添加消息记录所需的数据数组
  const dataArr = unhandleAppoints.map(item => {
    const {user_id, lab_name, lab_location, week, day, parid, start_time} = item;
    return {user_id, lab_name, lab_location, week, day, parid, start_time};
  })

  if(idArr.length === 0) {
    ElMessage.info('当前没有任何未处理预约！');
  }
  else {
    ElMessageBox.confirm('你确定同意全部未处理预约吗?', '提示',{
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    .then(() => {
      // 确定
      axios.post('/appointment/agreeAllStuAppoint', {
        idArr
      })
      .then(res => {
        ElMessage.success(res);
        findStuAppoint();// 更新页面数据

        // 给每个已预约的用户发送预约成功消息。
        const user_type = 'student';
        const pub_datetime = new Date().toLocaleString();
        let msgArr = [];// 对应数据字符串的数组
        dataArr.forEach(item => {
          const content = generateMsg(item.lab_name, item.lab_location, item.week, item.day, item.parid, item.start_time).successMsgContent;
          msgArr.push(`('${content}', '${pub_datetime}', '${user_type}', ${item.user_id})`)
        })
        // 待发送给后端的数据字符串
        const dataString = msgArr.toString();
        axios.post('/message/insertMultiUserMsg', {
          dataString
        })
      })
    })
    .catch(() => {
      ElMessage.info('已取消');
    })
  }
}

// 拒绝预约
const refuseAppointment = ({id, stu_name}) => {
  form.value.id = id;
  form.value.stu_name = stu_name;
  dialogFormVisible.value = true;
}

// 输入拒绝原因并确定
const submitRefuseReason = () => {
  if(!form.value.reason) {
    ElMessage.error('请输入原因！');
  }
  else {
    axios.post('/appointment/refuseStuAppoint', {
      id: form.value.id,
    })
    .then(res => {
      findStuAppoint();// 更新页面数据
      ElMessage.success(res);
      dialogFormVisible.value = false;
      // 添加预约失败信息到消息记录。
      const user_type = 'student';
      const pub_datetime = new Date().toLocaleString();
      const {lab_name, lab_location, week, day, parid, start_time, user_id} = stuAppointData.value.find(item => item.id === form.value.id);
      const content = generateMsg(lab_name, lab_location, week, day, parid, start_time, form.value.reason).failMsgContent;
      axios.post('/message/insertUserMsg', {
        content,
        pub_datetime,
        user_type,
        user_id
      })
    })
  }
}

onMounted(() => {
  findStuAppoint();
  // getSysVar();
});
</script>

<style lang="less" scoped>

</style>