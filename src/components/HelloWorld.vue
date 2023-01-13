<script setup lang="ts">
import fs from 'fs'
import { ref } from 'vue'
import { ipcRenderer } from 'electron';

defineProps<{ msg: string }>()

let count = ref<number>(0)
let codes = ref<any>("")
let list = ref()

const showRecorder = () => {
  console.log("showRecorder");
  console.log({ ipcRenderer });
  ipcRenderer.send("showRecorder", "hello", count.value)
}

const incrCount = () => {
  count.value++
  ipcRenderer.send("test", count.value)
}

const closeAll = () => {
  ipcRenderer.send("close_all", count.value)
}

const upload = () => {
  console.log("uload", codes.value, typeof codes.value);
  ipcRenderer.send("upload", codes.value.toString())
}

ipcRenderer.on("REFRESH_LIST", (event, resp: []) => {
  console.log("REFRESH_LIST", { resp });
  list.value = resp
})

ipcRenderer.on("CODE_CHANGE", (enent, source: any) => {
  console.log("on message", source, typeof source);
  codes.value = source.sources
})

</script>

<template>
  <h1 @click="showRecorder">{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="incrCount">count is {{ count }}</button>

    <button type="button" @click="closeAll">关闭全部</button>

    <button type="button" @click="upload">上传</button>
  </div>

  <div>
    codes:
    <textarea v-model="codes" name="" id="" cols="30" rows="10"></textarea>
  </div>

  <table style="border: 1px solid black">
    <tr v-for="item of list" >
      <td>{{ item._id.$oid }}</td>
      <td>{{ item.code }}</td>
    </tr>
  </table>




</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
