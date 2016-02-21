var socket = io();
var LightsArray = [0, 0, 0, 0];
var LockState = false;
var currentPage = "";

function gotoPage(x)
{
	currentPage = x;
	$("#pageContent").load(x, function() {
		$("#pageContent").enhanceWithin();
		if (x == 'control.html')
		{
			requestLights();
			$(".switch").click(function() {
				var ob = {};
				ob.Index = $(this).attr('rel');
				ob.State = $(this).prop('checked');
				LightControl(ob);
				console.log(ob);
			});
		}
		else if (x == 'setting.html')
		{
			$("#lockBtn").click(function() {
				LockState = !LockState;
				var arg = "";
				if (LockState)
					arg = "1"
				else
					arg = "0"

				socket.emit("lockChanged", arg);
				if (LockState) 
					$("#lockBtn").text("Désactiver");
				else
					$("#lockBtn").text("Activer");
			});
			$("#serverIpBtn").click(function() {
				setServerIp($("#serverIp").val())
			});

			socket.emit("lockRequest", 1);
			$("#serverIp").val(localStorage.serverIp);

		}
	});
	
}

$(document).ready(function() {
	$("#serverStatus").attr("src","images/red-icon.png");

	$("#houseStatus").attr("src","images/red-icon.png");
	
});

var socket;

initSocket(true);



function changePassword(oldPass, newPass) {
	socket.emit("changePassword", {oldP : oldPass, newP : newPass});
}



function requestLights() {
	socket.emit("lightsArrayRequest", 1);
	
}

function LightControl(obj) {
	socket.emit("lightControl", obj);
}


/*
$("input[type='checkbox']").attr("checked",false).checkboxradio("refresh");


*/
function getTheme() {
	return localStorage.theme;
}

function setServerIp(ip) {
	
	if (ValidateIPaddress(ip))
	{
		localStorage.serverIp = ip;
		initSocket(true);
		console.log("ip changed to " + localStorage.serverIp )
	}
}
function ValidateIPaddress(ipaddress)   
{  
 if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test($("#serverIp").val()))  
  {  
    return (true)  
  }  
alert("Addresse ip incorrect!")  
return (false)  
} 
function passWord() {
	console.log(Password);
	var testV = 1;
	var pass1 = prompt('Entrez votre mot de passe S.V.P',' ');
	while (testV < 3) {
		if (!pass1) 
			history.go(-1);
		if (pass1.toLowerCase() == Password) {
			alert('You Got it Right!');
			break;
		} 
		testV+=1;
		var pass1 = 
		prompt('Access Denied - Password Incorrect, Please Try Again.','Password');
	}
	if (pass1.toLowerCase()!="password" & testV ==3) 
		history.go(-1);
	return " ";
} 
var first = true;
var Password = "";

socket.emit("passwordRequest", true);



function initSocket(__bool){                    
    if(__bool == true){     
            socket = io.connect('http://' + localStorage.serverIp, {secure:false});    
            
           alert("behi");
    }else{
        socket.disconnect();
        // socket = null; <<< We don't need this anymore
    }
    socket.on('connect', function () {
				$("#serverStatus").attr("src","../images/green-icon.png");
			});

			socket.on('disconnect', function () {
				
				$("#serverStatus").attr("src","../images/red-icon.png");
			});
			socket.on("passwordResponse", function (data) {
			console.log("data " + data)
			Password = data;
			if (first)
			{
				passWord();
				first = false;
			}
		})
			socket.on("alarmTriggered", function(data) {

				navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

					if (navigator.vibrate) {
					// vibration API supported
					navigator.vibrate([500, 300, 100]);
					navigator.vibrate([500, 300, 100]);
					}
					alert("Alarme déclenchée !!");
				});
				socket.on("lockChanged", function(data) {
					/*** LOCK CHANGED***/
					LockState = data;
					if (currentPage == "setting.html" && LockState) 
						$("#lockBtn").text("Désactiver");
					else
						$("#lockBtn").text("Activer");
				});

				socket.on("lockResponse", function(data) {
					LockState = data;
					if (LockState)
						$("#lockBtn").text("Désactiver");
					else
						$("#lockBtn").text("Activer");
				})
			socket.on("pwdChange", function(data) {

				if (data.check)
				{
					alert("Mot De Pass changer avec succés");
					Password = data.passWord;
				}
				else
					alert("Ancien Mot De Pass incorrect!");
			});
			socket.on("lightsResponse", function(data) {
			LightsArray = data;
			var x = $(".switch");
			$(".switch").each(function (index) {
				$(this).prop("checked", LightsArray[index]);
			});
			$(".switch").checkboxradio("refresh");
			console.log("server responded lights data " + LightsArray)
		});

		socket.on("systemConnection", function(data) {
			if (data)
				$("#houseStatus").attr("src","../images/green-icon.png");
			else
				$("#houseStatus").attr("src","../images/red-icon.png");
		} );
} 