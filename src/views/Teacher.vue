<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          教师管理
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <h2>教师信息管理</h2>

      <!-- 搜索区域 -->
      <div class="searchArea">
        <el-input
          v-model="keyword"
          class="w-50 m-2"
          placeholder="请输入教师姓名..."
          prefix-icon="el-icon-lx-search"
          clearable
        />
        <el-button type="primary" @click="searchTeacher">搜索</el-button>
      </div>

      <div style="margin-bottom: 10px;">
        <el-button
          type="primary"
          @click="checkMutiple"
          v-show="selectedTeachers.length !== 0"
        >
          一键审核
        </el-button>
        <el-button disabled type="primary" v-show="selectedTeachers.length === 0" style="margin-left: 0">一键审核</el-button>
      </div>

      <!-- 教师信息表格 -->
      <el-table
        ref="multipleTableRef"
        :data="teachers"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" :selectable="isSelectable" />

        <el-table-column property="teach_id" label="教师编号" />
          <!-- <template #default="scope">{{ scope.row.date }}</template> -->

        <el-table-column property="teach_name" label="姓名" />

        <el-table-column property="phone_number" label="手机号码" />

        <el-table-column label="处理">
          <template #default="scope">
            <el-button
              type="primary"
              v-if="scope.row.state === '未审核'"
              @click="checkTeacher(scope.row.id)"
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
            <el-button type="danger" @click="deleteTeacher(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import axios from "../api/request.js";
import { ElMessage, ElMessageBox } from "element-plus";
export default {
  setup() {
    let teachers = ref([]);
    const keyword = ref('');
    const selectedTeachers = ref([]);

    const getTeachers = async () => {
      teachers.value = await axios.get("/teachers/findAll");
    };

    // 挂载后获取所有教师信息
    onMounted(() => {
      getTeachers();
    });

    // 根据关键词搜索教师信息
    const searchTeacher = async () => {
      // 关键词为空时直接获取所有教师信息
      if(!keyword.value) {
        getTeachers();
      }
      else {
        teachers.value = await axios.get('/teachers/findByName', {
          params: {
            teach_name: keyword.value,
          },
        });
      }
    };

    //审核教师状态
    const checkTeacher = (id) => {
      axios.patch('/teachers/checkById', {
        id
      })
      .then(res => {
        // 更新审核状态
        getTeachers();
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
      selectedTeachers.value = selection;
    }

    // 一键审核多个
    const checkMutiple = () => {
      const idArr = selectedTeachers.value.map(item => item.id);
      // console.log(teachIdArr)
      axios.patch('/teachers/checkMutiple', {
        idArr
      })
      .then(res => {
        getTeachers();
        ElMessage.success(res);
      })
    }

    // 根据id删除教师信息
    const deleteTeacher = (id) => {
      ElMessageBox.confirm("确认删除?","提示",{
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      .then(() => {
        axios.delete('/teachers/deleteById', {
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

    return {
      teachers,
      selectedTeachers,
      getTeachers,
      searchTeacher,
      handleSelectionChange,
      checkTeacher,
      isSelectable,
      checkMutiple,
      deleteTeacher,
      keyword,
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