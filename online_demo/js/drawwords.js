function drawWords(opt) {
	
	var click_position;
	opt.canvasObj.addEventListener('click', function(e) {
		click_position = getEvent_position(e);
		Init();
	}, false);

	var winW = opt.parentObj.offsetWidth;

	var maxWidth = 1000; // 默认canvas宽度
	var pagePadding = 40;
	var marginX = 20; // 标签横间距
	var marginY = 120; // 标签竖间距
	var marginToP = 200; // 单元竖向 间距
	var fontSize = 60; // 字体大小
	var smallFontsize = 20;
	var fontWidth = fontSize; // 每个字符对应宽度
	var pointMargin = 60; // 标签内部填充
	var piceOneHeight = fontSize + 60 + marginY; //标签高度
	var smallfillW = 20;
	var smallHeight = 40;
	var smallT = 25;

	function getTreaPoint(data) { // 获取数据对应关系，确定每条数据对应的点和其父级的点

		var hash = {
			tree: {}, // 记录点的信息
			readyId: [], // 记录完成的点
			headId: [] // 记录顶点
		}

		function getPartPoint() {

			data.forEach(function(value, index) {
				var _id = Number(  value['idNo'] );
				var _parentId =  value['fh']=="" ? value['dp'] : value['fh'] ;
				
				if(_parentId=='-01'||_parentId==''){
					_parentId = null ;
				}else{
					_parentId = Number(_parentId);
				}
				var _title = value['expression'];
				var point = {
					id: _id,
					title: _title,
					left: 0,
					top: 0,
					parentAbout: value['log']  || "",
					width: _title.length * fontWidth + pointMargin,
					height: piceOneHeight,
					parentId: _parentId,
					heightAdded: false,
					UnitID : value['unitID'] ,
					sonIds: [],
					deep :  value['dp']!=""?Number(value['dp']):-1,
					deeplog : value['deepLog'] || ""
				}
				if(!_parentId&&_parentId!=0) { // 顶元素
					var thisPoint = hash.tree[_id] || point;
					thisPoint.heightAdded = false;
					thisPoint.left = maxWidth / 2;
					thisPoint.top = marginToP;
					var t_index = hash.headId.indexOf(_id);
					if(t_index != -1) {
						var prevHeight = 0,
							prevTop = 0;
						if(t_index != 0) {
							prevHeight = hash.tree[hash.headId[t_index - 1]].height;
							prevTop = hash.tree[hash.headId[t_index - 1]].top;
							thisPoint.top = prevHeight + prevTop;
						}
					} else {
						hash.headId.push(_id) // 记录顶点
					}
					hash.tree[_id] = thisPoint;
					reCumTrees();
					hash.readyId.push(_id) // 此点完成
				} else { // 非顶点
					var thisPoint = hash.tree[_id] || point;
					thisPoint.heightAdded = false;
					
					var parent = hash.tree[_parentId];
					if(parent) {
						if(parent.sonIds.indexOf(_id) == -1) {
							parent.sonIds.push(_id)
						};
						if(thisPoint.deep>0){
							thisPoint.width += marginX*15
						}

						thisPoint.top = parent.top + marginX + 30;
						thisPoint.left = 0;
						hash.tree[_id] = thisPoint;

						addParentHeight(thisPoint);
						addParentWidth(thisPoint);
						reCumTrees();

						hash.readyId.push(_id) // 此点完成
					}
				}
			})

			function reCumTrees() { // 向下计算子元素
				for(var i = 0; i < hash.headId.length; i++) {
					getSonsPoint(hash.tree[hash.headId[i]]);
				}

				function getSonsPoint(point) { // 计算子标签left、heigth ;
					point.sonIds.sort(function(a, b) {
						return a - b;
					})

					var middle = point.left;
					var top = point.top;
					var width = point.width;

					var sonW = 0;
					for(var k = 0; k < point.sonIds.length; k++) {
						sonW += hash.tree[point.sonIds[k]].width + (k == 0 ? 0 : marginX);
					}
					if(sonW < width) {
						width = sonW;
					}

					var startLeft = middle - (width / 2);

					for(var j = 0; j < point.sonIds.length; j++) {
						var thisW = hash.tree[point.sonIds[j]].width;

						hash.tree[point.sonIds[j]].left = startLeft + thisW / 2;
						hash.tree[point.sonIds[j]].top = top + piceOneHeight;
						startLeft += hash.tree[point.sonIds[j]].width + marginX;

					}

					for(var i = 0; i < point.sonIds.length; i++) {
						getSonsPoint(hash.tree[point.sonIds[i]]);
					}
				}
			}

			function addParentHeight(point) { // 向上成长父级高度
				if(point.parentId||point.parentId==0) {
					var parentPoint = hash.tree[point.parentId];
					if(!parentPoint.heightAdded) {
						parentPoint.height += piceOneHeight;
						parentPoint.heightAdded = true;
					}
					addParentHeight(parentPoint);
				}
			}

			function getThisLeft(point) {
				return 500;
			}

			function addParentWidth(point) { // 向上成长父级宽度
				if(point && ( point.parentId || point.parentId==0 )) {
					var pointParent = hash.tree[point.parentId];
					var width = 0;
					for(var i = 0; i < pointParent.sonIds.length; i++) {
						var id = pointParent.sonIds[i];
						width += hash.tree[id].width + (i == 0 ? 0 : marginX);
					}
					if(pointParent.width < width) {
						pointParent.width = width;
					}
					addParentWidth(hash.tree[pointParent.parentId]);
				}
			}

			if(!testAllPointReady()) { // 所有点并未计算完毕
				
				getPartPoint();
			} else if(testMaxWidthUseful()) { // 宽度不超出画布
				drawTree(hash);
				console.log(hash)
			} else { // 超出了画布
				getTreaPoint(data);
			}
		}

		function testAllPointReady() { // 确认所有点计算完毕
			var has = true;
			data.forEach(function(value, index) {
				var _id = Number(value['idNo']);
				if(hash.readyId.indexOf(_id) == -1) {
					has = false;
					return;
				}
			})
			return has;
		}

		function testMaxWidthUseful() {
			var _maxWidth = 0;
			for(var i in hash.tree) {
				hash.tree[i].width > _maxWidth ? _maxWidth = hash.tree[i].width : false;
			}
			
			if(_maxWidth > maxWidth - pagePadding * 2) {

				var bit = (maxWidth - pagePadding * 2) / _maxWidth;
				marginX = marginX * bit; // 标签横间距
				marginY = marginY * bit; // 标签竖间距
				marginToP = marginToP * bit; // 单元竖向 间距
				fontSize = fontSize * bit; // 字体大小
				fontWidth = fontWidth * bit // 每个字符对应宽度
				pointMargin = pointMargin * bit // 标签内部填充
				piceOneHeight = fontSize + 60 * bit + marginY //标签高度
				smallFontsize = smallFontsize * bit;
				smallfillW = smallfillW * bit;
				smallHeight = smallHeight * bit;
				smallT = smallT * bit;
				return false;
				
			} else {
				return true;
			}

		}

		getPartPoint();
	}

	function getEvent_position(ev) {
		var x, y;
		if(ev.layerX || ev.layerX == 0) {
			x = ev.layerX;
			y = ev.layerY;
		} else if(ev.offsetX || ev.offsetX == 0) { // Opera
			x = ev.offsetX;
			y = ev.offsetY;
		}
		return {
			x: x * maxWidth/winW,
			y: y * maxWidth/winW
		};
	}

	function Line(x1, y1, x2, y2,color,width) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		this.color = color || "#999" ;
		this.width = width || 1 ;
	}
	Line.prototype.drawLine = function(ctx) {
		ctx.strokeStyle = this.color;
		ctx.fillStyle = "#333";
		ctx.lineWidth = this.width;

		// draw the line
		ctx.beginPath();
		ctx.moveTo(this.x1, this.y1);
		ctx.lineTo(this.x2, this.y2);
		ctx.stroke();
	}
	Line.prototype.drawWithArrowheads = function(ctx) {

		// arbitrary styling
		this.drawLine(ctx);

		// draw the starting arrowhead
		//      var startRadians=Math.atan((this.y2-this.y1)/(this.x2-this.x1));
		//      startRadians+=((this.x2>this.x1)?-90:90)*Math.PI/180;
		//      this.drawArrowhead(ctx,this.x1,this.y1,startRadians);
		// draw the ending arrowhead
		var endRadians = Math.atan((this.y2 - this.y1) / (this.x2 - this.x1));
		endRadians += ((this.x2 >= this.x1) ? 90 : -90) * Math.PI / 180;
		this.drawArrowhead(ctx, this.x2, this.y2, endRadians);

	}
	Line.prototype.drawArrowhead = function(ctx, x, y, radians) {
		ctx.save();
		ctx.beginPath();
		ctx.translate(x, y);
		ctx.rotate(radians);
		ctx.moveTo(0, 0);
		ctx.lineTo(3, 10);
		ctx.lineTo(-3, 10);
		ctx.closePath();
		ctx.restore();
		ctx.fill();
	}
	function Circle(x, y, r,color,line_w , color2) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.color = color;
		this.line_w = line_w;
		this.color2 = color2;
	}
	Circle.prototype.drawCircle = function(ctx) {
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.r,0,360,false);
		ctx.fillStyle=this.color;//填充颜色
		ctx.fill();
		ctx.lineWidth=this.line_w;
		ctx.strokeStyle=this.color2; // 线颜色
		ctx.stroke();
		ctx.closePath();
	}
	function drawTree(hash) { // 开始绘制
		var hasClickedTag = false;
		var lastPointId = hash.headId[hash.headId.length - 1];

		var offsetH = hash.tree[lastPointId].top + hash.tree[lastPointId].height + marginY;
		var c = opt.canvasObj;
		c.height = offsetH

		var ctx = c.getContext("2d");
		ctx.fillStyle = "#fff";
		ctx.fillRect(0, 0, 1000, offsetH);

		//字符
		for(point in hash.tree) {
			writeText(hash.tree[point])
		}

		// 关系线
		for(point in hash.tree) {
			drawLines(hash.tree[hash.tree[point].parentId], hash.tree[point])
		}

		//关系节点说明
		for(point in hash.tree) {
			pointAbout(hash.tree[hash.tree[point].parentId], hash.tree[point])
		}

		function writeText(point, font , rotate) {
			ctx.font = font || fontSize + "px Arial";
			if(point.UnitID){
				if(click_position&&makeSureThispoint(click_position)) {
					openThisPoint(point) ;
					ctx.fillStyle = "#f00";
				}
				else {
					closeThispoint(point);
					ctx.fillStyle = "#000";
				}
			}
			else{
				ctx.fillStyle = "#000";
			}
			ctx.textAlign = "center";
			
			if(rotate){
				 ctx.save(); //保存画布状态
				 //ctx.translate(100, 100); 
				 ctx.translate(point.left, point.top);
				 ctx.rotate(90 * Math.PI / 180); //选择画布
				 ctx.fillText(point.title,0,-pointMargin/4);
				
				 ctx.restore();//恢复画布状态
			}else{
				ctx.fillText(point.title, point.left, point.top);
			}
			
			
			
			function makeSureThispoint(_position){
				
				if(!point.id){ // 父子关系标签不可点击
					return false ;
				}
				var maxT = point.top + fontSize/2 + pointMargin/2 ,
				minT = point.top - fontSize/2 - pointMargin/2,
				maxW = point.left + (point.title.length * fontSize)/2 + pointMargin /2,
				minW = point.left - (point.title.length * fontSize)/2 - pointMargin /2 ;
				if(_position.x < maxW && _position.x > minW && _position.y < maxT && _position.y > minT ){
					return true ;
				}else{
					return false;
				}
			}
			
			function closeThispoint(_point){
				var trueLeft = _point.left - (_point.title.length * fontSize/2) - fontSize/3 ;
				var trueTop = _point.top - fontSize/3 ;
				var r = fontSize/5 ;
				var circle = new Circle(trueLeft,trueTop,r,"#000",1,"#000");
				circle.drawCircle(ctx);
				var line = new Line(trueLeft, trueTop- r*2/3, trueLeft, trueTop+ r*2/3, '#fff',2);
				line.drawLine(ctx);
				var line2 = new Line(trueLeft- r*2/3, trueTop, trueLeft+ r*2/3, trueTop, '#fff',2);
				line2.drawLine(ctx);
			}
			function openThisPoint(_point){
				var trueLeft = _point.left - (_point.title.length * fontSize/2) - fontSize/3 ;
				var trueTop = _point.top - fontSize/3 ;
				var r = fontSize/5 ;
				var circle = new Circle(trueLeft,trueTop,r,"#eee",1,"#999");
				circle.drawCircle(ctx);
				var line2 = new Line(trueLeft- r*2/3, trueTop, trueLeft+ r*2/3, trueTop, '#000',2);
				line2.drawLine(ctx);
				hasClickedTag =  point.UnitID;
			}
			
		}

		function drawLines(pointparent, pointson) {
			if(!pointparent) {
				return false;
			}
			ctx.beginPath();
			ctx.lineCap = "round";
			ctx.lineWidth = 2;
			ctx.strokeStyle = "#F00";
//			ctx.moveTo(pointparent.left, pointparent.top + pointMargin / 3);
//			ctx.lineTo(pointparent.left, pointparent.top + pointMargin / 4 * 2.5);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(pointparent.left, pointparent.top + pointMargin / 4 * 2.5);
			ctx.strokeStyle = "#000";
			ctx.lineTo(pointson.left, pointparent.top + pointMargin / 4 * 2.5);
			ctx.stroke();

			var line = new Line(pointson.left, pointparent.top + pointMargin / 4 * 2.5, pointson.left, pointson.top - pointMargin / 3 * 4);
			line.drawWithArrowheads(ctx);
		}

		function pointAbout(pointparent, pointson) {
			if(!pointparent) {
				return false;
			}
			var prevL = pointparent.left;
			var prevT = pointparent.top + pointMargin / 2 // pointparent.top;

			var nextL = pointson.left
			var nextT = pointson.top - pointMargin / 2 //pointson.top

			// create a new line objectx
			var aboutPoint = {
					title: pointson.parentAbout,
					left: nextL, // Math.abs(prevL - nextL )/2+ (prevL >nextL ?  nextL : prevL)   ,
					top: nextT - piceOneHeight / 2 // Math.abs(prevT - nextT )  +  prevT-piceOneHeight / 2,
				}
				//ctx.fillRect()="#000";

			var fillW = aboutPoint.title.length ? aboutPoint.title.length * 10 + smallfillW : 0

			ctx.fillStyle = "#f1f1f1"; //填充的颜色
			ctx.strokeStyle = "#ddd"; //边框颜色
			ctx.linewidth = 10; //边框宽
			//ctx.fillRect(aboutPoint.left - fillW / 2, aboutPoint.top - smallT, fillW, smallHeight); //填充颜色 x y坐标 宽 高
			//ctx.strokeRect(aboutPoint.left - fillW / 2, aboutPoint.top - smallT, fillW, smallHeight) //填充边框 x y坐标 宽 高

			writeText(aboutPoint, smallFontsize + "px Arial" , 90);
			
			if(pointparent.deep>0&&pointparent.deep==pointson.id){
				console.log(pointparent,pointson)
				drawCurve(pointparent,pointson,{left:prevL,top:prevT},{left:nextL,top:nextT-fontSize/2});
			}
		}
		
		function drawCurve(parent,thispoint,parentLT,thispointLT){
			
            ctx.strokeStyle = "rgba(255,0,0,1)";  
	        ctx.beginPath();  
	        ctx.moveTo(thispointLT.left,parentLT.top);  
	        ctx.bezierCurveTo(
	        	thispointLT.left+marginX*15,parentLT.top,
	        	thispointLT.left+marginX*15,thispointLT.top,
	        	thispointLT.left,thispointLT.top
	        );
	        ctx.stroke();
	        
	        ctx.save();
			ctx.beginPath();
			ctx.translate(thispointLT.left,parentLT.top);
			ctx.rotate(-90 * Math.PI / 180);
			ctx.moveTo(0, 0);
			ctx.lineTo(3, 10);
			ctx.lineTo(-3, 10);
			ctx.closePath();
			ctx.fillStyle="#f00";
			ctx.fill();
			ctx.restore();
			
			
	        
	        var aboutdeepPoint = {
				title: parent.deeplog,
				left: thispointLT.left+marginX*12, // Math.abs(prevL - nextL )/2+ (prevL >nextL ?  nextL : prevL)   ,
				top: thispointLT.top - piceOneHeight / 2 + fontSize/2  // Math.abs(prevT - nextT )  +  prevT-piceOneHeight / 2,
			}
			writeText(aboutdeepPoint, smallFontsize + "px Arial" );
		}
		
		// 是否点击某个可展示标签
		if(opt.openTag&&hasClickedTag){
			opt.openTag(hasClickedTag);
		}

	}

	opt.canvasObj.style.width = winW + "px";

	function sortDatas(data, id) {

		data.sort(function(a, b) {
			var num_a = a[id] - 0;
			var num_b = b[id] - 0;
			return num_a - num_b;
		})

		return data;
	}

	function Init() {
		console.log(opt.jsonData);
		getTreaPoint(sortDatas(opt.jsonData, "idNo")); // 开始计算各个点
	}
	Init();

}