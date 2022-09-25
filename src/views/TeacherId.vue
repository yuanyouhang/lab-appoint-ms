<template>
  <div>

    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          教师编号录入
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="clearfix">
              <h3>教师编号录入</h3>
            </div>
          </template>

          <div class="info">
            <el-form
              label-position="top"
              label-width="100px"
              :model="addForm"
            >
              <el-form-item label="教师姓名">
                <el-input v-model="addForm.teach_name" />
              </el-form-item>
              <el-form-item label="教师编号">
                <el-input v-model="addForm.teach_id" />
              </el-form-item>
            </el-form>
            <el-button style="display: block; width: 100%;" type="primary" @click="saveTeachId">录入</el-button>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="14">
        <el-card shadow="hover" style="min-height: 500px;">
          <template #header>
            <div class="clearfix">
              <span>教师编号表</span>
            </div>
          </template>

          <el-table
            ref="multipleTableRef"
            :data="teachers"
            style="width: 100%"
          >
            <el-table-column property="teach_id" label="教师编号" />

            <el-table-column property="teach_name" label="姓名" />

            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="warning" @click="showDialog(scope.row)">修改</el-button>
                <el-button type="danger" @click="deleteTeacher(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 修改教师编号信息的弹出框 -->
    <el-dialog v-model="dialogFormVisible" title="修改教师编号信息">

      <el-form>
        <el-form-item label="姓名" label-width="80px">
          <el-input v-model="form.teach_name" style="width:250px !important;" />
        </el-form-item>

        <el-form-item label="教师编号" label-width="80px">
          <el-input v-model="form.teach_id" style="width:250px !important;" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="updateTeacher">确定</el-button>
        </span>
      </template>

    </el-dialog>

  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import axios from "../api/request.js";
import { ElMessage, ElMessageBox } from "element-plus";
export default {
  setup() {
    const teachers = ref([]);
    const form = ref({});// 用于修改对话框中的教师数据
    // 用于录入编号信息的数据
    const addForm = ref({
      teach_name: '',
      teach_id: '',
    });
    const dialogFormVisible = ref(false);
    const selectedTeachers = ref([]);

    // 获取所有教师编号信息
    const getTeachers = async () => {
      teachers.value = await axios.get("/teachers/findAllId");
    };

    // 挂载后获取所有教师编号信息
    onMounted(() => {
      getTeachers();
    });

    // 显示修改信息的对话框
    const showDialog = (teacherInfo) => {
      const { teach_id, teach_name, id } = teacherInfo;
      form.value = { teach_id, teach_name, id };
      dialogFormVisible.value = true;
    }

    // 根据id修改教师编号信息
    const updateTeacher = () => {
      // console.log(form);
      axios.patch('/teachers/updateById', {
        ...form.value
      })
      .then(res => {
        // 更新教师编号信息
        getTeachers();
        ElMessage.success(res);
        dialogFormVisible.value = false;
      })
    }

    // 根据id删除教师编号信息
    const deleteTeacher = (id) => {
      ElMessageBox.confirm("确认删除?","提示",{
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        axios.delete('/teachers/deleteTeachId', {
          params: {
            id
          }
        })
        .then(res => {
          getTeachers();
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

    // 添加教师编号信息
    const saveTeachId = () => {
      if(!addForm.value.teach_name || !addForm.value.teach_id) {
        ElMessage.error('所有信息不能为空！');
      }
      else {
        // 查询教师编号是否已存在
        axios.get('/teachers/findTeachId', {
          params: {
            teach_id: addForm.value.teach_id
          }
        })
        .then(res => {
          // 已存在
          if(res) {
            ElMessage.error('该教师编号已存在！');
          }
          // 未存在，添加到编号信息表
          else {
            axios.post('/teachers/addIdInfo', {
              ...addForm.value
            })
            .then(res => {
              addForm.value.teach_name = '';
              addForm.value.teach_id = '';
              getTeachers();
              ElMessage.success(res);
            })
          }
        })
      }
    }

    return {
      teachers,
      form,
      addForm,
      dialogFormVisible,
      selectedTeachers,
      getTeachers,
      showDialog,
      updateTeacher,
      deleteTeacher,
      saveTeachId,
    };
  },
};
</script>

<style lang="less" scoped>
.container {
  h2 {
    text-align: center;
  }
}
</style>