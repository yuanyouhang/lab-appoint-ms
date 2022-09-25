<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          实验室信息表
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <h2>实验室信息表</h2>

      <!-- 实验室信息表格 -->
      <el-table
        :data="laboratories"
        style="width: 100%"
      >
        <!-- <template #default="scope">{{ scope.row.date }}</template> -->

        <el-table-column label="封面图" width="130">
          <template #default="scope">
            <span v-if="!scope.row.imgUrl">暂无图片</span>
            <el-image v-else :src="scope.row.imgUrl" lazy />
          </template>
        </el-table-column>

        <el-table-column property="lab_name" label="编号" />

        <el-table-column property="lab_location" label="位置" />

        <el-table-column property="lab_seating" label="座位数" />

        <el-table-column property="lab_category" label="类别" />

        <el-table-column property="lab_intro" label="简介" />

        <!-- show-overflow-tooltip: 当内容过长被隐藏时显示 tooltip -->
        <!-- <el-table-column label="操作" show-overflow-tooltip /> -->
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="warning" @click="showDialog(scope.row)">修改</el-button>
            <el-button type="danger" @click="deleteLaboratory(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 修改实验室信息的弹出框 -->
    <el-dialog v-model="dialogFormVisible" title="修改实验室信息">

      <el-form
        label-width="80px"
        ref="formRef"
        :model="form"
        :rules="rules"
      >
        <el-form-item label="编号" prop="lab_name">
          <el-input v-model="form.lab_name" style="width:250px !important;" />
        </el-form-item>

        <el-form-item label="位置" prop="lab_location">
          <el-input v-model="form.lab_location" style="width:250px !important;" />
        </el-form-item>

        <el-form-item label="座位数" prop="lab_seating">
          <el-input v-model="form.lab_seating" style="width:250px !important;" />
        </el-form-item>

        <el-form-item label="类别" prop="lab_category">
          <el-select v-model="form.lab_category" class="m-2" placeholder="请选择...">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="简介" prop="lab_intro">
            <el-input
              v-model="form.lab_intro"
              :rows="4"
              type="textarea"
              placeholder="实验室简介..."
            />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="updateLaboratory">确定</el-button>
        </span>
      </template>

    </el-dialog>

  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from "../api/request.js";
import { ElMessage, ElMessageBox } from "element-plus";

let laboratories = ref([]);
const form = ref({});// 用于修改对话框中的数据
const formRef = ref(null);

const dialogFormVisible = ref(false);

const validateSeating = (rule, value, callback) => {
  const number = Number(value);
  if(!value) {
    callback('lab_seating is required');
  }
  else if(isNaN(number) || number<0) {
    callback('输入错误！');
  }
  else{
    callback();
  }
}

// 类别可选值
const options = [
  {
    label: '机房',
    value: '机房',
  },
  {
    label: '物理实验室',
    value: '物理实验室',
  },
  {
    label: '化学实验室',
    value: '化学实验室',
  },
  {
    label: '生物实验室',
    value: '生物实验室',
  },
]

const rules = ref({
  lab_name: [{ required: true, trigger: "blur" }],
  lab_location: [{ required: true, trigger: 'blur' }],
  lab_seating: [{ required: true, validator: validateSeating, trigger: 'blur' }],
  lab_category: [{ required: true, trigger: 'blur' }],
  lab_intro: [{required: true, trigger: "blur"}]
})

const getLaboratories = async () => {
  laboratories.value = await axios.get("/laboratories/findAll");
};

// 挂载后获取所有实验室信息
onMounted(() => {
  getLaboratories();
});

// 显示修改信息的对话框
const showDialog = (laboratoryInfo) => {
  // const { id, lab_name, lab_location, lab_seating, lab_category, lab_intro, imgUrl } = laboratoryInfo;
  form.value = { ...laboratoryInfo };
  dialogFormVisible.value = true;
}

// 根据id修改实验室信息
const updateLaboratory = () => {
  // 根据验证规则进行验证
  formRef.value.validate(async (valid) => {
    // 表单验证通过
    if (valid) {
      axios.patch('/laboratories/updateById', {
        ...form.value
      })
      .then(res => {
        // 更新实验室信息
        getLaboratories();
        ElMessage.success(res);
        dialogFormVisible.value = false;
      })
    }
    // 未通过验证
    else {
      ElMessage.error("更新失败！");
      return false;
    }
  });
}

// 根据id删除实验室信息
const deleteLaboratory = (id) => {
  ElMessageBox.confirm("确认删除?","提示",{
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
  .then(() => {
    axios.delete('/laboratories/deleteById', {
      params: {
        id
      }
    })
    .then(res => {
      getLaboratories();
      ElMessage.success(res);
    })
  })
  .catch(() => {
    ElMessage({
      type: "info",
      message: "已取消",
    });
  });
}
</script>

<style lang="less" scoped>
.container {
  h2 {
    text-align: center;
  }
}
</style>