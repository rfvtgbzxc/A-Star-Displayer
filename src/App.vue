<template>
  <div id="app">
<!--    <HelloWorld msg="Welcome to Your Vue.js App"/>-->
    <AStarDisplayer :mapsize="mapsize"/>
  </div>
</template>

<script>
import AStarDisplayer from "@/components/AStarDispalyer";

export default {
  name: 'App',
  components: {
    AStarDisplayer
  },
  data(){
    return {
      mapsize:[30,30]
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
