<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          学生管理
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <h2>学生信息管理</h2>

      <!-- 搜索区域 -->
      <div class="searchArea">
        <el-input
          v-model="keyword"
          class="w-50 m-2"
          placeholder="请输入学号..."
          prefix-icon="el-icon-lx-search"
          v-if="selectedValue === 'Id'"
          clearable
        />
        <el-select
          v-model="keyword"
          class="el-input"
          placeholder="请选择班级..."
          v-else-if="selectedValue === 'Class'"
        >
          <el-option
            v-for="item in classes"
            :key="item.name"
            :label="item.name"
            :value="item.name"
            />
        </el-select>
        <el-select
          v-model="keyword"
          class="el-input"
          placeholder="请选择学院..."
          v-else
        >
          <el-option
            v-for="item in colleges"
            :key="item.id"
            :label="item.name"
            :value="item.name"
          />
        </el-select>

        <span style="margin: 0 10px">按</span>
        <el-select
          v-model="selectedValue"
          class="selector"
          placeholder="请选择..."
          @change="handleChange"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button type="primary" @click="searchStudent">搜索</el-button>
      </div>

      <div style="margin-bottom: 10px;">
        <el-button
          type="primary"
          @click="checkMutiple"
          v-show="selectedStudents.length !== 0"
        >
          一键审核
        </el-button>
        <el-button disabled type="primary" v-show="selectedStudents.length === 0" style="margin-left: 0">一键审核</el-button>
      </div>

      <!-- 学生信息表格 -->
      <el-table
        ref="multipleTableRef"
        :data="students"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" :selectable="isSelectable" />

        <el-table-column property="stu_id" label="学号" />
          <!-- <template #default="scope">{{ scope.row.date }}</template> -->

        <el-table-column property="stu_name" label="姓名" />

        <el-table-column property="stu_class" label="班级" />

        <el-table-column property="college" label="学院" />

        <el-table-column property="phone_number" label="手机号码" />

        <el-table-column label="处理" >
          <template #default="scope">
            <el-button
              type="primary"
              v-if="scope.row.state === '未审核'"
              @click="checkStudent(scope.row.id)"
            >
              审核
            </el-button>

            <el-button type="success" v-else>已审核</el-button>
          </template>
        </el-table-column>

        <!-- show-overflow-tooltip: 当内容过长被隐藏时显示 tooltip -->
        <!-- <el-table-column label="操作" show-overflow-tooltip /> -->
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="warning" @click="showDialog(scope.row)">修改</el-button>
            <el-button type="danger" @click="deleteStudent(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 修改学生信息的弹出框 -->
    <el-dialog v-model="dialogFormVisible" title="修改学生信息">

      <el-form>
        <el-form-item label="姓名" label-width="60px">
          <el-input v-model="form.stu_name" style="width:250px !important;" />
        </el-form-item>

        <el-form-item label="班级" label-width="60px">
          <el-select v-model="form.stu_class" placeholder="请选择...">
            <el-option
              v-for="item in classes"
              :key="item.name"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="学院" label-width="60px">
          <el-select v-model="form.college" placeholder="请选择...">
            <el-option
              v-for="item in colleges"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="updateStudent">确定</el-button>
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
    let students = ref([]);
    let colleges = ref([]);
    let classes = ref([]);
    const form = ref({});// 用于修改对话框中的学生数据
    const selectedValue = ref('Id');
    const keyword = ref('');
    const dialogFormVisible = ref(false);
    const selectedStudents = ref([]);

    const options = [
      {
        value: 'Id',
        label: '学号',
      },
      {
        value: 'Class',
        label: '班级',
      },
      {
        value: 'College',
        label: '学院',
      },
    ]

    const handleChange = (value) => {
      // console.log(value);
      // console.log(selectedValue.value);
      keyword.value = '';
    }

    const getStudents = async () => {
      students.value = await axios.get("/students/findAll");
    };

    const getColleges = async () => {
      colleges.value = await axios.get("/students/getColleges");
    };

    const getClasses = async () => {
      classes.value = await axios.get("/students/getClasses");
    };

    // 挂载后获取所有学生信息、班级信息、学院信息
    onMounted(() => {
      getStudents();
      getClasses();
      getColleges();
      // multipleTable = multipleTableRef.value;
    });

    // 根据关键词及条件搜索学生信息
    const searchStudent = async () => {
      // 关键词为空时直接获取所有学生信息
      if(!keyword.value) {
        getStudents();
      }
      // else if(keyword.value && !selectedValue.value) {
      //   ElMessage.error('搜索条件不能为空！')
      // }
      else {
        let key = '';
        if(selectedValue.value === 'Id') {
          key = 'stu_id'
        }
        else {
          selectedValue.value === 'Class' ? key = 'stu_class' : key = 'college';
        }
        // console.log(selectedValue.value);
        const result = await axios.get(`/students/findBy${selectedValue.value}`, {
          params: {
            [key]: keyword.value,
          },
        });
        // console.log(typeof result);
        // 当通过学号查询时返回一个对象而不是数组
        if(Array.isArray(result)) {
          students.value = result;
        }
        else {
          if(!result) {
            students.value = [];
          }
          else {
            students.value = Array(result);
          }
        }
      }
    };

    //审核学生账号
    const checkStudent = (id) => {
      // console.log(id);
      axios.patch('/students/checkById', {
        id
      })
      .then(res => {
        // 更新审核状态
        getStudents();
        ElMessage.success(res);
      })
      .catch(err => {
        ElMessage.error(err);
      })
    }
    // 表格行的选择框是否可以勾选
    const isSelectable = (row, index) => {
      return row.state === '未审核';
    }
    // 当表格的多选框选择改变时
    const handleSelectionChange = (selection) => {
      // console.log(selection);// selection即为包含已选中行的数组
      selectedStudents.value = selection;
    }
    // 一键审核多个
    const checkMutiple = () => {
      const idArr = selectedStudents.value.map(item => item.id);
      // console.log(stuIdArr)
      axios.patch('/students/checkMutiple', {
        idArr
      })
      .then(res => {
        getStudents();
        ElMessage.success(res);
      })
    }

    // 显示修改信息的对话框
    const showDialog = (studentInfo) => {
      const { id, stu_name, stu_class, college } = studentInfo;
      form.value = { id, stu_name, stu_class, college };
      dialogFormVisible.value = true;
    }

    // 根据id修改学生信息
    const updateStudent = () => {
      // console.log(form);
      axios.patch('/students/updateById', {
        ...form.value
      })
      .then(res => {
        // 更新学生信息
        getStudents();
        ElMessage.success(res);
        dialogFormVisible.value = false;
      })
    }

    // 根据id删除学生信息
    const deleteStudent = (id) => {
      ElMessageBox.confirm("确认删除?","提示",{
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        axios.delete('/students/deleteById', {
          params: {
            id
          }
        })
        .then(res => {
          getStudents();
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

    return {
      handleChange,
      students,
      colleges,
      classes,
      form,
      dialogFormVisible,
      selectedStudents,
      getStudents,
      getColleges,
      getClasses,
      searchStudent,
      handleSelectionChange,
      checkStudent,
      isSelectable,
      checkMutiple,
      showDialog,
      updateStudent,
      deleteStudent,
      keyword,
      selectedValue,
      options,
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
.searchArea {
  display: flex;
  align-items: center;
  margin: 20px 0;
  .el-input {
    width: 250px;
  }
  .selector {
    width: 150px;
  }
}
</style>