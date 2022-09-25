<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="10">
        <el-card shadow="hover" class="mgb20" style="height: 350px">
          <div class="user-info">
            <img src="../assets/img/img.jpg" class="user-avator" alt />
            <div class="user-info-cont">
              <div class="user-info-name">{{ name }}</div>
              <div>系统管理员</div>
            </div>
          </div>
          <div class="user-info-list">
            上次登录时间：
            <span>{{loginDatetime}}</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="14">
        <el-card shadow="hover" style="min-height: 350px">
          <template #header>
            <div class="clearfix">
              <span>待办事项</span>
            </div>
          </template>

          <div style="color:red; font-size:18px; margin-bottom:10px;">提示:为确保用户能够正常使用预约功能，请您依次完成以下相关事项！</div>

          <el-table :show-header="false" :data="todoList" style="width:100%" :row-style="{'height':'60px'}">
            <el-table-column width="500">
              <template #default="scope">
                <div
                  class="todo-item"
                  :class="{
                    'todo-item-del': scope.row.status,
                  }"
                >
                  {{ scope.row.title }}
                </div>
              </template>
            </el-table-column>

            <el-table-column>
              <template #default="scope">
                <el-button type="primary" v-if="!scope.row.status" @click="todo(scope.row)" size="small">去完成</el-button>
                <i class="el-icon-lx-roundcheckfill" style="color:#1AAD19; font-size:18px;" v-else></i>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted, onBeforeMount, reactive, ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from 'vuex'
import axios from '../api/request'

const router = useRouter();
const store = useStore();
const name = localStorage.getItem("username");
const loginDatetime = localStorage.getItem('loginDatetime');

// 待办事项数据信息
const todoList = reactive([
  {
    title: "1、系统参数设置",
    status: false,
    path: '/SysVar',
  },
  {
    title: "2、教师编号信息录入",
    status: false,
    path: '/teacherId',
  },
  {
    title: "3、实验室信息录入",
    status: false,
    path: '/addLaboratory',
  },
  {
    title: "4、生成实验室课表",
    status: false,
    path: '/labSchedule',
  }
]);
// 更改待办事项状态
const changeTodoState = async () => {
  const teachIdCount = await axios.get('/teachers/teachIdCount');
  teachIdCount.count === 0 ? todoList[1].status = false : todoList[1].status = true;
  const labsCount = await axios.get('/laboratories/labsCount');
  labsCount.count === 0 ? todoList[2].status = false : todoList[2].status = true;
  const scheCount = await axios.get('/schedule/scheCount');
  scheCount.count === 0 ? todoList[3].status = false : todoList[3].status = true;
  const SysVars = await axios.get('/sys-var/findAll');
  !SysVars.open_date ? todoList[0].status = false : todoList[0].status = true;
  checkTodoList();
  store.dispatch('getMsgList');
}

// 添加系统消息
const addSysMsg = (content) => {
  axios.post('/message/insertSysMsg', {
    content,
    pub_datetime: new Date().toLocaleString()
  })
}

// 检查是否有新的待办事项
const checkTodoList = () => {
  const content = '您有新的待办事项未完成！';
  const msgIsExisted = computed(() => store.state.msgList.filter(item => item.content === content && item.is_read === 0).length);
  // console.log(msgIsExisted.value)
  if(!msgIsExisted.value) {
    (todoList.filter(item => item.status === false)).length !== 0 ? addSysMsg(content) : '' ;
  }
}

onBeforeMount(() => {
  changeTodoState();
})

// 点击去完成
const todo = (item) => {
  router.push(item.path);
}

</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-row {
  margin-bottom: 20px;
}

.grid-content {
  display: flex;
  align-items: center;
  height: 100px;
}

.grid-cont-right {
  flex: 1;
  text-align: center;
  font-size: 14px;
  color: #999;
}

.grid-num {
  font-size: 30px;
  font-weight: bold;
}

.grid-con-icon {
  font-size: 50px;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
  color: #fff;
}

.grid-con-1 .grid-con-icon {
  background: rgb(45, 140, 240);
}

.grid-con-1 .grid-num {
  color: rgb(45, 140, 240);
}

.grid-con-2 .grid-con-icon {
  background: rgb(100, 213, 114);
}

.grid-con-2 .grid-num {
  color: rgb(45, 140, 240);
}

.grid-con-3 .grid-con-icon {
  background: rgb(242, 94, 67);
}

.grid-con-3 .grid-num {
  color: rgb(242, 94, 67);
}

.user-info {
  display: flex;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 2px solid #ccc;
  margin-bottom: 20px;
}

.user-avator {
  width: 120px;
  height: 120px;
  border-radius: 50%;
}

.user-info-cont {
  padding-left: 50px;
  flex: 1;
  font-size: 14px;
  color: #999;
}

.user-info-cont div:first-child {
  font-size: 30px;
  color: #222;
}

.user-info-list {
  font-size: 14px;
  color: #999;
  line-height: 25px;
}

.user-info-list span {
  margin-left: 10px;
}

.mgb20 {
  margin-bottom: 20px;
}

.mgb10 {
  margin-bottom: 10px;
}

.todo-item {
  font-size: 16px;
  font-weight: bold;
}

.todo-item-del {
  text-decoration: line-through;
  color: #999;
}

.schart {
  width: 100%;
  height: 300px;
}
</style>
