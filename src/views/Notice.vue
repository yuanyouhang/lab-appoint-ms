<template>
  <div class="">
    <!-- 标题 -->
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item
          ><i class="el-icon-lx-copy"></i> 公告管理</el-breadcrumb-item
        >
      </el-breadcrumb>
    </div>
    <!-- 内容 -->
    <div class="container">
      <!-- tabs标签页 -->
      <el-tabs v-model="message">
        <!-- tab选项 -->
        <!-- <el-tab-pane :label="`发布公告(${state.unread.length})`" name="first">
          <el-table
            :data="state.unread"
            :show-header="false"
            style="width: 100%"
          >
            <el-table-column>
              <template #default="scope">
                <span class="message-title">{{ scope.row.title }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="date" width="180"></el-table-column>
            <el-table-column width="120">
              <template #default="scope">
                <el-button size="small" @click="handleRead(scope.$index)"
                  >标为已读</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <div class="handle-row">
            <el-button type="primary">全部标为已读</el-button>
          </div>
        </el-tab-pane> -->

        <el-tab-pane label="发布公告" name="first">
          <el-input
            v-model="notice_content"
            :rows="10"
            type="textarea"
            placeholder="公告内容..."
          />
          <div class="handle-row">
            <el-button type="primary" @click="publicNotice">发布</el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="`公告列表(${notices.length})`" name="second">
          <template v-if="message === 'second'">
            <el-table :data="notices" :show-header="false" style="width: 100%">
              <el-table-column>
                <template #default="scope">
                  <span class="message-title" @click="showDetail(scope.row)" title="查看详情">
                    {{ scope.row.notice_content }}
                  </span>
                </template>
              </el-table-column>

              <!-- prop: 字段名称, 对应列内容的字段名 -->
              <el-table-column
                prop="pub_datetime"
                width="150"
              ></el-table-column>

              <el-table-column width="120">
                <template #default="scope">
                  <el-button type="danger" @click="handleDel(scope.row.notice_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <!-- <div class="handle-row">
              <el-button type="danger">删除全部</el-button>
            </div> -->
          </template>
        </el-tab-pane>

        <!-- <el-tab-pane :label="`回收站(${state.recycle.length})`" name="third">
          <template v-if="message === 'third'">
            <el-table
              :data="state.recycle"
              :show-header="false"
              style="width: 100%"
            >
              <el-table-column>
                <template #default="scope">
                  <span class="message-title">{{ scope.row.title }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="date" width="150"></el-table-column>
              <el-table-column width="120">
                <template #default="scope">
                  <el-button @click="handleRestore(scope.$index)"
                    >还原</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <div class="handle-row">
              <el-button type="danger">清空回收站</el-button>
            </div>
          </template>
        </el-tab-pane> -->
      </el-tabs>
    </div>

    <el-dialog title="公告详情" v-model="showDialog" width="600px" center>
      <div class="nitice-content">{{ notice.notice_content }}</div>
      <div class="public-time">{{ notice.pub_datetime }}</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="showDialog = false">确定</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import axios from "../api/request";
import { ElMessage, ElMessageBox } from "element-plus";
export default {
  name: "notices",
  setup() {
    const message = ref("first");
    const showDialog = ref(false);
    const notice_content = ref("");
    let notice = ref({});
    let notices = ref([]);

    // 获取所有公告列表
    const getNotices = async () => {
      notices.value = await axios.get("/notices/findAll");
      // console.log(notices);
    };
    onMounted(getNotices);

    const handleDel = (notice_id) => {
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
          axios.delete('/notices/deleteById', {
            params: {
              notice_id
            }
          })
          .then(res => {
            ElMessage({
              type: "success",
              message: "删除成功",
            });
            getNotices();
          })
        })
        .catch(() => {
          ElMessage({
            type: "info",
            message: "已取消",
          });
        });
    };

    // 发布公告
    const publicNotice = () => {
      if (!notice_content.value) {
        ElMessage.error("请输入公告内容！");
      } else {
        const pub_datetime = new Date().toLocaleString();
        axios
          .post("/notices/insert", {
            notice_content: notice_content.value,
            pub_datetime,
          })
          .then((res) => {
            ElMessage.success("发布成功！");
            notice_content.value = "";
            // 获取公告列表最新数据
            getNotices();
          });
      }
    };

    const showDetail = (noticeObj) => {
      showDialog.value = true;
      notice.value = noticeObj;
    }

    return {
      showDialog,
      message,
      notice_content,
      notice,
      notices,
      publicNotice,
      getNotices,
      handleDel,
      showDetail
    };
  },
};
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

