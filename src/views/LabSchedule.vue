<template>
  <div v-loading="btnLoading" element-loading-text="正在生成...">
    <el-row :gutter="20">
      <el-col :span="7">
        <el-card shadow="hover" style="height: 600px;">
          <template #header>
            <div class="clearfix">
              <span>生成课程表</span>
            </div>
          </template>
          <div style="margin-bottom:10px;">
            <h4>默认的生成课程表的参数(所有实验室):</h4>
            <div>周开放预约的星期：<i>{{days.toString()}}</i></div>
            <div>开放预约时段：<i>{{(parids.map(item => item.parid)).toString()}}</i></div>
          </div>
          <div class="info">
            <el-table
              :data="laboratories"
              style="width: 100%"
              height="500"
            >
              <el-table-column property="lab_name" label="实验室名称" />

              <el-table-column property="lab_location" label="实验室位置" />

              <!-- show-overflow-tooltip: 当内容过长被隐藏时显示 tooltip -->
              <!-- <el-table-column label="操作" show-overflow-tooltip /> -->
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button
                    size="small"
                    type="primary"
                    @click="generateSchedule(scope.row)"
                    v-if="!scope.row.sche_existed"
                  >
                    生成课表
                  </el-button>
                  <el-button size="small" type="success" v-else>已生成</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="17">
        <el-card shadow="hover" style="height: 600px;">
          <template #header>
            <div class="clearfix">
              <span>课程表信息查看</span>
            </div>
          </template>
          <el-row>
            <el-col :span="5">
              <h4 class="mb-2">实验室</h4>
              <!-- router: 是否启用vue-router模式。启用该模式会在激活导航时以 index 作为path进行路由跳转 -->
              <!-- unique-opened: 是否只保持一个子菜单的展开 -->
              <!-- collapse: 是否水平折叠收起菜单（仅在 mode 为 vertical 时可用） -->
              <!-- default-active: 默认激活菜单的 index -->
              <el-menu
                class="sidebar-el-menu"
                :default-active="String(form.lab_id)"
                background-color="#F5F7FA"
                text-color="#242F42"
                active-text-color="#20a0ff"
                style="height: 95%;overflow-y: scroll;margin-top: 10px;"
                unique-opened
              >
                <el-menu-item
                  v-for="item in laboratories"
                  :index="String(item.id)"
                  :key="item.id"
                  @click="changeLab(item.id)"
                  style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;"
                  :title="item.lab_location"
                >
                  <template #title>{{item.lab_name}}({{item.lab_location}})</template>
                </el-menu-item>
              </el-menu>
            </el-col>

            <el-col :span="19" style="padding: 0 10px;">
              <div style="margin-bottom:10px; display:flex; justify-content:space-between;">
                <span>
                  第
                  <el-select
                    style="width: 70px"
                    v-model="form.week"
                    placeholder="请选择..."
                    @change="handleWeekChange"
                    size="small"
                  >
                    <el-option
                      v-for="num in weeks"
                      :label="num"
                      :value="num"
                    />
                  </el-select>
                  周
                </span>

                <span>
                  第<i>{{form.week}}</i>周，日期：<i>{{weekDate.weekStartDateStr}}~{{weekDate.weekEndDateStr}}</i>
                </span>
              </div>
              <el-table
                :data="activeSchedule"
                style="width: 100%"
                height="450"
                border
                :span-method="objectSpanMethod"
              >
                <el-table-column prop="day" label="星期" />
                <el-table-column prop="parid" label="时段" />
                <el-table-column prop="start_time" label="开始时间" />
                <el-table-column label="状态" >
                  <template #default="scope">
                    <span v-if="scope.row.is_fulled" style="color: red;font-weight: bold;">已满</span>
                    <span v-else style="color: #85CE61;font-weight: bold;">
                      可预约({{scope.row.remaining_seats}}/{{activeLab.lab_seating}})
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" >
                  <template #default="scope">
                    <el-button
                      size="small"
                      type="danger"
                      @click="makeAdminAppoint(scope.row)"
                      v-if="scope.row.remaining_seats===activeLab.lab_seating"
                    >
                      手动预约
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      disabled
                      v-else
                    >
                      手动预约
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogFormVisible" title="管理员手动预约" center>
      <div style="margin-bottom: 20px;font-size: 16px;">
        手动预约为管理员提供了主动预约的能力，这适用于为有需要的教师提前安排实验课。<b>该操作默认为班级预约，且会影响课表的可预约数！</b>
      </div>
      <el-form :model="appointForm">
        <el-form-item label="预约说明：">
          <el-input v-model="appointForm.appoint_reason" type="textarea" :rows="4" placeholder="请输入预约的教师、班级及原因等..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button size="small" @click="dialogFormVisible = false">取消</el-button>
          <el-button size="small" type="primary" @click="submitAppointForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from "element-plus";
import { onMounted, ref } from "vue";
import axios from "../api/request";
import { dateCalc, getCurrentWeek } from '../utils/timeCalculator';

