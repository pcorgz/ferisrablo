var moves = {runing : 1, jumping: 2, random: 3};
var shots = {oneShootOneBullet : 1, continusShoot: 2};
var config = {
	hp : 100,
	redHit : 20,
	yelHit : 40,
	WitHit : 80,
	spawnSpeedMs : 2000,
	MoveSpeed : 1500,
	timeAlive : 3000,
	MoveType : moves.random,
	shootType : shots.oneShootOneBullet,
	continusShootsPerSecond : 5,
	numberofJumps : 10
};
var continushit = {targetRed: null, targetYell : null,targetWit : null};

// $(document).ready(function (){});
// setInterval(function(){	});

$(document).on('click', '.target', function(e) {
	if(config.shootType == shots.oneShootOneBullet){
		showNewHp(this);
	}
	e.stopPropagation();
});

$(document).on('mouseover', '.target', function(e) {
	if(config.shootType == shots.continusShoot){
		target = this;
		if($(this).hasClass("targetRed")) {
			clearInterval(continushit.targetYell);
			clearInterval(continushit.targetWit);
			continushit.targetRed = setInterval(function(){	showNewHp(target); },1000/config.continusShootsPerSecond);
			}
		if($(this).hasClass("targetYell")){
			clearInterval(continushit.targetRed);
			clearInterval(continushit.targetWit);
			continushit.targetYell = setInterval(function(){	showNewHp(target); },1000/config.continusShootsPerSecond);
			}
		if($(this).hasClass("targetWit")){
			clearInterval(continushit.targetRed);
			clearInterval(continushit.targetYell);
			continushit.targetWit = setInterval(function(){	showNewHp(target); },1000/config.continusShootsPerSecond);
			}
	}
	e.stopPropagation();
});

$(document).on('mouseleave', '.target', function(e) {
	if(config.shootType == shots.continusShoot){
		if($(this).hasClass("targetRed")){
			clearInterval(continushit.targetRed);
		}
		if($(this).hasClass("targetYell")){
			clearInterval(continushit.targetYell);
		}
		if($(this).hasClass("targetWit")){
			clearInterval(continushit.targetWit);
		}
	}
	console.log("dejamos de golpear :c!!");
	e.stopPropagation();
});

function daleMuchos(){
	createTarget();
	setInterval(function(){	createTarget(); },config.spawnSpeedMs);
}

function showNewHp(elem){

	$(elem).data("targetObj").iveBeebHit($(elem).data("pts"));
	$(elem).data("targetObj").animHitPts($(elem));
	if($(elem).data("targetObj").dead)
		$(elem).data("targetObj").redParent.remove();
}

function createTarget(){

	targetObj = {};
	targetObj.dead = false;
	targetObj.hp = config.hp;
	targetObj.timeHitPtsExist = 300;
	targetObj.MoveType = (config.MoveType == moves.random ? Math.floor((Math.random() * (moves.random - 1)) + 1) : config.MoveType);
	targetObj.iveBeebHit = function(ptsHitend){
		$("#total_damage_done").val((($("#total_damage_done").val()/1) + ptsHitend));
		this.hp = this.hp - ptsHitend;
		if(this.hp <= 0)
		this.dead = true;
	};
	$("#total_hp_created").val((($("#total_hp_created").val()/1) + config.hp));
	
	targetObj.animHitPts = function (elem){
		if(elem.hasClass("targetRed")) var position = elem.position();
		if(elem.parent().hasClass("targetRed")) var position = elem.parent().position();
		if(elem.parent().parent().hasClass("targetRed")) var position = elem.parent().parent().position();
		
		var h = $(document.createElement("span")).addClass("hitPts");
		h.css("top", position.top - 20);
		h.css("left", position.left + 10);
		
		h.text("-"+elem.data("pts"));
		
		$("body").append(h);
		
		h.animate({top: position.top - 20 - 40}, targetObj.timeHitPtsExist);
		setTimeout(function(){h.remove();},targetObj.timeHitPtsExist);
		
	}

	
	var r = $(document.createElement("div")).addClass("targetRed").addClass("target").data("targetObj",targetObj).data("pts",config.redHit);
	var y = $(document.createElement("div")).addClass("targetYell").addClass("target").data("targetObj",targetObj).data("pts",config.yelHit);
	var w = $(document.createElement("div")).addClass("targetWit").addClass("target").data("targetObj",targetObj).data("pts",config.WitHit);
	// r.draggable();
	targetObj.redParent = r;
	
	y.append(w);
	r.append(y);
	
	var randPos = getRandomPosition();
	r.css("top",randPos.top);
	r.css("left",randPos.left);
	
	$("body").append(r);
	
	
	switch(targetObj.MoveType){
		case moves.runing:
			var randPosAnim = getRandomPosition();
			r.animate({top: randPosAnim.top, left: randPosAnim.left}, config.MoveSpeed, "linear");
		break; 
		case moves.jumping: 
			for(var i = 0; i < config.numberofJumps; i++)
				animateJumping(r);
		break;
	}
	
	setTimeout(function(){r.remove();},config.timeAlive);
}

