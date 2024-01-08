<template>
  <div>
    <!-- <el-upload v-model:file="csvFile" class="upload-demo" :on-preview="handlePreview" :on-remove="handleRemove"
      :before-remove="beforeRemove" :limit="3" :on-exceed="handleExceed">
      <el-button type="primary">上传 CSV 文件</el-button>
      <template #tip>
        <div class="el-upload__tip">
          上传的文件只能是 csv 格式
        </div>
      </template>
    </el-upload>
    <el-upload v-model:file="docsFile" class="upload-demo" :on-preview="handlePreview" :on-remove="handleRemove"
      :before-remove="beforeRemove" :limit="3" :on-exceed="handleExceed">
      <el-button type="primary">上传 Doc 文件</el-button>
      <template #tip>
        <div class="el-upload__tip">
          上传的文件只能是 Doc 格式，记得 $1$、$2$ 对应的是 CSV 文件的第一列和第二列，以此类推
        </div>
      </template>
    </el-upload> -->
    <el-upload action="#" :auto-upload="false" :on-change="handleCSVUpload">
      <el-button slot="trigger" size="small" type="primary">Choose CSV</el-button>
    </el-upload>

    <el-upload action="#" :auto-upload="false" :on-change="handleDocsUpload">
      <el-button slot="trigger" size="small" type="primary">Choose Doc</el-button>
    </el-upload>
    <el-button @click="merge">合成</el-button>
  </div>
</template>
<script lang="tsx" setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadProps, UploadUserFile } from 'element-plus'
import Papa from 'papaparse'
import mammoth from 'mammoth'

const csvFile = ref<UploadUserFile>()
const docsFile = ref<UploadUserFile>()

const handleCSVUpload = (file) => {
  csvFile.value = file
}

const handleDocsUpload = (file) => {
  docsFile.value = file
}

const merge = async () => {
  console.log(csvFile.value, docsFile.value)
  if (!csvFile.value || !docsFile.value) {
    ElMessage.warning('请上传 CSV 和 Doc 文件。')
    return
  }

  // 读取 csv 文件
  const csvData = await new Promise((resolve, reject) => {
    Papa.parse(csvFile.value.raw, {
      complete: resolve,
      error: reject,
      header: true
    })
  })
  console.log('CSV 数据', csvData)

  // 读取 doc 文件
  const docArrayBuffer = await docsFile.value.raw.arrayBuffer()
  const docContent = await mammoth.extractRawText({ arrayBuffer: docArrayBuffer })

  // 替换 doc 文件内容
  let newDocContent = docContent.value
  csvData.data.forEach((row, index) => {
    Object.values(row).forEach((value, i) => {
      newDocContent = newDocContent.replace(new RegExp(`\\$${i + 1}\\$`, 'g'), value)
    })
  })

  // 保存新的 doc 文件
  // 这里需要使用适合你的方法来保存文件，例如使用 FileSaver.js
}
</script>
