<template>
    <div>
        <DisplayerOption>
            <label><input
                type="radio"
                value="set_wall"
                v-model="select_model"
            ><span>绘制墙壁</span></label>
            <label><input
                    type="radio"
                    value="remove_wall"
                    v-model="select_model"
            ><span>清除墙壁</span></label>
            <label><input
                    type="radio"
                    value="set_start"
                    v-model="select_model"
            ><span>设置起点</span></label>
            <label><input
                    type="radio"
                    value="set_end"
                    v-model="select_model"
            ><span>设置终点</span></label>
            <button @click="clear_all_blocks">清空画面</button>
            <button>计算道路</button>
        </DisplayerOption>
        <div
            ondragstart="return false;" onselectstart="return false;" unselectable="on"
            :style="styles.rect_map"
            @mousedown="start_select"
            @mouseup="stop_select"
            @mouseleave="stop_select"
        >
            <PointUnit
                v-for="point in all_points"
                :key="point.ptkey"
                :boxsize="boxsize"
                :point="point"
                @select_point="handle_point_select"
            />
        </div>
    </div>
</template>

<script>
  import PointUnit from "@/components/PointUnit";
  import DisplayerOption from "@/components/DisplayerOption";
  class Point{
    constructor(x,y) {
      this.ptkey =  `${x},${y}`;
      this.x = x;
      this.y = y;
      this.block_type = null;
    }

  }
  export default {
    name: "AStarDisplayer",
    componentName: "AStarDisplayer",
    components:{
      PointUnit,
      DisplayerOption
    },
    props: ["mapsize"],
    data(){
      return {
        maze_map:[],
        start_point:null,
        end_point:null,
        boxsize:15,
        select_model: "set_wall",
      };
    },
    created() {
      //初始化maze_map
      let [mx,my] = this.mapsize;
      for(let x=0;x<mx;x++){
        let column = [];
        for(let y=0;y<my;y++){
          column.push(new Point(x,y));
        }
        this.maze_map.push(column);
      }
    },
    computed:{
      all_points:function () {
        let points = [];
        for(let column of this.maze_map)
          points.push(...column);
        return points;
      },
      styles:function () {
        return {
          rect_map:{
            width: (this.boxsize + 1) * this.mapsize[0] + "px",
            height: (this.boxsize + 1) * this.mapsize[1] + "px",
            display: "flex",
            flexWrap:"wrap"
          }
        };
      }
    },
    methods:{
      handle_point_select:function (point,force=false) {
        if(!this.select_available && !force)
          return;
        switch(this.select_model) {
          case "set_wall":
            point.block_type = "wall";
            break;
          case "remove_wall":
            if(!(point.block_type === "wall"))
              return;
            point.block_type = null;
            break;
          case "set_start":
            if(this.start_point)
                this.start_point.block_type = null;
            this.start_point = point;
            point.block_type = "start";
            break;
          case "set_end":
            if(this.end_point)
                this.end_point.block_type = null;
            this.end_point = point;
            point.block_type = "end";
            break;
        }
      },
      start_select:function () {
        this.select_available = true;
      },
      stop_select:function () {
        this.select_available = false;
      },
      clear_all_blocks:function (){
        for(let point of this.all_points){
          point.block_type = null;
        }
      },
    }
  }
</script>

<style scoped>
    button{
        margin-left: 15px;
    }
</style>