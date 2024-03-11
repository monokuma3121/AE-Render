<script setup>
import { inject } from "vue";
const ws = inject("ws");


if(sessionStorage.getItem('account')) {
  window.onload = function () {
  ws.setId(sessionStorage.getItem('account'));
  ws.connect();
};
}




</script>

<template>
  <router-view></router-view>
</template>

<style scoped></style>
