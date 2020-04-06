//------------------------tools------------------------------
//自调用函数传入window的目的,是让变量名可以别压缩
//在老版本的浏览器中undefined是可以被重新赋值的
;(function (window,undefined) {
	var tools = {
		getRandom: function (min,max) {
			return Math.round(Math.random() * (max - min)) +min;
		}
	}
	window.tools = tools;
})(window,undefined)

//------------------------food---------------------------
;(function fn() {
	//放置局部变量中,避免变量名冲突
	var position = 'absolute';		//设置成变量方便修改
	var elements = [];	  // 记录上一次创建的食物,为删除做准备
	
	function Food (options) {	
		options = options || {};
		this.x = options.x || 0;
		this.y = options.y || 0;
	
		this.width = options.width || 20;
		this.height = options.height || 20;
	
		this.color = options.color || 'red';
	}
	//渲染
	Food.prototype.render = function (map) {
		//删除之前创建的食物
		remove();
	
		//随机生成X和Y的值
		this.x = tools.getRandom(0, map.offsetWidth / this.width - 1) * this.width;
		this.y = tools.getRandom(0, map.offsetHeight / this.height - 1) * this.height;
	
	
		//动态创建div 也就是页面上显示的食物
		var div = document.createElement('div');
		map.appendChild(div);
		//把创建的DVI加入到数组中
		elements.push(div);
	
		div.style.position = position;
		div.style.left = this.x + 'px';
		div.style.top = this.y + 'px';
		div.style.width = this.width + 'px';
		div.style.height = this.height + 'px';
		div.style.backgroundColor = this.color;
	}
		
	//删除
	function remove() {
		//删除div
		for(var i = elements.length -1; i >= 0; i--) {
			elements[i].parentNode.removeChild(elements[i]);
			// 删除数组中的元素
	      	// 删除数组元素
	      	// 第一个参数，从哪个元素开始删除
	      	// 第二个参数，删除几个元素
	      	elements.splice(i, 1);
		}
	}

	window.Food = Food;
})()

//---------------------------snake---------------------------
;(function () {	//属性包括: 		width	height	body数组，蛇的头部和身体,第一个是蛇头	direction		方法:render
	//变量
	var position = 'absolute';
	var elements = [];	//记录之前创建的蛇

	function Snake (options) {
		options = options || {};
		//蛇的大小
		this.width = options.width || 20;
		this.height = options.height || 20;
		//蛇的方向
		this.direction = options.direction || 'right';
		//蛇的身体
		this.body = [
			{x:3, y:2, color:'red'},
			{x:2, y:2, color:'blue'},
			{x:1, y:2, color:'blue'},
		]
	}

	//渲染
	Snake.prototype.render = function (map) {
		//删除之前的蛇
		remove();

		//把蛇在地图中渲染出来
		for(var i = 0, len = this.body.length; i < len; i++) {
			var object = this.body[i];

			//创建div,放置地图中
			var div = document.createElement('div');
			map.appendChild(div);
			//记录当前创建的蛇
			elements.push(div);

			//设置样式
			div.style.position = position;
			div.style.width = this.width + 'px';
			div.style.height = this.height + 'px';
			div.style.left = object.x * this.width + 'px';
			div.style.top = object.y * this.height + 'px';
			div.style.backgroundColor = object.color;
		}
	}

	//删除之前的蛇
	function remove() {
		for(var i = elements.length - 1; i >= 0; i--) {
			elements[i].parentNode.removeChild(elements[i]);
			// elements[i].parentNode.removeChild(elements[i]);
			elements.splice(i, 1);
		}
	}


	//控制蛇移动的方法
	Snake.prototype.move = function (food, map) {
		//控制蛇的身体(当前蛇节到上一个蛇节的位置)
		for(var i = this.body.length - 1; i > 0; i--) {
			this.body[i].x = this.body[i - 1].x;
			this.body[i].y = this.body[i - 1].y;
		}

		//控制蛇头的移动(先判断蛇移动的方向)
		var head = this.body[0];
		switch(this.direction) {
			case 'right':
				head.x += 1;
				break;
			case 'left':
				head.x -= 1;
				break;
			case 'top':
				head.y -= 1;
				break;
			case 'bottom':
				head.y += 1;
				break;
		}

		//2.4当蛇遇到食物 做想要的出来
		var headX = head.x * this.width;
  		var headY = head.y * this.height;
  		if (headX === food.x && headY === food.y) {
  		  // 让蛇增加一节
  		  // 获取蛇的最后一节
  		  var last = this.body[this.body.length - 1];
  		  // this.body.push({
  		  //   x: last.x,
  		  //   y: last.y,
  		  //   color: last.color
  		  // })
  		  var obj = [];
  		  extend(last, obj);
  		  this.body.push(obj);

  		  // 随机在地图上重新生成食物
  		  food.render(map);
  		}

	}

	function extend(parent, child) {
      for (var key in parent) {
        // 不给wsc复制同名的属性
        if (child[key]) {
          continue;
        }
        child[key] = parent[key];
      }
    }

	window.Snake = Snake;
})()


//---------------------------------------game------------------------------
;(function () {
	var that;	//记录游戏对象

	function Game (map) {
		this.food = new Food();
		this.snake = new Snake();
		this.map = map;
		that = this;
	}

	Game.prototype.start = function () {
		//1.把蛇和食物对象,渲染到地图上
		this.food.render(this.map);
		this.snake.render(this.map);
		
		//2.开始游戏的逻辑
		//2.1让蛇移动起来
		//2.2当蛇遇到边界游戏结束
		runSnake();
		//2.3通过键盘控制蛇移动的方向
		bindKey();
		
	}

	function bindKey () {
		document.addEventListener('keydown', function (e) {
			// console.log(e.keyCode);
    		// 37 - left
    		// 38 - top
    		// 39 - right
    		// 40 - bottom
    		switch (e.keyCode) {
    			case 37:
    				this.snake.direction = 'left';
    				break;
    			case 38:
    				this.snake.direction = 'top';
    				break;
    			case 39:
    				this.snake.direction = 'right';
    				break;
    			case 40:
    				this.snake.direction = 'bottom';
    				break;
    		}
		}.bind(that),false);
	}

	//私有的函数		让蛇移动
	function runSnake() {
		var timerId = setInterval(function () {
			// 让蛇走一格
       		// 在定时器的function中this是指向window对象的
      	 	// this.snake
      	 	// 要获取游戏对象中的蛇属性
      	 	this.snake.move(that.food,that.map);
      	 	this.snake.render(that.map);

      	 	//2.2当蛇遇到边界游戏结束
			var maxX = this.map.offsetWidth / this.snake.width;
			var maxY = this.map.offsetHeight / this.snake.height;
			var headX = this.snake.body[0].x;
			var headY = this.snake.body[0].y;
	
			//判断左右
			if(headX < 0 || headX >= maxX) {
				alert('Game Over');
				clearInterval(timerId);
			}
			//判断上下
			if(headY < 0 || headY >= maxY) {
				alert('Game Over');
				clearInterval(timerId);
			}
		}.bind(that), 150);

	}

	window.Game = Game;
})()


//---------------------------------------main---------------------------
;(function () {
	var map = document.getElementById('map');
	var game = new Game(map);
	game.start();

})()