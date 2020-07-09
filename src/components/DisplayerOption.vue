<template>
    <div class="option_container">
        <slot></slot>
    </div>
</template>

<script>
  export default {
    name: "DisplayerOption"
  }
</script>

<style scoped>
    .option_container{
        display: flex;
    }
</style>