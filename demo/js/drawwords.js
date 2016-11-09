function drawWords(canvasObj, parentObj, jsonData) {

	var clickPosition;
	canvasObj.addEventListener('click', function(e) {
		clickPosition = getEventPosition(e);
		Init();
	}, false);

	var winW = parentObj.offsetWidth;

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
				var _id = value['idNo'];
				var _parentId = value['FH'];
				var _title = value['expression'];
				var point = {
					id: _id,
					title: _title,
					left: 0,
					top: 0,
					parentAbout: value['log'],
					width: _title.length * fontWidth + pointMargin,
					height: piceOneHeight,
					parentId: _parentId,
					heightAdded: false,
					sonIds: []
				}
				if(_parentId == "") { // 顶元素
					var thisPoint = hash.tree[_id] || point;
					thisPoint.heightAdded = false;
					//console.log(_id,thisPoint.height,piceOneHeight)
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
					//console.log(thisPoint.id ,parent)
					if(parent) {
						if(parent.sonIds.indexOf(_id) == -1) {
							parent.sonIds.push(_id)
						};

						thisPoint.top = parent.top + marginX + 30;
						thisPoint.left = 0;
						hash.tree[_id] = thisPoint;

						addParentHeight(thisPoint);
						addParentWidth(thisPoint);
						reCumTrees();

						hash.readyId.push(_id) // 此点完成
					} else {

					}
				}
			})

			function reCumTrees() { // 向下计算子元素
				for(var i = 0; i < hash.headId.length; i++) {
					getSonsPoint(hash.tree[hash.headId[i]]);
				}

				function getSonsPoint(point) { // 计算子标签left、heigth ;
					//console.log(point.id,hash.headId.indexOf(point.id))

					point.sonIds.sort(function(a, b) {
						return a - b;
					})

					var middle = point.left;
					var top = point.top;
					var width = point.width;

					if(point.sonIds.length == 1) {
						///console.log(startLeft,middle)
					}

					var sonW = 0;
					for(var k = 0; k < point.sonIds.length; k++) {
						sonW += hash.tree[point.sonIds[k]].width + (k == 0 ? 0 : marginX);
					}
					//console.log(point,sonW,width)
					if(sonW < width) {
						width = sonW;
					}

					var startLeft = middle - (width / 2);

					for(var j = 0; j < point.sonIds.length; j++) {
						var thisW = hash.tree[point.sonIds[j]].width;

						hash.tree[point.sonIds[j]].left = startLeft + thisW / 2;
						hash.tree[point.sonIds[j]].top = top + piceOneHeight;
						startLeft += hash.tree[point.sonIds[j]].width + marginX;
						//console.log(top,hash.tree[ point.sonIds[j] ].top)

					}

					for(var i = 0; i < point.sonIds.length; i++) {
						getSonsPoint(hash.tree[point.sonIds[i]]);
					}
				}
			}

			function addParentHeight(point) { // 向上成长父级高度
				//console.log(point.id,point.parentId)
				if(point.parentId) {
					var parentPoint = hash.tree[point.parentId];
					if(!parentPoint.heightAdded) {
						parentPoint.height += piceOneHeight;
						parentPoint.heightAdded = true;
					}
					addParentHeight(parentPoint);
				}
			}

			function getThisLeft(point) {
				//console.log(point)

				return 500;
			}

			function addParentWidth(point) { // 向上成长父级宽度
				if(point && point.parentId) {
					var pointParent = hash.tree[point.parentId];
					//console.log(pointParent)
					var width = 0;
					//console.log(point.id,"to:",pointParent.id)
					for(var i = 0; i < pointParent.sonIds.length; i++) {
						var id = pointParent.sonIds[i];
						//console.log(hash.tree[id].width)
						width += hash.tree[id].width + (i == 0 ? 0 : marginX);
					}
					//console.log(pointParent.id,pointParent.width,width)
					if(pointParent.width < width) {
						pointParent.width = width;
					}
					//console.log(pointParent.id,pointParent.width)
					addParentWidth(hash.tree[pointParent.parentId]);
				}
			}

			if(!testAllPointReady()) { // 所有点并未计算完毕
				getPartPoint();
			} else if(testMaxWidthUseful()) { // 宽度不超出画布
				drawTree(hash);
			} else { // 超出了画布
				getTreaPoint(data);
			}
		}

		function testAllPointReady() { // 确认所有点计算完毕
			var has = true;
			data.forEach(function(value, index) {
				var _id = value['idNo'];
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

	function getEventPosition(ev) {
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

	function Line(x1, y1, x2, y2) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	}
	Line.prototype.drawWithArrowheads = function(ctx) {

		// arbitrary styling
		ctx.strokeStyle = "#999";
		ctx.fillStyle = "#333";
		ctx.lineWidth = 1;

		// draw the line
		ctx.beginPath();
		ctx.moveTo(this.x1, this.y1);
		ctx.lineTo(this.x2, this.y2);
		ctx.stroke();

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

	function drawTree(hash) { // 开始绘制
		console.log(hash)
		var lastPointId = hash.headId[hash.headId.length - 1];

		var offsetH = hash.tree[lastPointId].top + hash.tree[lastPointId].height;
		var c = canvasObj;
		c.height = offsetH

		var ctx = c.getContext("2d");
		ctx.fillStyle = "#fff";
		ctx.fillRect(0, 0, 1000, offsetH);

		//字符
		for(point in hash.tree) {
			//console.log(22222,hash.tree[point])
			writeText(hash.tree[point])
		}

		// 关系线
		for(point in hash.tree) {
			//console.log(22222,hash.tree[point])
			drawLines(hash.tree[hash.tree[point].parentId], hash.tree[point])
		}

		//关系节点说明
		for(point in hash.tree) {
			//console.log(22222,hash.tree[point])
			pointAbout(hash.tree[hash.tree[point].parentId], hash.tree[point])
		}

		function writeText(point, font) {
			ctx.font = font || fontSize + "px Arial";
			ctx.fillStyle = "#000";
			if(clickPosition&&makeSureThispoint(clickPosition)) {
				ctx.fillStyle = "#f00";
			}
			ctx.textAlign = "center";
			ctx.fillText(point.title, point.left, point.top);
			
			function makeSureThispoint(position){
				var maxT = point.top + fontSize/2 + pointMargin/2 ,
				minT = point.top - fontSize/2 - pointMargin/2,
				maxW = point.left + (point.title.length * fontSize)/2 + pointMargin /2,
				minW = point.left - (point.title.length * fontSize)/2 - pointMargin /2 ;
				
				if(position.x < maxW &&position.x > minW && position.y < maxT &&position.y > minT ){
					
					return true ;
				}else{
					return false;
				}
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
			ctx.moveTo(pointparent.left, pointparent.top + pointMargin / 3);
			ctx.lineTo(pointparent.left, pointparent.top + pointMargin / 4 * 3);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(pointparent.left, pointparent.top + pointMargin / 4 * 3);
			ctx.strokeStyle = "#000";
			ctx.lineTo(pointson.left, pointparent.top + pointMargin / 4 * 3);
			ctx.stroke();

			var line = new Line(pointson.left, pointparent.top + pointMargin / 4 * 3, pointson.left, pointson.top - pointMargin / 3 * 4);
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
					top: nextT - piceOneHeight / 2.4 // Math.abs(prevT - nextT )  +  prevT-piceOneHeight / 2,
				}
				//ctx.fillRect()="#000";

			var fillW = aboutPoint.title.length ? aboutPoint.title.length * 10 + smallfillW : 0

			ctx.fillStyle = "#f1f1f1"; //填充的颜色
			ctx.strokeStyle = "#ddd"; //边框颜色
			ctx.linewidth = 10; //边框宽
			ctx.fillRect(aboutPoint.left - fillW / 2, aboutPoint.top - smallT, fillW, smallHeight); //填充颜色 x y坐标 宽 高
			ctx.strokeRect(aboutPoint.left - fillW / 2, aboutPoint.top - smallT, fillW, smallHeight) //填充边框 x y坐标 宽 高

			writeText(aboutPoint, smallFontsize + "px Arial");
		}

	}

	canvasObj.style.width = winW + "px";

	function sortDatas(data, id) {

		data.sort(function(a, b) {
			var num_a = a[id] - 0;
			var num_b = b[id] - 0;
			return num_a - num_b;
		})

		return data;
	}

	function Init() {
		getTreaPoint(sortDatas(jsonData, "idNo")); // 开始计算各个点
	}
	Init();

}