<template>
    <div
        class="hover_rect"
        :style="styles.rect"
        @click="handle_click"
        @mouseenter="handle_enter"
    >

    </div>
</template>

<script>
  export default {
    name: "PointUnit",
    props: ["boxsize","point"],
    data(){
      return {
      };
    },
    computed:{
      styles:function () {
        let block_color;
        switch (this.point.block_type) {
          case "wall":
            block_color = "grey";
            break;
          case "end":
            block_color = "#3399FF"
            break;
          case "start":
            block_color = "#009933"
            break;
        }
        return {
          rect:{
            width: this.boxsize + "px",
            height: this.boxsize + "px",
            border: "1px solid black",
            marginRight: "-1px",
            marginBottom: "-1px",
            backgroundColor: block_color
          }
        };
      }
    },
    methods:{
      handle_enter:function () {
        this.$emit("select_point",this.point);
      },
      handle_click:function () {
        this.$emit("select_point",this.point,true);
      }
    }
  }
</script>

<style scoped>
    .hover_rect:hover{
        background: red;
    }
</style>