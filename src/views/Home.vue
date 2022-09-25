<template>
  <div class="about">
    <!-- 头部 -->
    <v-header />
    <!-- 左侧边栏 -->
    <v-sidebar />

    <div class="content-box" :class="{ 'content-collapse': collapse }">
      <!-- tag标签 -->
      <v-tags></v-tags>
      <!-- 主内容区域 -->
      <div class="content">
        <router-view v-slot="{ Component }">
          <transition name="move" mode="out-in">
            <keep-alive :include="tagsList">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
        <!-- <el-backtop target=".content"></el-backtop> -->
      </div>
    </div>
    
  </div>
</template>
<script>
import { computed } from "vue";
import { useStore } from "vuex";
import vHeader from "../components/Header.vue";
import vSidebar from "../components/Sidebar.vue";
import vTags from "../components/Tags.vue";
export default {
  components: {
    vHeader,
    vSidebar,
    vTags,
  },
  setup() {
    const store = useStore();
    // 返回一个包含tagsList的新数组
    const tagsList = computed(() =>
      store.state.tagsList.map((item) => item.name)
    );
    const collapse = computed(() => store.state.collapse);
    return {
      tagsList,
      collapse,
    };
  },
};
</script>