function animateJumping(r){

			var randPos = r.position();
			var jumpSize = 30;
			var moveSideSize = 20; //max es de 500 (50*10)
			var animsteps = 2;
			var animSpeed = config.MoveSpeed/config.numberofJumps/animsteps;
			var side = ( randTrueOrFalse() ? 1 : -1);
			
			if((randPos.left - moveSideSize*animsteps) <  0 ){
				side = 1; //si el salto a la izquierda SI se sale de la pantalla, entonces saltamos forsosamente a la derecha
			}
			if((randPos.left + moveSideSize*animsteps) >  window.innerWidth ){
				side = -1; //si el salto a la derecha SI se sale de la pantalla, entonces saltamos forsosamente a la izquierda
			}
			
			moveSideSize = moveSideSize * side;
			r.animate({top: randPos.top - jumpSize*2, left: randPos.left + moveSideSize*1}, animSpeed, "linear");
			r.animate({top: randPos.top - jumpSize*3, left: randPos.left + moveSideSize*2}, animSpeed, "linear");
			r.animate({top: randPos.top - jumpSize*3.5, left: randPos.left + moveSideSize*3}, animSpeed, "linear");
			r.animate({top: randPos.top - jumpSize*3.8, left: randPos.left + moveSideSize*4}, animSpeed, "linear");
			r.animate({top: randPos.top - jumpSize*4, left: randPos.left + moveSideSize*5}, animSpeed, "linear");
			r.animate({top: randPos.top - jumpSize*3.8, left: randPos.left + moveSideSize*6}, animSpeed, "linear");
			r.animate({top: randPos.top - jumpSize*3.5, left: randPos.left + moveSideSize*7}, animSpeed, "linear");
			r.animate({top: randPos.top - jumpSize*3, left: randPos.left + moveSideSize*8}, animSpeed, "linear");
			r.animate({top: randPos.top - jumpSize*2, left: randPos.left + moveSideSize*9}, animSpeed, "linear");
			r.animate({top: randPos.top, left: randPos.left + moveSideSize*10}, animSpeed, "linear");
			
			r.css("top",randPos.top);
			r.css("left",randPos.left + moveSideSize*10);
}
function getRandomPosition(maxTop,MaxLeft){
	var p = {};

	if(maxTop == null || MaxLeft == null || maxTop == undefined || MaxLeft == undefined ){
		p.left = Math.floor((Math.random() * (window.innerWidth)) + 1);
		p.top = Math.floor((Math.random() * (window.innerHeight)) + 1);
	}
	else{
		p.left = Math.floor((Math.random() * (MaxLeft)) + 1);
		p.top = Math.floor((Math.random() * (maxTop)) + 1);
	}
	return p;
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function randTrueOrFalse(){
	if(Math.floor((Math.random() * 2) + 1) == 1)
		return true;
	else
		return false;
}










