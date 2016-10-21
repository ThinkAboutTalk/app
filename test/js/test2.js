
window.addEventListener("load",function(){
	
	var winW = document.body.clientWidth ;
	
	var maxWidth = 1000 ; // 默认canvas宽度
	var marginX = 60 ; // 标签横间距
	var marginY = 120 ; // 标签竖间距
	var marginToP = 50 ; // 单元竖向 间距
	var fontSize = 30 ; // 字体大小
	var fontWidth = 15;  // 每个字符对应宽度
	var pointMargin = 30 ; // 标签内部填充
	var piceOneHeight = fontSize + 30 + marginToP ; //标签高度
	
	
	function getTreaPoint(data){ // 获取数据对应关系，确定每条数据对应的点和其父级的点
		
		var hash = {
			tree : {}, // 记录点的信息
			readyId : [], // 记录完成的点
			headId : [] // 记录顶点
		}
		
		function getPartPoint(){
			
			data.forEach(function(value,index){
				var _id = value['idNo'];
				var _parentId = value['FH'];
				var _title =  value['expression'];
				var point = {
						id : _id ,
						title : _title,
						left : 0 ,
						top : 0 ,
						width : _title.length * fontWidth + pointMargin ,
						height : piceOneHeight ,
						parentId : _parentId ,
						heightAdded : false,
						sonIds : []
				}
				if(_parentId==""){ // 顶元素
					var thisPoint = hash.tree[_id] || point ;
					thisPoint.heightAdded = false;
					//console.log(_id,thisPoint.height,piceOneHeight)
					thisPoint.left = maxWidth/2 ;
					thisPoint.top = marginToP ;
					var t_index = hash.headId.indexOf(_id) ;
					if(t_index!=-1){
						var prevHeight =0, prevTop = 0 ;
						if(t_index!=0){
							prevHeight = hash.tree[hash.headId[t_index-1]].height ;
							prevTop = hash.tree[hash.headId[t_index-1]].top ;
						}
						thisPoint.top = marginToP + prevHeight + prevTop ;
					}else{
						hash.headId.push(_id) // 记录顶点
					}
					hash.tree[_id] = thisPoint ;
					reCumTrees();
					hash.readyId.push(_id) // 此点完成
				}else{ // 非顶点
					var thisPoint = hash.tree[_id] || point ;
					var parent = hash.tree[_parentId];
					console.log(thisPoint.id ,parent)
					if(parent){
						if(parent.sonIds.indexOf(_id)==-1){parent.sonIds.push(_id)};
						
						thisPoint.top = parent.top + marginToP + 30 ;
						thisPoint.left = getThisLeft(thisPoint);
						hash.tree[_id] = thisPoint ;
						
						addParentHeight(thisPoint);
						addParentWidth(thisPoint);
						reCumTrees();
						
						hash.readyId.push(_id) // 此点完成
					}else{
						
					}
				}
			})
			
			
			
			
			function reCumTrees(){ // 向下计算子元素
				for(var i =0;i< hash.headId.length;i++){
					getSonsPoint(hash.tree[hash.headId[i]]);
				}
				
				function getSonsPoint(point){ // 计算子标签left、heigth ;
					//console.log(point.id,hash.headId.indexOf(point.id))
						
						var middle = point.left ;
						var top = point.top ;
						var width = point.width;
						
						if(point.sonIds.length==1){
							///console.log(startLeft,middle)
						}
						
						var sonW = 0 ;
						for(var k = 0; k< point.sonIds.length;k++){
							sonW += hash.tree[ point.sonIds[k] ].width + (k==0?0:marginX) ;
						}
						//console.log(point,sonW,width)
						if(sonW<width){
							width = sonW ;
						}
						
						var startLeft =  middle - ( width / 2 ) ;
						
						for(var j = 0; j< point.sonIds.length;j++){
							var thisW = hash.tree[ point.sonIds[j] ].width;

							hash.tree[ point.sonIds[j] ].left = startLeft +  thisW/2 ;
							hash.tree[ point.sonIds[j] ].top = top + piceOneHeight ;
							startLeft += hash.tree[ point.sonIds[j] ].width + marginX;
							//console.log(top,hash.tree[ point.sonIds[j] ].top)
								
						}
					
					
					for(var i = 0; i< point.sonIds.length;i++){
						getSonsPoint(hash.tree[point.sonIds[i]]);	
					}
				}
			}
			
			
			function addParentHeight(point){ // 向上成长父级高度
				//console.log(point.id,point.parentId)
				if(point.parentId){
					var parentPoint = hash.tree[point.parentId] ;
					if(!parentPoint.heightAdded){
						parentPoint.height += piceOneHeight ;
						parentPoint.heightAdded = true ;
					}
					addParentHeight(parentPoint);
				}
			}
			
			function getThisLeft(point){
				//console.log(point)
				
				return 500;
			}
			
			function addParentWidth(point){  // 向上成长父级宽度
				if(point&&point.parentId){
					var pointParent = hash.tree[point.parentId] ;
					//console.log(pointParent)
					var width = 0 ;
					//console.log(point.id,"to:",pointParent.id)
					for(var i=0;i< pointParent.sonIds.length;i++){
						var id = pointParent.sonIds[i];
						//console.log(hash.tree[id].width)
						width += hash.tree[id].width + ( i==0?0:marginX ) ;
					}
					//console.log(pointParent.id,pointParent.width,width)
					if(pointParent.width<width){
						pointParent.width = width ;
					}
					//console.log(pointParent.id,pointParent.width)
					addParentWidth(hash.tree[pointParent.parentId]);
				}
			}
			
			if(!testAllPointReady()){ 
				getPartPoint();
			}else {
				//console.log(hash)
				drawTree(hash);
			}
		}
		
		function testAllPointReady(){  // 确认所有点计算完毕
			var has = true ;
			data.forEach(function(value,index){
				var _id = value['idNo'];
				if(hash.readyId.indexOf(_id)==-1){
					has = false;
					return ;
				}
			})
			return has;
		}
		
		getPartPoint();
	}
	
	
	
	
	
	function  drawTree(hash){ // 开始绘制
		console.log(hash)
		var lastPointId = hash.headId[hash.headId.length-1] ;
		
		var offsetH = hash.tree[lastPointId].top + hash.tree[lastPointId].height ;
		var c = document.getElementById("yun");
		c.height = offsetH 
		
		
		var ctx= c.getContext("2d");
		ctx.fillStyle="#fff";
		ctx.fillRect(0,0,1000,offsetH); 
		
		for(point in hash.tree){
			//console.log(22222,hash.tree[point])
			writeText(hash.tree[point])
		}
		
		function writeText(point){
			ctx.font="30px Arial";
			ctx.fillStyle="#000";
			ctx.textAlign="center";
			ctx.fillText(point.title,point.left,point.top);
		}
		
	}
	
	document.getElementById("yun").style.width = winW + "px" ;
	
	getTreaPoint(testJson); // 开始计算各个点
	
})


