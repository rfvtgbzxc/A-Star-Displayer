//计算曼哈顿距离
/*
class Point{
  constructor(x,y){
    this.x = x;
    this.y = y;
    this.father = null;
    this.G = 999;
    this.is_blocked = false;
  }
  getH(aim_point){
    return Math.abs(aim_point.x - this.x) + Math.abs(aim_point.y - this.y);
  }
  getG(){
    return this.G;
  }
  getF(aim_point){
    return this.x;
    return this.getH(aim_point) + this.getG();
  }
  toString(){
    return this.x + "," +this.y;
  }
}*/
//优先队列,是一个小根堆
//只在要出队时才整理队列，使之符合小根堆
class FinderQueue{
  constructor() {
    this.aim_point = null;
    this.heap = [];
    this.length = 0;
  }
  enqueue(point){
    this.heap.push(point);
    this.length += 1;
  }
  dequeue(){
    if(!this.length)
      return;
    this.check_heap();
    let val = this.heap.shift();
    this.length -= 1;
    return val;
  }
  is_empty(){
    return this.length === 0;
  }
  has(item){
    return this.heap.includes(item);
  }
  check_heap(){
    if(this.length === 1)
      return;
    let i = parseInt((this.length - 2)/2);
    while(i > 0){
      this.check(i);
      i = parseInt((i-1)/2);
    }
    this.check(0);
  }
  check(i){
    let mf = this.heap[i].getF(),
      lk = i*2+1,rk = i*2+2,
      lf,rf;
    if(lk < this.length)
      lf = this.heap[lk].getF();
    if(rk < this.length)
      rf = this.heap[rk].getF();
    if(rf!=null && rf < mf){
      if(lf!=null){
        if(lf < rf){
          // lf 最小
          this.exchange_and_check(i,lk);
        }
        else{
          // rf 最小
          this.exchange_and_check(i,rk);
        }
      }
      else{
        // rf 最小
        this.exchange_and_check(i,rk);
      }
    }
    else if(lf!=null && lf < mf){
      if(rf!=null){
        if(rf < lf){
          // rf 最小
          this.exchange_and_check(i,rk);
        }
        else{
          // lf 最小
          this.exchange_and_check(i,lk);
        }
      }
      else{
        // lf 最小
        this.exchange_and_check(i,lk);
      }
    }
  }
  exchange_and_check(father,child){
    [this.heap[father],this.heap[child]] = [this.heap[child],this.heap[father]];
    this.check(child);
    this.check(father);//可能子节点会有更小的值被换上来
  }
}

function round_attachable_points(point){
  let points = [];
  for(let dx=-1;dx<2;dx++){
    for(let dy=-1;dy<2;dy++){
      let [x,y] = [point.x+dx,point.y+dy];
      //在地图内存在，且没有出队，且可以通行
      if(x > 0 && x < xsize && y > 0 && y < ysize && !visited[x][y] && !point_map[x][y].is_blocked)
        points.push([point_map[x][y],Math.abs(dx)+Math.abs(dy)]);
    }
  }
  return points;
}

var point_map,visited,xsize,ysize;
export default function A_Star_FindPath(point_map,start_point,end_point){
  //初始化
  let visited = [];
  let queue = new FinderQueue();
  queue.enqueue(start_point);

  let result = null;
  while(true){
    if(queue.is_empty()){
      break;
    }
    let now_minF_point = queue.dequeue();
    visited[now_minF_point.x][now_minF_point.y] = true;
    for(let [point,payment] of round_attachable_points(now_minF_point)){
      if(point===end_point){
        point.father = now_minF_point;
        result = point;
        break;
      }
      if(queue.has(point)){
        if(now_minF_point.G + payment < point.G){
          point.father = now_minF_point;
          point.G = now_minF_point.G + payment;
        }
      }
      else{
        queue.enqueue(point);
      }
    }
  }
  let point_list;
  if(result){
    point_list = [end_point];
    let next_point = end_point;
    while(1){
      if(next_point===start_point)
        break;
      point_list.unshift(next_point.father);
      next_point = next_point.father;
    }
  }
}