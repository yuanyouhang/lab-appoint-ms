<template>
  <div>
    <el-row :gutter="20">

      <el-col :span="12">
        <el-card shadow="hover" style="min-height: 400px;">
          <template #header>
            <div class="clearfix">
              <i class="el-icon-lx-warn" color="red"></i><span>系统参数设置</span>
            </div>
          </template>
          <div class="info">
            <el-form :model="sysVars" label-width="140px">
              <el-form-item label="最小提前预约周数：">
                <span class="sysVar">{{ sysVars.min_pre_appoint }}</span>
              </el-form-item>

              <el-form-item label="开学日期：">
                <span class="sysVar" v-show="!isWritable">{{ sysVars.open_date }}</span>
                <span v-show="isWritable">
                  <el-date-picker v-model="form.open_date" type="date" placeholder="请选择..." />
                </span>
              </el-form-item>

              <el-form-item label="最大提前预约周数：">
                <span class="sysVar" v-show="!isWritable">{{ sysVars.max_pre_appoint }}</span>
                <el-select v-show="isWritable" v-model="form.max_pre_appoint" placeholder="请选择...">
                  <el-option
                    v-for="num in [3, 10, 20]"
                    :label="num"
                    :value="num"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="用户违约次数上限：">
                <span class="sysVar" v-show="!isWritable">{{ sysVars.break_promise_limit }}</span>
                <el-select v-show="isWritable" v-model="form.break_promise_limit" placeholder="请选择...">
                  <el-option
                    v-for="num in [3, 4, 5]"
                    :label="num"
                    :value="num"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="预约开放时间：">
                <el-col :span="11">
                  <span class="sysVar" v-show="!isWritable">{{ sysVars.appoint_open_time }}</span>
                  <span v-show="isWritable">
                    <el-time-picker
                      v-model="form.appoint_open_time"
                      placeholder="请选择..."
                      style="width: 100%"
                    />
                  </span>
                </el-col>

                <el-col :span="2" class="text-center">
                  <span class="text-gray-500">-</span>
                </el-col>

                <el-col :span="11">
                  <span class="sysVar" v-show="!isWritable">{{ sysVars.appoint_close_time }}</span>
                  <span v-show="isWritable">
                    <el-time-picker
                      v-model="form.appoint_close_time"
                      placeholder="请选择..."
                      style="width: 100%"
                    />
                  </span>
                </el-col>
              </el-form-item>
            </el-form>

            <div>
              <el-button type="warning" size="small" @click="isWritable = !isWritable" v-if="isWritable">取消设置</el-button>
              <el-button type="primary" size="small" @click="isWritable = !isWritable" v-else>设置</el-button>
              <el-button type="primary" size="small" @click="submit" v-show="isWritable">提交</el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" style="min-height: 400px;">
          <template #header>
            <div class="clearfix">
              <i class="el-icon-lx-warn" color="red"></i><span>重置课程表</span>
            </div>
          </template>

          <div>
            <div>当<b>新学期开始</b>时，您可进行重置课程表操作，以更新各实验室各时段的可预约数为默认值。</div>
            <div class="tip">温馨提示：该操作会影响用户的预约，请谨慎操作！</div>
          </div>

          <div>
            <el-button type="danger" size="small" @click="openBox">重置</el-button>
          </div>
        </el-card>
      </el-col>

    </el-row>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue';
import axios from '../api/request'
const form = ref({
  open_date: '',
  max_pre_appoint: 3,
  break_promise_limit: 3,
  appoint_open_time: '',
  appoint_close_time: '',
})

const sysVars = ref({});
const laboratories = ref([]);

const isWritable = ref(false);

// 重置课程表
const resetSche = () => {
  const arr = laboratories.value.map(item => {
    return {
      lab_id: item.id,
      seating: item.lab_seating
    }
  })
  for(let i=0;i<arr.length;i++) {
    axios.post('/schedule/resetSchedule', {
      lab_id: arr[i].lab_id,
      seating: arr[i].seating
    })
    if(i===arr.length-1) {
      ElMessage.success('操作成功！');
    }
  }
}
// 弹出确认框
const openBox = () => {
  ElMessageBox.confirm(
    '你确定重置所有课程表信息?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      resetSche();
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '已取消',
      })
    })
}

const getSysVars = () => {
  axios.get('/sys-var/findAll')
  .then(res => {
    sysVars.value = { ...res };
  })
}

const getLaboratories = async () => {
  laboratories.value = await axios.get("/laboratories/findAll");
};

onMounted(() => {
  getSysVars();
  getLaboratories();
});

const submit = () => {
  if(!form.value.open_date || !form.value.appoint_open_time || !form.value.appoint_close_time) {
    ElMessage.error('所有字段不能为空！');
  }
  else{
      ElMessageBox.confirm(
        '你确定提交系统参数设置?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          axios.post('/sys-var/updateVar', {
            ...form.value,
            appoint_open_time: form.value.appoint_open_time.toLocaleTimeString(),
            appoint_close_time: form.value.appoint_close_time.toLocaleTimeString(),
            open_date: form.value.open_date.toLocaleString()
          })
          .then(res => {
            ElMessage.success(res);
            getSysVars();
            isWritable.value = false;
          })
        })
        .catch(() => {
          ElMessage({
            type: 'info',
            message: '已取消',
          })
        })
  }
}

</script>

<style lang="less" scoped>
.sysVar {
  color: red;
  font-size: 18px;
}

.tip {
  margin: 10px auto;
  font-size: 13px;
  color: red;
}
</style>