<template>
  <router-view />
</template>

<script setup>
// Ya no necesitamos importar nada aquí
</script>

<style>
/* El reseteo global de márgenes y box-sizing */
html, body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: var(--bg-dark, #0a0b0b);
}

*, *::before, *::after {
  box-sizing: inherit;
}
</style>