<template>
  <div>
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>
          实验室信息录入
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <el-form
        ref="formRef"
        label-position="left"
        label-width="80px"
        :model="form"
        style="max-width: 460px"
        :rules="rules"
      >
        <el-form-item label="编号" prop="lab_name">
          <el-input v-model="form.lab_name" placeholder="实验室编号，如：3-301" />
        </el-form-item>
        <el-form-item label="位置" prop="lab_location">
          <el-input v-model="form.lab_location" placeholder="实验室位置，如：第三教学楼" />
        </el-form-item>
        <el-form-item label="座位数" prop="lab_seating">
          <el-input v-model="form.lab_seating" placeholder="实验室座位数，如：40" />
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

        <!-- <el-form-item label="封面图">
          <el-upload
            ref="uploadImgRef"
            drag
            :http-request="uploadImg"
            accept="image/*"
            action=""
            :before-upload="beforeImgUpload"
          >
            <i class="el-icon-lx-upload"></i>
            <UploadFilled style="width: 50px; height: 50px;margin-top: 50px" />
            <div class="el-upload__text">
             将文件拖到这里或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只支持图片格式
              </div>
            </template>
          </el-upload>
        </el-form-item> -->

        <el-form-item label="简介" prop="lab_intro">
            <el-input
              v-model="form.lab_intro"
              :rows="8"
              type="textarea"
              placeholder="实验室简介..."
            />
        </el-form-item>
      </el-form>
      <div>
        <el-button type="primary" @click="postForm">添加</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from "../api/request.js";
import { ElMessage } from "element-plus";
import { UploadFilled } from '@element-plus/icons-vue'

const formRef = ref(null);
// const uploadImgRef = ref(null);

// 表单数据
const form = ref({
  lab_name: '',
  lab_location: '',
  lab_seating: '',
  lab_category: '',
  lab_intro: '',
  imgUrl: 'http://47.100.62.167:8098/images/lab.jpeg',
});


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

const rules = ref({
  lab_name: [{ required: true, trigger: "blur" }],
  lab_location: [{ required: true, trigger: 'blur' }],
  lab_seating: [{ required: true, validator: validateSeating, trigger: 'blur' }],
  lab_category: [{ required: true, trigger: 'blur' }],
  lab_intro: [{required: true, trigger: "blur"}],
})

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

const beforeImgUpload = (rawFile) => {
  // console.log(rawFile.type);
  if (!rawFile.type.includes('image/')) {
    ElMessage.error('文件格式错误！')
    return false
  } else if (rawFile.size / 1024 / 1024 > 5) {
    ElMessage.error('文件大小限制为小于5MB!')
    return false
  }
  return true
}

// 上传图片并获取图片url
const uploadImg = (params) => {
  // const formData = new FormData();
  // formData.append('file', params.file);
  // axios.post('/laboratories/uploadImg', formData, {
  //   headers: {'Content-Type': 'multipart/form-data;charset=utf-8'},
  // })
  // .then(res => {
  //   console.log(res)
  //   form.value.imgUrl = res;
  // })
  form.value.imgUrl = 'http://47.100.62.167:8098/images/lab.jpeg'
}
// 上传表单
const postForm = () => {
  // 根据验证规则进行验证
  formRef.value.validate((valid) => {
    // 表单验证通过
    if (valid) {
      // if(!form.value.imgUrl) {
      //   ElMessage.warning('请选择上传图片！');
      // }
      // else {
        axios.post('/laboratories/insert', {
          ...form.value
        })
        .then(res => {
          ElMessage.success(res);
          form.value.lab_name = '';
          form.value.lab_location = '';
          form.value.lab_seating = '';
          form.value.lab_category = '';
          form.value.lab_intro = '';
          // form.value.imgUrl = '';
          // uploadImgRef.value.clearFiles();
        })
      // }
    }
    // 未通过验证
    else {
      ElMessage.error("添加失败！");
      return false;
    }
  });
}
</script>

<style lang="less" scoped>

</style>