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
    <el-upload action="#" :auto-upload="false" :on-change="handleDocsUpload">
      <el-button slot="trigger" size="small" type="primary">上传 DOCX 模板文件，填充变量请用花括号形式： {company}</el-button>
    </el-upload>
    <el-upload action="#" :auto-upload="false" :on-change="handleCSVUpload">
      <el-button slot="trigger" size="small" type="primary">上传 CSV 文件，第一列是填充变量的名字，比如 company</el-button>
    </el-upload>

    <el-button @click="merge">合成</el-button>
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
import { saveAs } from "file-saver";

const csvFile = ref<UploadUserFile>()
const docsFile = ref<UploadUserFile>()

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
    // reader.readAsBinaryString(fd);
  });

const merge = async () => {
  // console.log(csvFile.value, docsFile.value)
  // if (!csvFile.value || !docsFile.value) {
  //   ElMessage.warning('请上传 CSV 和 Doc 文件。')
  //   return
  // }

  console.log(docsFile.value?.raw)
  const template = await readFileIntoArrayBuffer(docsFile.value!.raw)

  // 读取 docx 文件
  const zip = new PizZip(template);

  // 读取 csv 文件
  const csvData = await new Promise((resolve, reject) => {
    Papa.parse(csvFile.value!.raw, {
      complete: resolve,
      error: reject,
      header: true
    })
  })
  console.log('CSV 数据', csvData)

  for (const [index, record] of Object.entries(csvData.data)) {
    console.log(record)
    console.log(index)

    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })

    doc.setData(record);

    try {
      // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
      doc.render();
    } catch (error) {
      console.log('error')
      console.error(error)
    }

    const out = doc.getZip().generate({
      type: "blob",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });

    // Output the document using Data-URI
    saveAs(out, `output-${index}.docx`);
  }
}
</script>
