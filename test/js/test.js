
window.addEventListener("load",function(){
	
	
	var winW = document.body.clientWidth ;
	
	
	function drawCanvas(data){
		var c = document.getElementById("yun");
		var ctx= c.getContext("2d");
		ctx.fillStyle="#fff";
		ctx.fillRect(0,0,1000,600); 
		
		var maxWidth = 1000 ; // 默认宽度
		var marginX = 20 ; 
		var marginY = 120 ;
		var marginToP = 100 ;
		
		
		ParamEllipse(ctx,500,marginToP-10,data.main.length * 15+30,30);
		 
		writeText(data.main,500,marginToP); // 标题
		
		data.label.forEach(function(v,k){ 
			drawLabel(v,data.label,k,marginToP+30+marginY,maxWidth/2)
		})
		
		function writeText(text,left,top){
			ctx.font="30px Arial";
			ctx.fillStyle="#000";
			ctx.textAlign="center";
			ctx.fillText(text,left,top);
		}
		
		// 绘制节点
		function drawLabel(d,father,k,top,mid){
			
			var thisPoint = getPoint(d,father,k,mid);
			ParamEllipse(ctx,thisPoint.left,top-10,thisPoint.len * 15+30,30);
			writeText(d.text,thisPoint.left,top);
			
			if(d.under&&d.under.length){
				var underTop = top ;
				drawUnder(d.under,underTop,thisPoint.left)
			}
			
			function drawUnder(udata,untop,midt){
				untop += marginY ;
				udata.forEach(function(value,k){
					drawLabel(value,udata,k,untop,midt)
				})
			}
			
		}
		
		
		// 获得当前标签的坐标
		function getPoint(d,fatherdata,k,midpoint){ 
			var startLeft = 0 ,
				allNum= 0 ,
				allWidth = 0 ;
			
			var len = fatherdata.length;
			for(var i=0;i<len;i++){
				var str = fatherdata[i].text;
				var slen = str.length ;
				allNum += slen ;
				console.log(i)
			}
			
			allWidth = (allNum * 15 + 30 * len) * 2 + (len-1) * marginX ;
			startLeft = midpoint - ( allWidth ) / 2 ;
			
			var hash = [];
			var baseL = startLeft ;
			
			for(var j=0;j<len;j++){
				var str = fatherdata[j].text;
				var slen = str.length ;
				var thisW = (slen * 15 + 30)*2 ;
				hash.push( {left : thisW/2 + baseL ,len : slen } ) ;
				baseL += thisW + marginX ;
			}
			
			return hash[k];
		}
		
		
		// 椭圆
		function ParamEllipse(context, x, y, a, b){
		   var step = (a > b) ? 1 / a : 1 / b;
		   context.fillStyle ="#ecd1b6" 
		   context.beginPath();
		   context.moveTo(x + a, y);
		   for (var i = 0; i < 2 * Math.PI; i += step){
		      context.lineTo(x + a * Math.cos(i), y + b * Math.sin(i));
		   }
		   context.fill(); // 背景
		   context.closePath();
		   context.stroke(); // 边缘线
		};
	}
	
	
	drawCanvas(dataTest);
	
	document.getElementById("yun").style.width = winW + "px" ;
	
})


