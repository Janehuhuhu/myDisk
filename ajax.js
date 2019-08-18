// ajax

export default function(json){
	if(window.XMLHttpRequest){
		var ajax=new XMLHttpRequest();
	}
	else{
		var ajax=new ActiveXObject('Microsoft.XMLHTTP');
	}
	
	if(json.type=='get'){
		ajax.open('get',json.url+'?'+jsToStr(json.data),true);
		ajax.send();
	}
	else{
		ajax.open('post',json.url,true);
		ajax.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		ajax.send(jsToStr(json.data));
	}
	
	ajax.onreadystatechange=function(){
		if(ajax.readyState==4){
			if(ajax.status>=200&&ajax.status<300||ajax.status==304){
				json.success(ajax.responseText);
			}
			else{
				json.err&&json.err();
			}
		}
	}
	
	function jsToStr(json){
		var arr=[];
		for(var i in json){
			arr.push(i+'='+json[i]);
		}
		return arr.join('&');
	}
}