const laboratories = ref([]);// 所有实验室
const sysVar = ref({});// 所有系统变量
const weekDate = ref({});

const btnLoading = ref(false);

const start_week = ref(3);
const weeks = ref([]);

const updateWeeks = (open_date, week_number) => {
  start_week.value = getCurrentWeek(open_date) + 1;
  let arr = [];
  for(let i=start_week.value; i<=week_number; i++) {
    arr.push(i);
  }
  weeks.value = arr;
}

// 默认的生成课程表的参数,周数20
const days = ['一', '二', '三', '四', '五'];
const parids = [
  { parid: '上午1~2节', start_time: '08:00'},
  { parid: '上午3~5节', start_time: '09:50'},
  { parid: '下午6~7节', start_time: '14:30'},
  { parid: '下午8~9节', start_time: '16:10'}
]

const form = ref({});// 用于查询课程表的表单数据
const activeSchedule = ref([]);// 当前被查询的课表数据
const activeLab = ref({});// 当前选中实验室

// 更新当前选中的实验室
const updateActiveLab = () => {
  activeLab.value = laboratories.value.find(item => {
    return item.id === form.value.lab_id;
  })
}

// 查询所有实验室
const getLaboratories = async () => {
  sysVar.value = await axios.get('/sys-var/findAll');
  updateWeeks(sysVar.value.open_date, sysVar.value.week_number);
  weekDate.value = dateCalc(sysVar.value.open_date, start_week.value);// 获取给定周数的起止日期

  laboratories.value = await axios.get('/laboratories/findAll');
  const lab_id = laboratories.value[0] ? laboratories.value[0].id : 0;
  form.value = { lab_id, week: start_week.value };
  findByLabidAndWeek();
  updateActiveLab();
}

// 根据实验室id及周次查询课程表
const findByLabidAndWeek = async () => {
  if(!form.value.lab_id) {
    activeSchedule.value = [];
  }
  else {
    activeSchedule.value = await axios.get('/schedule/findByLabidAndWeek', {
      params: {
        lab_id: form.value.lab_id,
        week: form.value.week
      }
    });
  }
}

// 合并行
const objectSpanMethod = ({row, column, rowIndex, columnIndex}) => {
  if (columnIndex === 0) {
    if (rowIndex % parids.length === 0) {
      return {
        rowspan: parids.length,
        colspan: 1,
      }
    }
    else {
      return {
        rowspan: 0,
        colspan: 0,
      }
    }
  }
}

onMounted(() => {
  getLaboratories();
  // getSysVar();
});

// 生成课表，id为实验室id
function generateSchedule({id, lab_seating}) {
  // 根据实验室id、实验室座位数(作为剩余可预约数的默认值)等生成相应课表
  btnLoading.value = true;
  const dataArr = [];
  for(let i=3; i<=sysVar.value.week_number; i++) {
    for(let j=0; j<days.length; j++) {
      for(let k=0; k<parids.length; k++) {
        dataArr.push(`(${id}, ${i}, '${days[j]}', '${parids[k].parid}', '${parids[k].start_time}', ${lab_seating})`);
      }
    }
  }
  const dataString = dataArr.toString();
  axios.post('/schedule/insertSchedule', {
    dataString
  })
  .then (res => {
    axios.patch('/laboratories/updateScheExisted', {
      id
    })
    .then(res => {
      getLaboratories();// 更新实验室课表存在状态
      ElMessage.success(res);
      btnLoading.value = false;
    })
  })
}

// 切换显示课程表的实验室时
const changeLab = (lab_id) => {
  const week = start_week.value;
  form.value = {lab_id, week};
  findByLabidAndWeek();
  updateActiveLab();
  weekDate.value = dateCalc(sysVar.value.open_date, week);// 获取给定周数的起止日期
}

// 当选择的周数改变时
const handleWeekChange = (currentWeek) => {
  form.value.week = currentWeek;
  findByLabidAndWeek();
  weekDate.value = dateCalc(sysVar.value.open_date, currentWeek);// 获取给定周数的起止日期
}

const appointForm = ref({
  appoint_reason: '',
  lab_seating: 0,
  sche_id: {},
})
const dialogFormVisible = ref(false);
// 管理员手动预约
const makeAdminAppoint = ({sche_id, remaining_seats}) => {
  dialogFormVisible.value = true;
  appointForm.value.sche_id = sche_id;
  appointForm.value.lab_seating = remaining_seats;
}
// 确定预约
const submitAppointForm = () => {
  if(!appointForm.value.appoint_reason) {
    ElMessage.warning('请输入预约说明！');
    return;
  }
  ElMessageBox.confirm('你确定进行此操作吗?', '提示',{
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  .then(() => {
    // 确定
    axios.post('/schedule/makeClassAppoint', {
      ...appointForm.value
    })
    .then(res => {
      if(res.code===200) {
        ElMessage.success(res.msg);
        findByLabidAndWeek();
      }
      dialogFormVisible.value = false;
    })
  })
  .catch(() => {
    ElMessage.info('已取消');
  })
}
</script>

<style lang="less" scoped>

</style>