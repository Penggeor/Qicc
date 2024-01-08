<template>
  <div class="container">
    <el-upload action="#" :auto-upload="false" :on-change="handleDocsUpload" drag>
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        <em>
          上传 DOCX 模板文件
        </em>
        ，填充变量请用花括号形式： {当前公司}
      </div>
    </el-upload>
    <el-upload action="#" :auto-upload="false" :on-change="handleCSVUpload" drag>
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        <em>
          上传 CSV 文件
        </em>
        ，第一列是填充变量的名字，比如 当前公司、法人
      </div>
    </el-upload>
    <el-input v-model="outputName" placeholder="输出每个 .docx 名称，名称为填充变量，比如：当前公司名、法人，不填的话默认为连续数字" />
    <el-space>
      <el-button @click="merge">合成</el-button>
    </el-space>
  </div>
</template>
<script lang="tsx" setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadProps, UploadUserFile } from 'element-plus'
import Papa from 'papaparse'
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import PizZipUtils from "pizzip/utils/index.js";
import FileSaver from "file-saver";
import JSZip from 'jszip';
import { UploadFilled } from '@element-plus/icons-vue'

const csvFile = ref<UploadUserFile>()
const docsFile = ref<UploadUserFile>()
const outputName = ref<string>('')

const handleCSVUpload = (file) => {
  console.log(file)
  csvFile.value = file
}

const handleDocsUpload = (file) => {
  console.log(file)
  docsFile.value = file
}

const readFileIntoArrayBuffer = async (fd: File): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      console.log(e)

      console.log(reader.result)
      resolve(reader.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(fd);
  });

const merge = async () => {
  console.log(csvFile.value, docsFile.value)
  if (!csvFile.value || !docsFile.value) {
    ElMessage.warning('请上传 CSV 和 Doc 文件。')
    return
  }

  console.log(docsFile.value?.raw)

  // 读取 csv 文件
  const csvData = await new Promise((resolve, reject) => {
    Papa.parse(csvFile.value!.raw, {
      complete: resolve,
      error: reject,
      header: true
    })
  })
  console.log('CSV 数据', csvData)

  const files = []

  for (const [index, record] of Object.entries(csvData.data)) {
    console.log(record)
    console.log(index)

    const template = await readFileIntoArrayBuffer(docsFile.value!.raw)

    // 读取 docx 文件
    const zip = new PizZip(template);

    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })

    doc.setData(record);

    try {
      // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
      doc.render();
    } catch (error) {
      console.log('error')
      console.error(error)
      ElMessage.error(`第 ${index} 个文件合成失败，请检查 CSV 文件和 DOCX 模板文件。`)
    }

    const out = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });

    files.push({
      name: `${outputName.value || index}.docx`,
      file: out
    })
  }

  console.log(files)

  const zip = new JSZip();
  files.map(({ name, file }) => zip.file(name, file))

  const content = await zip.generateAsync({ type: "blob" });
  console.log(content)
  FileSaver.saveAs(content, "output.zip");
}
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
