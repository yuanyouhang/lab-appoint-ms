<template>
  <div>
    <el-card shadow="hover" style="min-height: 600px;">
      <template #header>
        <div class="clearfix">
          <span>管理员手动预约信息表</span>
        </div>
      </template>
      <div class="info">
        <el-table
          :data="adminAppointData"
          style="width: 100%"
          height="450"
          border
        >
          <el-table-column type="index" width="50" />

          <el-table-column label="已预约实验室" width="200">
            <template #default="scope">
              {{scope.row.lab_name}}({{scope.row.lab_location}})
            </template>
          </el-table-column>

          <el-table-column label="预约日期" width="200">
            <template #default="scope">
              第{{scope.row.week}}周星期{{scope.row.day}}{{scope.row.parid}}
            </template>
          </el-table-column>

          <el-table-column property="appoint_reason" label="预约说明" />

          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button
                size="small"
                type="danger"
                @click="cancelAppointment(scope.row)"
              >
                取消
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import axios from "../api/request";

const adminAppointData = ref([]);

const getAppointData = async () => {
  adminAppointData.value = await axios.get('/schedule/findAdminAppoint');
}

onMounted(() => {
  getAppointData();
})

// 取消手动预约
const cancelAppointment = ({id, sche_id, lab_seating}) => {
  ElMessageBox.confirm('你确定取消该预约吗?', '提示',{
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  .then(() => {
    // 确定
    axios.post('/schedule/cancelClassAppoint', {
      id,
      sche_id,
      remaining_seats: lab_seating
    })
    .then(res => {
      if(res.code===200) {
        getAppointData();
        ElMessage.success(res.msg);
      }
    })
  })
  .catch(() => {
    ElMessage.info('已取消');
  })
}
</script>

<style lang="less" scoped>

</style>