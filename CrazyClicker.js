Game.registerMod("cookie automation",{
	init:function(){
		Game.Notify("Automation Mod Enabled!","",[16,5],6);

		l('versionNumber').remove();
		var MOD=this;

		this.config = {
			"oneMind": false,
			"autoClickGoldenCookie": false,
			"autoClickWrathCookie": false,
			"autoClickBigCookie": false,
			"heraldsEnabled": false,
			"autoCollectWrinklers": false,
			"autoCastSpell": false,
			"autoFortuneNews": false,
			"autoDragon": false,
			"autoBuy": false,
		}

		// Auto click golden cookies
		var autoClickGoldenCookie = null;

		function switchAutoClickGoldenCookie(){
			if(autoClickGoldenCookie){
				clearInterval(autoClickGoldenCookie);
				autoClickGoldenCookie = null;
				Game.Notify("Golden Cookie Auto Click Disabled.","",[16,5],3);
			}else{
				autoClickGoldenCookie = setInterval(function() {
					Game.shimmers.forEach(function(shimmer){
	    				if((shimmer.type == "golden" && shimmer.wrath == 0) || shimmer.type == "reindeer"){
	        				shimmer.pop()
	    				}
					})
				}, 500);
				Game.Notify("Golden Cookie Auto Click Enabled.","",[16,5],3);
			}
			updateInfo();
		}

		// Auto click wrath cookies
		var autoClickWrathCookie = null;

		function switchAutoClickWrathCookie(){
			if(autoClickWrathCookie){
				clearInterval(autoClickWrathCookie);
				autoClickWrathCookie = null;
				Game.Notify("Wrath Cookie Auto Click Disabled.","",[16,5],3);
			}else{
				autoClickWrathCookie = setInterval(function() {
					Game.shimmers.forEach(function(shimmer){
	    				if(shimmer.type == "golden" && shimmer.wrath == 1){
	        				shimmer.pop()
	    				}
					})
				}, 500);
				Game.Notify("Wrath Cookie Auto Click Enabled.","",[16,5],3);
			}
			updateInfo();
		}

		// Auto click big cookie
		var autoClickBigCookie = null;
		var cookie = l('bigCookie');
		var event = new MouseEvent('click', {
			detail: 1
		});

		function switchAutoClickBigCookie(){
			if(autoClickBigCookie){
				clearInterval(autoClickBigCookie);
				autoClickBigCookie = null;
				Game.Notify("Big Cookie Auto Click Disabled.","",[16,5],3);
			}else{
				autoClickBigCookie = setInterval(function(){
					cookie.dispatchEvent(event);
					Game.autoclickerDetected = 0;
				}, 100);
				Game.Notify("Big Cookie Auto Click Enabled.","",[16,5],3);
			}
			updateInfo();
		}

		// Maximize heralds
		var heraldsEnabled = false;

		function switchHeralds(){
			if(heraldsEnabled){
				Game.GrabData=function(){
					if (!App) ajax('/patreon/grab.php',Game.GrabDataResponse);
					else App.grabData(function(res){
						Game.heralds=res?(res.playersN||1):1;
						Game.heralds=Math.max(0,Math.min(100,Math.ceil(Game.heralds/100*100)/100));
						l('heraldsAmount').textContent=Game.heralds;
					});
				}
				Game.Notify("Max Heralds Disabled.","",[16,5],3);
				heraldsEnabled = false;
			}else{
				Game.GrabData=function(){
					if (!App) ajax('/patreon/grab.php',Game.GrabDataResponse);
					else App.grabData(function(res){
						Game.heralds=res?(res.playersN||1):1;
						Game.heralds=100;
						l('heraldsAmount').textContent=Game.heralds;
					});
				}
				Game.Notify("Max Heralds Enabled.","",[16,5],3);
				heraldsEnabled = true;
			}
			Game.GrabData();
			updateInfo();
		}

		// Auto collect wrinklers
		var autoCollectWrinklers = null;

		function switchAutoCollectWrinklers(){
			if(autoCollectWrinklers){
				clearInterval(autoCollectWrinklers);
				autoCollectWrinklers = null;
				Game.Notify("Wrinklers Auto Collect Disabled.","",[16,5],3);
			}else{
				autoCollectWrinklers = setInterval(function(){
					for(var i = 0; i < Game.getWrinklersMax(); i++){
						if(Game.wrinklers[i].phase != 2){
							return false;
						}
					}
					Game.CollectWrinklers();
				}, 500)
				Game.Notify("Wrinklers Auto Collect Enabled.","",[16,5],3);
			}
			updateInfo();
		}

		// Auto cast spell
		var autoCastSpell = null;

		function switchAutoCastSpell(){
			if(autoCastSpell){
				clearInterval(autoCastSpell);
				autoCastSpell = null;
				Game.Notify("Spell Auto Cast Disabled.","",[16,5],3);
			}else{
				autoCastSpell = setInterval(function(){
					var minigame = Game.ObjectsById[7].minigame;
					if(minigame && minigame.magic == minigame.magicM){
						minigame.castSpell(minigame.spellsById[1]);
					}
				}, 500)
				Game.Notify("Spell Auto Cast Enabled.","",[16,5],3);
			}
			updateInfo();
		}

		// Auto fortune news
		var autoFortuneNews = null;

		function switchAutoFortuneNews(){
			if(autoFortuneNews){
				clearInterval(autoFortuneNews);
				autoFortuneNews = null;
				Game.Notify("Fortune News Disabled.","",[16,5],3);
			}else{
				autoFortuneNews = setInterval(function(){
					if (Game.TickerEffect && Game.TickerEffect.type=='fortune'){
						Game.tickerL.dispatchEvent(event);
					}
				}, 500)
				Game.Notify("Fortune News Enabled.","",[16,5],3);
			}
			updateInfo();
		}

		// Auto dragon
		var autoDragon = null;

		function switchAutoDragon(){
			if(autoDragon){
				clearInterval(autoDragon);
				autoDragon = null;
				Game.Notify("Auto Dragon Disabled.","",[16,5],3);
			}else{
				autoDragon = setInterval(function(){
					if (Game.dragonLevel<5)
					{
						if(Game.dragonLevels[Game.dragonLevel].cost()){
							PlaySound('snd/shimmerClick.mp3');
							Game.dragonLevels[Game.dragonLevel].buy();
							Game.dragonLevel=(Game.dragonLevel+1)%Game.dragonLevels.length;
							
							if (Game.dragonLevel>=Game.dragonLevels.length-1) Game.Win('Here be dragon');
							Game.recalculateGains=1;
							Game.upgradesToRebuild=1;
						}
					}else{
						Game.dragonAura = 1;
					}
				}, 500)
				Game.Notify("Auto Dragon Enabled.","",[16,5],3);
			}
			updateInfo();
		}

		// Auto buy
		var autoBuy = null;
		var oneMind = false;

		function switchAutoBuy(){
			if(autoBuy){
				clearInterval(autoBuy);
				autoBuy = null;
				Game.Notify("Auto Buy Disabled.","",[16,5],3);
			}else{
				autoBuy = setInterval(function(){
					var toBuy = null;
					var maxRatio = 0;

					for(var i in Game.Objects){
						var obj = Game.Objects[i];
						var ratio = obj.cps(obj) / obj.price;
						if(ratio > maxRatio){
							toBuy = obj;
							maxRatio = ratio;
						}
					}

					for (var i in Game.UpgradesInStore){
						var obj = Game.UpgradesInStore[i];
						if(obj.pool != 'toggle' && obj.getPrice() < Game.cookies){
							if(obj.name == "Communal brainsweep" || obj.name == "Elder Pact" || obj.name == "Elder Pledge" || obj.name == "Elder Covenant" || obj.name == "Revoke Elder Covenant"){
								continue;
							}if(obj.name == "One mind" && oneMind){
								obj.buy();
								l('promptOption0').dispatchEvent(event);
							}else{
								obj.buy();
							}
						}
					}

					if(toBuy.getPrice(1) < Game.cookies){
						toBuy.buy(1);
					}
				}, 10)
				Game.Notify("Auto Buy Enabled.","",[16,5],3);
			}
			updateInfo();
		}

		// One mind
		function switchOneMind(){
			if(oneMind){
				Game.Notify("Research One Mind Disabled.","",[16,5],3);
			}else{
				Game.Notify("Research One Mind Enabled.","",[16,5],3);
			}
			oneMind = !oneMind;
		    updateInfo();
		}

		function switchAll(val){
			if((autoClickGoldenCookie == null) == val){
				switchAutoClickGoldenCookie();
			}
			if((autoClickWrathCookie == null) == val){
				switchAutoClickWrathCookie();
			}
			if((autoClickBigCookie == null) == val){
				switchAutoClickBigCookie();
			}
			if(heraldsEnabled != val){
				switchHeralds();
			}
			if((autoCollectWrinklers == null) == val){
				switchAutoCollectWrinklers();
			}
			if((autoCastSpell == null) == val){
				switchAutoCastSpell();
			}
			if((autoFortuneNews == null) == val){
				switchAutoFortuneNews();
			}
			if((autoDragon == null) == val){
				switchAutoDragon();
			}
			if((autoBuy == null) == val){
				switchAutoBuy();
			}
			if(oneMind != val){
				switchOneMind();
			}
		}

		document.onkeydown = function (e) {
			if (e && (e.key == "+" || e.key == "=")) {
		        switchAll(true);
		    }
		    if (e && (e.key == "-" || e.key == "_")) {
		        switchAll(false);
		    }
		    if (e && e.key == "1") {
		        switchAutoClickGoldenCookie();
		    }
		    if (e && e.key == "2") {
		        switchAutoClickWrathCookie();
		    }
		    if (e && e.key == "3") {
		        switchAutoClickBigCookie();
		    }
		    if (e && e.key == "4") {
		        switchHeralds();
		    }
		    if (e && e.key == "5") {
		        switchAutoCollectWrinklers();
		    }
		    if (e && e.key == "6") {
		        switchAutoCastSpell();
		    }
		    if (e && e.key == "7") {
		        switchAutoFortuneNews();
		    }
		    if (e && e.key == "8") {
		        switchAutoDragon();
		    }
		    if (e && e.key == "9") {
		        switchAutoBuy();
		    }
		    if (e && e.key == "0") {
		        switchOneMind();
		    }
		};

		initInfo();

		function initInfo(){
			l('game').insertAdjacentHTML('beforeend','<div id="modify" style="font-size: 12px;line-height:20px;z-index: 10;position: fixed;bottom: 100px; left: 5px;font-family: \'Merriweather\'">' +
				'<div id="modifyGoldenCookie">1. Golden Cookie: Disabled</div>' +
				'<div id="modifyWrathCookie">2. Wrath Cookie: Disabled</div>' +
				'<div id="modifyBigCookie">3. Big Cookie: Disabled</div>' +
				'<div id="modifyHeralds">4. Max Heralds: Disabled</div>' +
				'<div id="modifyWrinklers">5. Wrinklers: Disabled</div>' +
				'<div id="modifySpell">6. Cast Spell: Disabled</div>' +
				'<div id="modifyFortune">7. Fortune News: Disabled</div>' +
				'<div id="modifyDragon">8. Auto Dragon: Disabled</div>' +
				'<div id="modifyBuy">9. Auto Buy: Disabled</div>' +
				'<div id="modifyOneMind">0. Research One Mind: Disabled</div>' +
				'<div id="enableAll">+ Enable All</div>' +
				'<div id="disableAll">- Disable All</div>' +
				'</div>');
		}

		function updateInfo(){
			updateConfig();
			l('modifyGoldenCookie').innerHTML = "1. Golden Cookie: " + ((autoClickGoldenCookie) ? "Enabled" : "Disabled");
			l('modifyWrathCookie').innerHTML = "2. Wrath Cookie: " + ((autoClickWrathCookie) ? "Enabled" : "Disabled");
			l('modifyBigCookie').innerHTML = "3. Big Cookie: " + ((autoClickBigCookie) ? "Enabled" : "Disabled");
			l('modifyHeralds').innerHTML = "4. Max Heralds: " + ((heraldsEnabled) ? "Enabled" : "Disabled");
			l('modifyWrinklers').innerHTML = "5. Wrinklers: " + ((autoCollectWrinklers) ? "Enabled" : "Disabled");
			l('modifySpell').innerHTML = "6. Cast Spell: " + ((autoCastSpell) ? "Enabled" : "Disabled");
			l('modifyFortune').innerHTML = "7. Fortune News: " + ((autoFortuneNews) ? "Enabled" : "Disabled");
			l('modifyDragon').innerHTML = "8. Auto Dragon: " + ((autoDragon) ? "Enabled" : "Disabled");
			l('modifyBuy').innerHTML = "9. Auto Buy: " + ((autoBuy) ? "Enabled" : "Disabled");
			l('modifyOneMind').innerHTML = "0. Research One Mind: " + ((oneMind) ? "Enabled" : "Disabled");
		}

		function updateConfig(){
			MOD.config = {
				"oneMind": oneMind,
				"autoClickGoldenCookie": autoClickGoldenCookie != null,
				"autoClickWrathCookie": autoClickWrathCookie != null,
				"autoClickBigCookie": autoClickBigCookie != null,
				"heraldsEnabled": heraldsEnabled,
				"autoCollectWrinklers": autoCollectWrinklers != null,
				"autoCastSpell": autoCastSpell != null,
				"autoFortuneNews": autoFortuneNews != null,
				"autoDragon": autoDragon != null,
				"autoBuy": autoBuy != null,
			}
		}

	},
	save:function(){
		//use this to store persistent data associated with your mod
		return JSON.stringify(this.config);
	},
	load:function(str){
		//do stuff with the string data you saved previously
		var json = JSON.parse(str);
		var counter = 0;
		for(var i in json){
			if(json[i] == true){
				document.dispatchEvent(new KeyboardEvent('keydown', {
				  'key': String(counter)
				}));
			}
			counter++;
		}
	},
});