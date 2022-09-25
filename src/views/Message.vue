<template>
  <div class="">
    <!-- 标题 -->
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>系统消息</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!-- 内容 -->
    <div class="container">
      <!-- tabs标签页 -->
      <el-tabs v-model="message">
        <el-tab-pane :label="`未读消息(${notReadMsg.length})`" name="first">
          <el-table :data="notReadMsg" :show-header="false" style="width: 100%" height="400">
            <el-table-column>
              <template #default="scope">
                <span class="message-title" @click="showDetail(scope.row)" title="查看详情">
                  {{ scope.row.content }}
                </span>
              </template>
            </el-table-column>

            <el-table-column
              prop="pub_datetime"
              width="150"
            ></el-table-column>

            <el-table-column width="120">
              <template #default="scope">
                <el-button type="warning" @click="pushToIsRead(scope.row.id)">标为已读</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane :label="`已读消息(${isReadMsg.length})`" name="second">
          <template v-if="message === 'second'">
            <el-table :data="isReadMsg" :show-header="false" style="width: 100%" height="360">
              <el-table-column>
                <template #default="scope">
                  <span style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">
                    {{ scope.row.content }}
                  </span>
                </template>
              </el-table-column>

              <el-table-column
                prop="pub_datetime"
                width="150"
              ></el-table-column>

              <el-table-column width="120">
                <template #default="scope">
                  <el-button type="danger" @click="handleDel(scope.row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div style="text-align:right;padding:20px;">
              <el-button type="primary" @click="clearIsReadMsg">清除所有</el-button>
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog title="消息详情" v-model="showDialog" width="600px" center>
      <div class="nitice-content">{{ msg.content }}</div>
      <div class="public-time">{{ msg.pub_datetime }}</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="showDialog = false">确定</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useStore } from 'vuex';
import axios from "../api/request";
import { ElMessage, ElMessageBox } from "element-plus";

const message = ref("first");
const showDialog = ref(false);

const msg = ref({});
const store = useStore();
const isReadMsg = computed(() => store.state.msgList.filter(item => item.is_read === 1));
const notReadMsg = computed(() => store.state.msgList.filter(item => item.is_read === 0));

onMounted(() => {
  // 获取所有系统消息
  store.dispatch('getMsgList');
});

// 标为已读
const pushToIsRead = (id) => {
  axios.post('/message/putIsRead', {
    id
  })
  .then(res => {
    store.dispatch('getMsgList');
  })
}

const handleDel = (id) => {
  ElMessageBox.confirm(
    "确认删除?",
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      axios.delete('/message/deleteSysMsgById', {
        params: {
          id
        }
      })
      .then(res => {
        ElMessage({
          type: "success",
          message: "删除成功",
        });
        store.dispatch('getMsgList');
      })
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "已取消",
      });
    });
};

const showDetail = (msgObj) => {
  showDialog.value = true;
  msg.value = msgObj;
}

// 清除所有已读
const clearIsReadMsg = () => {
  ElMessageBox.confirm('你确定清除所有已读消息吗?', '提示',{
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  .then(() => {
    // 确定
    axios.delete('/message/deleteAllIsReadSysMsg')
    .then(res => {
      // 重新获取所有系统消息
      store.dispatch('getMsgList');
      ElMessage.success(res.data.msg);
    })
  })
  .catch(() => {
    ElMessage.info('已取消');
  })
}
</script>

<style scoped lang="less">
.message-title {
  display: block;
  width: 100%;
  padding: 10px 20px;
  box-sizing: border-box;
  cursor: pointer;
  font-size: 16px;

  /* 超过一行以...显示 */
  overflow: hidden;/*超出部分隐藏*/
  white-space: nowrap;/*不换行*/
  text-overflow: ellipsis;/*超出部分文字以...显示*/
  &:hover {
    background-color: lightgray;
  }
}
.handle-row {
  margin-top: 30px;
}
.nitice-content {
  margin-bottom: 10px;
  font-size: 16px;
}
.public-time {
  font-size: 13px;
  color: gray;
}
</style>