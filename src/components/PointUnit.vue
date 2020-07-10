<template>
    <div
        class="hover_rect"
        :style="styles.rect"
        @mousedown="handle_click"
        @mouseenter="handle_enter"
    >
<!--        {{pointF}}-->
    </div>
</template>

<script>
  export default {
    name: "PointUnit",
    props: ["boxsize","point","end_point"],
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
          case "path":
            block_color = "#7FB7BE"
            break;
          case "queue":
            block_color = "#ffC000"
            break;
        }
        return {
          rect:{
            width: this.boxsize + "px",
            height: this.boxsize + "px",
            border: "1px solid black",
            marginRight: "-1px",
            marginBottom: "-1px",
            backgroundColor: block_color,
            fontSize:"10px"
          }
        };
      },
      pointF:function(){
        return this.point.G===999?"":this.point.getF(this.end_point);
      },
      direct:function () {
        if(this.point.father) {
          if(this.point.father.x < this.point.x){
            return "←";
          }
          if(this.point.father.x > this.point.x){
            return "→";
          }
          if(this.point.father.y < this.point.y){
            return "↑";
          }
          if(this.point.father.y > this.point.y){
            return "↓";
          }
        }
        return "";
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