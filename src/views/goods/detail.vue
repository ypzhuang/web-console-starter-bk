<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-width="120px">
      <el-form-item label="商品编号">
        <el-input v-model="form.name" placeholder="请输入商品编号" />
      </el-form-item>
      <el-form-item label="商品名">
        <el-input v-model="form.name" placeholder="请输入商品名" />
      </el-form-item>
      <el-form-item label="规格">
        <el-input v-model="form.name" placeholder="请输入规格" />
      </el-form-item>
      <el-form-item label="统一售价">
        <el-input v-model="form.name" placeholder="请输入统一售价" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="form.region" placeholder="please select your zone">
          <el-option label="Zone one" value="shanghai" />
          <el-option label="Zone two" value="beijing" />
        </el-select>
      </el-form-item>
      <el-form-item label="商品介绍">
        <el-input v-model="form.name" placeholder="请输入商品介绍" />
      </el-form-item>
      <el-form-item label="上传照片">
        <el-input v-model="form.name" placeholder="请输入商品介绍" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">保存</el-button>
        <el-button @click="onCancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      }
    }
  },
  methods: {
    onSubmit() {
      this.$message('submit!')
    },
    onCancel() {
      this.$message({
        message: 'cancel!',
        type: 'warning'
      })
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
</style>

