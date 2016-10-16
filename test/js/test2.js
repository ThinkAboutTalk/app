
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
			var treeData = [];
			data.forEach(function(value,index){
				var _id = value['idNo'];
				var _parentId = value['FH'];
				var _title =  value['expression'];
				var point = {
					thispoint : {
						id : _id ,
						title : _title,
						left : 0 ,
						top : 0 ,
						width : _title.length * fontWidth + pointMargin ,
						height : piceOneHeight ,
						parentId : _parentId ,
						heightAdded : false
					},
					parent : {}
				}
				if(_parentId==""){ // 顶元素
					point.thispoint.left = maxWidth/2 ;
					point.thispoint.top = marginToP ;
					var t_index = hash.headId.indexOf(_id) ;
					if(t_index>0){ 
						point.thispoint.top = marginToP + hash.tree[hash.headId[t_index-1]].height + hash.tree[hash.headId[t_index-1]].top ;
					}
					hash.tree[_id] = point.thispoint ;
					hash.headId.push(_id) // 记录顶点
					hash.readyId.push(_id) // 此点完成
				}else{ // 非顶点
					point.parent = getParentPoint(_parentId);
					if(point.parent){
						point.thispoint.top = point.parent.top + marginToP ;
						addParentHeight(point.thispoint)
						hash.tree[_id] = point.thispoint ;
						hash.readyId.push(_id) // 此点完成
					}
				}
				
				treeData.push(point);
			})
			
			function getParentPoint(id){ // 获取父级节点
				for(i in hash.tree){
					if(i==id){
						return hash.tree[i];
					}
				}
				return null ;
			}
			
			function addParentHeight(point){ // 递归成长父级高度
				if(point.parentId){
					var parentPoint = hash.tree[point.parentId] ;
					if(!parentPoint.heightAdded){
						parentPoint.height += piceOneHeight ;
						parentPoint.heightAdded = true ;
					}
					addParentHeight(parentPoint);
				}
			}
			
			if(!testAllPointReady()){ 
				getPartPoint();
			}else {
				drawTree(treeData,hash) ;
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
	
	
	
	
	
	function  drawTree(data,hash){ // 开始绘制
		console.table(data);
		
		var lastPointId = hash.headId[hash.headId.length-1] ;
		var offsetH = hash.tree[lastPointId].top + hash.tree[lastPointId].height ;
		var c = document.getElementById("yun");
		c.height = offsetH 
		
		
		var ctx= c.getContext("2d");
		ctx.fillStyle="#fff";
		ctx.fillRect(0,0,1000,offsetH); 
		
		data.forEach(function(point,index){
			writeText(point.thispoint)
		})
		
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


