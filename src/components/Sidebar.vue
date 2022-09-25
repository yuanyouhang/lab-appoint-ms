<template>
    <div class="sidebar">
        <!-- router: 是否启用vue-router模式。启用该模式会在激活导航时以 index 作为path进行路由跳转 -->
        <!-- unique-opened: 是否只保持一个子菜单的展开 -->
        <!-- collapse: 是否水平折叠收起菜单（仅在 mode 为 vertical 时可用） -->
        <!-- default-active: 默认激活菜单的 index -->
        <el-menu
          class="sidebar-el-menu"
          :default-active="onRoutes"
          :collapse="collapse"
          background-color="#324157"
          text-color="#bfcbd9"
          active-text-color="#20a0ff"
          unique-opened
          router
        >
          <template v-for="item in items">
              <template v-if="item.subs">
                  <el-submenu :index="item.index" :key="item.index">
                      <template #title>
                          <i :class="item.icon"></i>
                          <span>{{ item.title }}</span>
                      </template>
                      <template v-for="subItem in item.subs">
                          <el-submenu v-if="subItem.subs" :index="subItem.index" :key="subItem.index">
                              <template #title>{{ subItem.title }}</template>
                              <el-menu-item v-for="(threeItem, i) in subItem.subs" :key="i" :index="threeItem.index">
                                  {{ threeItem.title }}</el-menu-item>
                          </el-submenu>
                          <el-menu-item v-else :index="subItem.index" :key="subItem.index">{{ subItem.title }}
                          </el-menu-item>
                      </template>
                  </el-submenu>
              </template>
              <template v-else>
                  <el-menu-item :index="item.index" :key="item.index">
                      <i :class="item.icon"></i>
                      <template #title>{{ item.title }}</template>
                  </el-menu-item>
              </template>
          </template>
        </el-menu>
    </div>
</template>

<script>
import { computed, watch } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
export default {
    setup() {
        const items = [
            {
                icon: "el-icon-lx-home",
                index: "/dashboard",
                title: "系统首页",
            },
            {
                icon: "el-icon-lx-settings",
                index: "8",
                title: "系统管理",
                subs: [
                    {
                        index: "/SysVar",
                        title: "系统参数设置",
                    },
                ],
            },
            {
                icon: "el-icon-lx-friend",
                index: "7",
                title: "用户管理",
                subs: [
                    {
                        index: "/students",
                        title: "学生管理",
                    },
                    {
                        index: "/teachers",
                        title: "教师管理",
                    },
                    {
                        index: "/teacherId",
                        title: "教师编号录入",
                    },
                ],
            },
            {
                icon: "el-icon-lx-filter",
                index: "3",
                title: "实验室管理",
                subs: [
                    {
                        index: "/addLaboratory",
                        title: "实验室信息录入",
                    },
                    {
                        index: "/laboratories",
                        title: "实验室信息表",
                    },
                    {
                        index: "/labSchedule",
                        title: "实验室课程表",
                    },
                ],
            },
            {
                icon: "el-icon-lx-time",
                index: "1",
                title: "预约管理",
                subs: [
                  {
                      index: "/stuAppointment",
                      title: "学生预约管理",
                  },
                  {
                      index: "/teachAppointment",
                      title: "教师预约管理",
                  },
                  {
                      index: "/adminAppointment",
                      title: "管理员手动预约管理",
                  },
                ],
            },
            {
                icon: "el-icon-lx-copy",
                index: "/notices",
                title: "公告管理",
            },
            {
                icon: "el-icon-lx-notice",
                index: "/message",
                title: "系统消息",
            },
        ];

        const route = useRoute();

        const onRoutes = computed(() => {
            return route.path;
        });

        const store = useStore();
        const collapse = computed(() => store.state.collapse);

        return {
            items,
            onRoutes,
            collapse,
        };
    },
};
</script>

<style scoped>
.sidebar {
    display: block;
    position: absolute;
    left: 0;
    top: 70px;
    bottom: 0;
    overflow-y: scroll;
}
.sidebar::-webkit-scrollbar {
    width: 0;
}
.sidebar-el-menu:not(.el-menu--collapse) {
    width: 250px;
}
.sidebar > ul {
    height: 100%;
}
</style>
