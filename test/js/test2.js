
window.addEventListener("load",function(){
	
	var winW = document.body.clientWidth ;
	
	var maxWidth = 1000 ; // 默认宽度
	var marginX = 20 ;
	var marginY = 120 ;
	var marginToP = 50 ;
	var fontSize = 30 ;
	var fontWidth = 15;
	var pointMargin = 30 ;
	var piceOneHeight = fontSize + 30 + marginToP ; 
	
	
	function getTreaPoint(data){ // 获取数据对应关系，确定每条数据对应的点和其父级的点
		
		var hash = {
			tree : {},
			readyId : [],
			headId : []
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
					hash.readyId.push(_id) // 此点完成
				}else{ // 非顶点
					var parent = getTreePoint(_parentId);
					if(parent){
						if(parent.sonIds.indexOf(_id)==-1){parent.sonIds.push(_id)};
						point.top = parent.top + marginToP ;
						
						addParentHeight(point);
						addParentWidth(point);
						
						hash.tree[_id] = point ;
						
						point.left = getThisLeft(point);
						hash.readyId.push(_id) // 此点完成
					}
				}
			})
			
			
			if(!testAllPointReady()){ 
				getPartPoint();
			}else {
				//console.log(hash)
				drawTree(hash);
			}
			
			function getTreePoint(id){ // 获取父级节点
				return hash.tree[id] || null ;
			}
			
			function addParentHeight(point){ // 成长父级高度
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
			
			function addParentWidth(point){  // 成长父级宽度
				if(point&&point.parentId){
					var pointParent = hash.tree[point.parentId] ;
					
					for(var i=0;i< pointParent.sonIds.length;i++){
						var id = pointParent.sonIds[i]
						console.log(point.id,pointParent.sonIds,id)
						//console.log(hash.tree[id])
					}
					
					addParentWidth(hash.tree[pointParent.parentId]);
				}
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
		//console.log(hash)
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


