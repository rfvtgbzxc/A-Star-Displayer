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
            <button @click="find_and_show_path">计算道路</button>
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

    class Point {
        constructor(x, y) {
            this.ptkey = `${x},${y}`;
            this.x = x;
            this.y = y;
            this.block_type = null;

            this.father = null;
            this.G = 999;
            this.is_blocked = false;
            this.is_path = false;
        }

        //重置寻路数据
        refresh() {
            this.father = null;
            this.G = 999;
            this.is_blocked = this.block_type === "wall";
            if(this.block_type === "path")
                this.block_type = null;
        }

        getH(aim_point) {
            return Math.abs(aim_point.x - this.x) + Math.abs(aim_point.y - this.y);
        }

        getG() {
            return this.G;
        }

        getF(aim_point) {
            return this.getH(aim_point) + this.getG();
        }
    }

    export default {
        name: "AStarDisplayer",
        componentName: "AStarDisplayer",
        components: {
            PointUnit,
            DisplayerOption
        },
        props: ["mapsize"],
        data() {
            return {
                maze_map: [],
                start_point: null,
                end_point: null,
                boxsize: 15,
                select_model: "set_wall",

                //寻路算法有关
                visited: []
            };
        },
        created() {
            //初始化maze_map,visited
            let [mx, my] = this.mapsize;
            for (let x = 0; x < mx; x++) {
                let column = [];
                for (let y = 0; y < my; y++) {
                    column.push(new Point(x, y));
                }
                this.maze_map.push(column);
            }
            for (let x = 0; x < mx; x++) {
                let column = [];
                for (let y = 0; y < my; y++) {
                    column.push(false);
                }
                this.visited.push(column);
            }
        },
        computed: {
            all_points: function () {
                let points = [];
                for (let column of this.maze_map)
                    points.push(...column);
                return points;
            },
            styles: function () {
                return {
                    rect_map: {
                        width: (this.boxsize + 1) * this.mapsize[0] + "px",
                        height: (this.boxsize + 1) * this.mapsize[1] + "px",
                        display: "flex",
                        flexDirection: "column",
                        flexWrap: "wrap"
                    }
                };
            },
            xsize: function () {
                return this.mapsize[0];
            },
            ysize: function () {
                return this.mapsize[1];
            },
        },
        methods: {
            handle_point_select: function (point, force = false) {
                if (!this.select_available && !force)
                    return;
                switch (this.select_model) {
                    case "set_wall":
                        point.block_type = "wall";
                        break;
                    case "remove_wall":
                        if (!(point.block_type === "wall"))
                            return;
                        point.block_type = null;
                        break;
                    case "set_start":
                        if (point.block_type)
                            return;
                        if (this.start_point)
                            this.start_point.block_type = null;
                        this.start_point = point;
                        point.block_type = "start";
                        break;
                    case "set_end":
                        if (point.block_type)
                            return;
                        if (this.end_point)
                            this.end_point.block_type = null;
                        this.end_point = point;
                        point.block_type = "end";
                        break;
                }
            },
            start_select: function () {
                this.select_available = true;
            },
            stop_select: function () {
                this.select_available = false;
            },
            clear_all_blocks: function () {
                for (let point of this.all_points) {
                    point.block_type = null;
                }
                this.end_point = null;
                this.start_point = null;
            },
            //寻路算法,终于来了
            find_and_show_path: function () {
                if (!this.start_point || !this.end_point) {
                    alert("请同时设定起点和终点！");
                    return;
                }
                let path = this.find_path(this.maze_map,this.start_point,this.end_point);
                console.log(path);
                if (path) {
                    for (let point of path) {
                        point.block_type = "path";
                    }
                }
                else{
                    console.log("没有找到道路！");
                }
            },
            /*find_path:function () {
              //初始化寻路参数
              for(let point of this.all_points){
                point.refresh();
              }
              let path = [];
              for(let x=0;x<10;x++){
                path.push(this.maze_map[x][5]);
              }
              return path;
            }*/
            round_attachable_points: function (point) {
                let points = [];
                let dirs = [[0,1],[0,-1],[1,0],[-1,0]];
                // for (let dx = -1; dx < 2; dx++) {
                //     for (let dy = -1; dy < 2; dy++) {
                //         let [x, y] = [point.x + dx, point.y + dy];
                //         //在地图内存在，且没有出队，且可以通行
                //         if (x > 0 && x < this.xsize && y > 0 && y < this.ysize && !this.visited[x][y] && !this.maze_map[x][y].is_blocked)
                //             points.push([this.maze_map[x][y], Math.abs(dx) + Math.abs(dy)]);
                //     }
                // }
                for (let [dx,dy] of dirs) {
                    let [x, y] = [point.x + dx, point.y + dy];
                    //在地图内存在，且没有出队，且可以通行
                    if (x > 0 && x < this.xsize && y > 0 && y < this.ysize && !this.visited[x][y] && !this.maze_map[x][y].is_blocked)
                        points.push([this.maze_map[x][y], Math.abs(dx) + Math.abs(dy)]);
                }
                return points;
            },
            find_path: function (point_map, start_point, end_point) {
                //初始化
                //各点寻路参数初始化
                for (let point of this.all_points) {
                    point.refresh();
                }
                start_point.G = 0;
                //到访记录初始化
                for (let i = 0; i < this.xsize; i++)
                    for (let j = 0; j < this.ysize; j++)
                        this.visited[i][j] = false;

                let result = null;
                let queue = new FinderQueue();
                queue.aim_point = end_point;
                queue.enqueue(start_point);

                while (!queue.is_empty()) {
                    let now_minF_point = queue.dequeue();
                    this.visited[now_minF_point.x][now_minF_point.y] = true;
                    for (let [point, payment] of this.round_attachable_points(now_minF_point)) {
                        if (point === end_point) {
                            point.father = now_minF_point;
                            result = point;
                            break;
                        }
                        if (queue.has(point)) {
                            if (now_minF_point.G + payment < point.G) {
                                point.father = now_minF_point;
                                point.G = now_minF_point.G + payment;
                            }
                        } else {
                            point.father = now_minF_point;
                            point.G = now_minF_point.G + payment;
                            queue.enqueue(point);
                        }
                    }
                }
                let path;
                if (result) {
                    path = [end_point];
                    let next_point = end_point;
                    while (next_point !== start_point) {
                        path.unshift(next_point.father);
                        next_point = next_point.father;
                    }
                    path.pop();
                    path.shift();
                }
                return path;
            }
        }
    }
    //算法部分，优先队列
    class FinderQueue {
        constructor() {
            this.aim_point = null;
            this.heap = [];
            this.length = 0;
        }

        enqueue(point) {
            this.heap.push(point);
            this.length += 1;
        }

        dequeue() {
            if (!this.length)
                return;
            this.check_heap();
            let val = this.heap.shift();
            this.length -= 1;
            return val;
        }

        is_empty() {
            return this.length === 0;
        }

        has(item) {
            return this.heap.includes(item);
        }

        check_heap() {
            if (this.length === 1)
                return;
            let i = parseInt((this.length - 2) / 2);
            while (i > 0) {
                this.check(i);
                i = parseInt((i - 1) / 2);
            }
            this.check(0);
        }

        check(i) {
            let mf = this.heap[i].getF(this.aim_point),
                lk = i * 2 + 1, rk = i * 2 + 2,
                lf, rf;
            if (lk < this.length)
                lf = this.heap[lk].getF(this.aim_point);
            if (rk < this.length)
                rf = this.heap[rk].getF(this.aim_point);
            if (rf != null && rf < mf) {
                if (lf != null) {
                    if (lf < rf) {
                        // lf 最小
                        this.exchange_and_check(i, lk);
                    } else {
                        // rf 最小
                        this.exchange_and_check(i, rk);
                    }
                } else {
                    // rf 最小
                    this.exchange_and_check(i, rk);
                }
            } else if (lf != null && lf < mf) {
                if (rf != null) {
                    if (rf < lf) {
                        // rf 最小
                        this.exchange_and_check(i, rk);
                    } else {
                        // lf 最小
                        this.exchange_and_check(i, lk);
                    }
                } else {
                    // lf 最小
                    this.exchange_and_check(i, lk);
                }
            }
        }

        exchange_and_check(father, child) {
            [this.heap[father], this.heap[child]] = [this.heap[child], this.heap[father]];
            this.check(child);
            this.check(father);//可能子节点会有更小的值被换上来
        }
    }
</script>

<style scoped>
    button {
        margin-left: 15px;
    }
</style>