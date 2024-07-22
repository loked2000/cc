//NOTES:
//Localization:
//	loc(id,params?,baseline?)
//Game's Modal:
//	Game.Prompt=function(content, options, updateFunc, style)
//To DEBUG with chrome console
//	>> open the file start.js && change the line "let DEV=0;" to "let DEV=1;"
//icons are on:
//	Cookie Clicker\resources\app\src\img\icons.png
const TESTED_V = 2.052;

Game.registerMod("gmsHelper", {//same ID as info.txt
	is_autoClicker_on: false,
	is_gcClicker_on: false,
	is_pledgeRefresher_on: false,
	is_newsTickerClicker_on: false,
	is_reindeerClicker_on: false,
	is_autoMarket_on: false,
	// ⚪autolump
	autoLumpClicker_choice: 0, //"OFF", "Mature", "Ripe"
	is_bestLump_on: false,
	// 🐉🎅PETS
	is_autoLevelPets_on: false,
	is_autoPet_on: false,
	// 🐛autoPopper
	is_autoPopper_on: false,

	// 📘grimoire's
	is_autoCaster_on: false,
	autocaster_flag: 0,
	spellsNum: 7,
	spellsSep: '<br>',

	// tracking stuff for auto-clicking
	autoClickTimer: null,
	lastCalled: Date.now(),
	lastCounter: 0,
	//EXTRA,
	/**Version of the game this mod has been tested against */
	GMOD_v: TESTED_V,
	//this function is called as soon as the mod is registered, before load (& save, obviously)
	init: function () {
		//better ref :D
		const GMOD = Game.mods['gmsHelper'];
		const V_MISMATCH = TESTED_V != Game.version

		//The icons from resources/app/src/img/icons.png are 0 indexed as [x, y]
		GMOD.icon = [18, 16]
		if (V_MISMATCH){
			GMOD.icon = [1, 7]//Warning icon
			GMOD.V_MISMATCH = V_MISMATCH
		}

		//if (V_MISMATCH && Game.version != GMOD.GMOD_v) 
		// this check should be done when loading data, as on init() everything is their default settings

		if(!V_MISMATCH)
			Game.Notify(`GM's Mod loaded`, `Hi!!!! GM's helper MENU is ready! Have fun :D`, GMOD.icon, 5);
		else
			Game.Notify(`GM's UNTESTED Mod`, `!!Your game's version(${Game.version}) is different from this Mod's target (${TESTED_V})!!`, GMOD.icon, 59);

		//Registering Hooks:3
		Game.registerHook('logic', [
			GMOD.autoClicker,
			GMOD.gcClicker,
			GMOD.pledgeRefresher,
			GMOD.newsTickerClicker,
			GMOD.reindeerClicker,
			GMOD.grimoireReader,
			GMOD.grimoireCaster,
			GMOD.wrinklerPopper,
			GMOD.autoMarket,
			GMOD.autoLumpClicker,
			GMOD.autoLevelPets,
			GMOD.autoPet,
			GMOD.autoWrinklerPopper,
		]//Mapping each function to also include the mod info, cuz "this" is pure pandemonium by design.
			.map(f => { return () => f(GMOD) })
		);
		//draw only works on active screens!
		//Game.registerHook('draw', GMOD.gcClicker);

		//saving the toggles on Game to allow using them as an event, kinda cheaty but uknow

		//*******************************************************************/
		// MENU //////////////////////////////////////
		//*******************************************************************/
		l('storeTitle').insertAdjacentHTML('afterbegin', `
			<a 
				style="font-size:12px; position:absolute; display:block;" 
				class="smallFancyButton" 
				id="gMOD_button"
				title="Hi! :3c"
			>
			${tinyIcon(GMOD.icon)}
			</a>
			`
		);
		GMOD.menuButton = l('gMOD_button');
		GMOD.openMenu = () => {
			Game.Prompt(menu({ ...Game, tinyIcon }, GMOD), [loc("Back")], 0, 'widePrompt');

			//this is to update the buttons, since their events seem to be deleted on re-rendering
			//	I know this is a hacky solution, but it works, so it is what it is, lol
			setTimeout(() => {
				GMOD.autoClicker_Button = l("gm-autoClicker-button");
				AddEvent(GMOD.autoClicker_Button, 'click', () => GMOD.toggle_autoClicker(GMOD))
				GMOD.gcClicker_Button = l("gm-gcClicker-button");
				AddEvent(GMOD.gcClicker_Button, 'click', () => GMOD.toggle_gcClicker(GMOD))
				GMOD.pledgeRefresher_Button = l("gm-pledgeRefresher-button");
				AddEvent(GMOD.pledgeRefresher_Button, 'click', () => GMOD.toggle_pledgeRefresher(GMOD))
				GMOD.newsTicker_Button = l("gm-newsTicker-button");
				AddEvent(GMOD.newsTicker_Button, 'click', () => GMOD.toggle_newsTickerClicker(GMOD))
				GMOD.reindeerClicker_Button = l("gm-reindeerClicker-button");
				AddEvent(GMOD.reindeerClicker_Button, 'click', () => GMOD.toggle_reindeerClicker(GMOD))
				GMOD.autoMarket_Button = l("gm-autoMarket-button");
				AddEvent(GMOD.autoMarket_Button, 'click', () => GMOD.toggle_autoMarket(GMOD))
				// 🐉🎅PETS
				GMOD.autoLevelPets_Button = l("gm-autoLevelPets-button");
				AddEvent(GMOD.autoLevelPets_Button, 'click', () => GMOD.toggle_autoLevelPets(GMOD))
				GMOD.autoPet_Button = l("gm-autoPet-button");
				AddEvent(GMOD.autoPet_Button, 'click', () => GMOD.toggle_autoPet(GMOD))
				// 🐛autoPopper
				GMOD.autoPop_Button = l("gm-autoPop-button");
				AddEvent(GMOD.autoPop_Button, 'click', () => GMOD.toggle_autoWrinklerPopper(GMOD))
				//⚪lumps
				GMOD.autoLumpClicker_Button = l("gm-autoLump-button");
				AddEvent(GMOD.autoLumpClicker_Button, 'click', () => GMOD.onClick_autoLump(GMOD))
				GMOD.bestLump_Button = l("gm-bestLump-button");
				AddEvent(GMOD.bestLump_Button, 'click', () => GMOD.toggle_bestLump(GMOD))
				//📘grimoire's
				GMOD.grimoireCaster_Button = l("gm-autoCaster-button");
				if (GMOD.grimoireCaster_Button)
					AddEvent(GMOD.grimoireCaster_Button, 'click', () => GMOD.toggle_autoCaster(GMOD))
				GMOD.grimoireSpells_input = l("gm-grimoire-spells");
				AddEvent(GMOD.grimoireSpells_input, 'keyup', (e) => {
					const val = Number(e?.target?.value)
					GMOD.spellsNum = (!isNaN(val) && isFinite(val) && val) || 0;
				})
				GMOD.grimoireSeparator_input = l("gm-grimoire-separator");
				AddEvent(GMOD.grimoireSeparator_input, 'keyup', (e) => {
					GMOD.spellsSep = e?.target?.value || ' ';
				})
			}, 80);
		};
		GMOD.resetMenu = () => { Game.ClosePrompt(); GMOD.openMenu(); }

		AddEvent(GMOD.menuButton, 'click', GMOD.openMenu);

		//Replace big cookie picture (the image must be in this mod's directory)
		//Game.Loader.Replace('perfectCookie.png',GMOD.dir+'/coolCookie.png');
	},
	//////////////////////////////////////////////////////////////////
	//MOD HOOKS///////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////
	/**autoClicks, kinda cheaty innit :p */
	autoClicker: function (GMOD) {
		if (!GMOD.is_autoClicker_on) return;
		Game.lastClick -= 1000;
		Game.ClickCookie();

		if (!GMOD.autoClickTimer) {
			GMOD.autoClickTimer = setInterval(() => {
				Game.lastClick -= 1000;
				Game.ClickCookie();
				if (!GMOD.is_autoClicker_on) {
					clearInterval(GMOD.autoClickTimer);
					GMOD.autoClickTimer = null;
				}
			}, 2);
		}

		//check ClicksPS
		/* const now = Date.now();
		const counter = Game.clicksThisSession
		if (now - GMOD.lastCalled >= 60000) {
			console.log("Clicks: ", counter,
				". Clicks diff: ", counter - GMOD.lastCounter,
				". ClicksPS: ", (counter - GMOD.lastCounter) / 60,
			);
			GMOD.lastCalled = now;
			GMOD.lastCounter = counter
		} */
	},
	toggle_autoClicker: function (GMOD) {
		//console.log('%c[gm] Toggling! autoClicker', 'color: fuchsia', GMOD.is_autoClicker_on)
		GMOD.is_autoClicker_on = !GMOD.is_autoClicker_on;
		GMOD.resetMenu();
	},
	/**f() to autoClick Golden Cookies*/
	gcClicker: function (GMOD) {
		if (!GMOD.is_gcClicker_on) return;
		//doesn't discriminate bad cookies, yet...
		Game.shimmers.forEach(function (shimmer) {
			if (shimmer.type === 'golden') shimmer.pop();
		})
	},
	toggle_gcClicker: function (GMOD) {
		GMOD.is_gcClicker_on = !GMOD.is_gcClicker_on;
		GMOD.resetMenu();
	},
	/**f() that refreshes pledge (when it's available)**/
	pledgeRefresher: function (GMOD) {
		if (!GMOD.is_pledgeRefresher_on) return;
		const EP = Game.Upgrades['Elder Pledge'];
		if (Game.Has('Elder Pact') && !EP.bought) EP.click();
	},
	toggle_pledgeRefresher: function (GMOD) {
		GMOD.is_pledgeRefresher_on = !GMOD.is_pledgeRefresher_on;
		GMOD.resetMenu();
	},
	/**f() to click the news Ticker when its a fortune*/
	newsTickerClicker: function (GMOD) {
		if (!GMOD.is_newsTickerClicker_on) return;
		if (Game.tickerL && Game.TickerEffect && Game.TickerEffect.type === 'fortune') {
			Game.tickerL.click();
		}
	},
	toggle_newsTickerClicker: function (GMOD) {
		GMOD.is_newsTickerClicker_on = !GMOD.is_newsTickerClicker_on;
		GMOD.resetMenu();
	},
	/**f() to auto-click reindeer's */
	reindeerClicker: function (GMOD) {
		if (!GMOD.is_reindeerClicker_on) return;
		Game.shimmers.forEach(function (shimmer) {
			if (shimmer.type === 'reindeer') shimmer.pop();
		})
	},
	toggle_reindeerClicker: function (GMOD) {
		GMOD.is_reindeerClicker_on = !GMOD.is_reindeerClicker_on;
		GMOD.resetMenu();
	},
	/// 📘GRIMOIRE'S-------------------------------------------------------------------------------
	/** Returns failChance in a single function */
	getFailChance: function (spell) {
		const M = Game.Objects['Wizard tower'].minigame;
		if (!M) return;

		//Fail chance modifiers, currently only for Gambler's
		let obj = {};
		if (spell.name === loc("Gambler's Fever Dream")) {
			obj = { failChanceMax: 0.5, };
		}
		let failChance = M.getFailChance(spell);
		//fail modifiers, only used by now by gambler's fever dream
		if (typeof obj.failChanceSet !== 'undefined') failChance = obj.failChanceSet;
		if (typeof obj.failChanceAdd !== 'undefined') failChance += obj.failChanceAdd;
		if (typeof obj.failChanceMult !== 'undefined') failChance *= obj.failChanceMult;
		if (typeof obj.failChanceMax !== 'undefined') failChance = Math.max(failChance, obj.failChanceMax);

		return failChance;
	},
	/** Returns output of forceTheHandOfFate spell, basically copypasted win(),fail() parts of the minigame spell code
		@param fail pre-checked fail or succeed chance 
	*/
	forceHand: function (fail) {
		let choices = [];
		let out
		if (!fail) {
			//temp shimmy for randomness test, not used; type cookie storm drop to mute sound
			const _ = new Game.shimmer('golden', { noWrath: true, type: 'cookie storm drop' });
			//same code choices
			choices.push('frenzy', 'multiply cookies');
			if (!Game.hasBuff('Dragonflight')) choices.push('click frenzy');
			if (Math.random() < 0.1) choices.push('cookie storm', 'cookie storm', 'blab');
			if (Game.BuildingsOwned >= 10 && Math.random() < 0.25) choices.push('building special');
			//if (Math.random()<0.2) choices.push('clot','cursed finger','ruin cookies');
			if (Math.random() < 0.15) choices = ['cookie storm drop'];
			if (Math.random() < 0.0001) choices.push('free sugar lump');
			out = choose(choices);
			//remove test shimmer
			_.die()
		}
		else {
			//temp shimmy for randomness test, not used; type cookie storm drop to mute sound
			const _ = new Game.shimmer('golden', { wrath: true, type: 'cookie storm drop' });
			choices.push('clot', 'ruin cookies');
			if (Math.random() < 0.1) choices.push('cursed finger', 'blood frenzy');
			if (Math.random() < 0.003) choices.push('free sugar lump');
			if (Math.random() < 0.1) choices = ['blab'];
			out = choose(choices);
			//remove test shimmer
			_.die()
		}
		return out;
	},
	/** Returns next spell outcome 
	 * @param GMOD this mod's ref
	 * @param spellsCastTotal the amount of total spells cast, can be offset from real amount to see future or past results
	*/
	forceHandSpell: function (GMOD, spellsCastTotal) {
		const M = Game.Objects['Wizard tower'].minigame;
		if (!M) return;

		const name = loc("Force the Hand of Fate")
		const fthof_spell = M.spellsById.find((spell, idx) => spell.name === name)
		const failChance = GMOD.getFailChance(fthof_spell);

		//seedrandom & random are expensive operations, be considerate of their use
		Math.seedrandom(Game.seed + '/' + (spellsCastTotal));
		//negated this part just to shorten it
		const failHand = Math.random() >= (1 - failChance);
		const out = { spell: GMOD.forceHand(failHand), fail: failHand }
		Math.seedrandom();
		return out;
	},
	/**f() to display Grimoire out come */
	grimoireReader: function (GMOD) {
		//created from reading the src/minigameGrimoire.js

		//if already displaying, return.
		//	 won't save that many fps, in theory could actually cause flickering lmao
		//	BUG: Graphical bug on FPS (steam's config display) display when the dev console is open, or is it more because of the console?
		//	because: 
		//		displaying
		//		> render comes
		//		> it returns false and no longer displays
		//		> goes ahead and runs the function again
		if (l('tooltipOutcome')) return;
		//if nowhere to draw the info, return
		if (!l('tooltipSpell') || l('tooltipSpell')?.getElementsByClassName('name').length === 0)
			return;
		//get the name of the spell we are looking for
		const lookingFor = l('tooltipSpell').getElementsByClassName('name')[0].innerHTML;

		//setting M to reuse it's functionality
		const M = Game.Objects['Wizard tower'].minigame;
		if (!M) return;
		const spell = M.spellsById.find((spell, idx) => spell.name === lookingFor);
		if (!spell) return;

		const failChance = GMOD.getFailChance(spell);

		//Spells functions:
		/**returns output depending on spell*/
		const gambler = (fail) => {
			const selfCost = M.getSpellCost(spell);
			let spells = [];
			M.spellsById.forEach(s => {
				if (s.name !== loc("Gambler's Fever Dream") && (M.magic - selfCost) >= M.getSpellCost(s) * 0.5)
					spells.push(s);
			})
			const extraSpell = choose(spells);
			if (extraSpell) {
				//calculating the new fail chance
				Math.seedrandom(Game.seed + '/' + (M.spellsCastTotal + 1));
				let newFail = false;
				//the failChance is changed here per the minigame's code
				if (!extraSpell.fail || Math.random() < (1 - Math.max(failChance, 0.5))) {
					newFail = false;
				}
				else {
					newFail = true;
				}
				Math.seedrandom();
				return { outGambler: `${extraSpell.name}`, failGambler: newFail }
			}
			return {}
		}

		// .forceHand used to be here...

		//Start acting per spell
		let out;
		let fail = false;
		let outHand;
		switch (spell.name) {
			case loc("Gambler's Fever Dream"):
				Math.seedrandom(Game.seed + '/' + M.spellsCastTotal);
				if (!spell.fail || Math.random() < (1 - failChance)) {
					fail = false;
					out = '✅';
				}
				else {
					fail = true;
					out = '❌';
				}
				const { outGambler, failGambler } = gambler(fail);
				if (outGambler) {
					fail = failGambler;
					out = outGambler;
				}
				Math.seedrandom();
				break;
			//Repeating force the hand of fate
			case loc("Force the Hand of Fate"):
				outHand = [];
				//let failHand;
				for (let i = 0; i < GMOD.spellsNum; i++) {
					//moved this code to forceHandSpell
					/* Math.seedrandom(Game.seed + '/' + (M.spellsCastTotal + i));
					//negated this part just to shorten it
					failHand = Math.random() >= (1 - failChance);
					outHand.push({ spell: GMOD.forceHand(failHand), fail: failHand });
					Math.seedrandom(); */
					outHand.push(GMOD.forceHandSpell(GMOD, M.spellsCastTotal + i))
				}
				break;
			//////////all other cases just show the possible output
			default:
				Math.seedrandom(Game.seed + '/' + M.spellsCastTotal);
				if (!spell.fail || Math.random() < (1 - failChance)) {
					fail = false;
					out = '✅';
				}
				else {
					fail = true;
					out = '❌';
				}
				Math.seedrandom();
		}

		//Print the spell outcome
		l('tooltipSpell').insertAdjacentHTML('afterend', `
			<div id="tooltipOutcome" class="description" style="padding: 0px 4px">
				<b> ${loc("Outcome:")} </b>

				${/* Out for all other spells */''}
				${out ? `<span class="${fail ? "red" : "green"}">
					${out}
				</span>`
				: ''}

				${/* Out for the hand of fate, extra div to avoid comma's*/''}
				<div>
				${outHand ? outHand.map((out) => `
					<span class="${//Here I use short circuiting to pick the spell colors
					(out.spell === 'blab' && 'gray')
					|| (out.spell === 'multiply cookies' && ' ')
					|| (out.spell === 'cookie storm drop' && ' ')
					|| (out.spell === 'free sugar lump' && 'blinking')
					|| (out.fail ? "red" : "green")
					}"
					style="${//handling other special spells' colors
					(out.spell === 'free sugar lump' && "color: #eab042; font-weight: bold; ")
					|| (out.spell === 'cursed finger' && "color: #e33c9a; font-weight: bold; ")
					|| (out.spell === 'blood frenzy' && "color: #e33c9a; font-weight: bold; ")
					|| (out.spell === 'cookie storm' && "color: #32d98f; ")
					}"
					>
						${out.spell}
					</span>
				`).join(GMOD.spellsSep) : ''}
				</div>
			</div>
			`
		);
	},
	/** f() to get max magic depending on the passed number of towers
	 * copypasted from grimoire's code "computeMagicM"*/
	getMagicM: (numOfTowers) => {
		var towers = Math.max(numOfTowers, 1);
		var lvl = Math.max(numOfTowers, 1);
		return Math.floor(4 + Math.pow(towers, 0.6) + Math.log((towers + (lvl - 1) * 10) / 15 + 1) * 15);
	},
	/** f() to get the spell cost according to the num of towers
	 * copypasted from grimoire's code "computeMagicM"*/
	getSpellCost: (spell, numOfTowers) => {
		var out = spell.costMin;
		if (!numOfTowers) {
			const M = Game.Objects['Wizard tower'].minigame;
			if(!M) return -1;
			numOfTowers = M.parent.amount
		}

		const GMOD = Game.mods['gmsHelper'];
		if (spell.costPercent) 
			out += GMOD.getMagicM(numOfTowers) * spell.costPercent;
		out *= 1 - 0.1 * Game.auraMult('Supreme Intellect');
		return Math.floor(out);
	},
	/**f()🧙‍♂️ to auto-cast good combos, unlock at 90% badges*/
	grimoireCaster: function (GMOD) {
		if (!GMOD.is_autoCaster_on) return;
		const M = Game.Objects['Wizard tower'].minigame;
		if (!M) return;
		//Capping autocaster execution to once every 4 hook checks
		if(GMOD.autocaster_flag < 3 ){
			GMOD.autocaster_flag++
			return
		}
		else
			GMOD.autocaster_flag=0

		let unlockedEggs = 0
		for (const egg of Game.easterEggs) {
			if (Game.Has(egg) || Game.HasUnlocked(egg))
				unlockedEggs++;
		}

		// 0. Check current active boosts, to possibly cast a useful exception
		let activeBoostsArr = []
		let activeClickBoostsArr = []
		for (let buff in Game.buffs) {//.buffs is object, so for...in is alright here
			//avoid counting the sell buff from Godzamok as a buff, since it's toggable at a will
			if (buff === 'Devastation')
				continue;

			if (Game.buffs[buff].multCpS > 6) {
				activeBoostsArr.push(buff)
			}
			if (Game.buffs[buff].multClick > 7) {
				activeClickBoostsArr.push(buff)
			}
		}
		const activeBoosts = activeBoostsArr.length
		const activeClickBoosts = activeClickBoostsArr.length

		//0.1 utilities...
		// - Store og buildings
		const ogBuildings = M.parent.amount;

		//0.2 turn off golden switch, if no effects active and it's bought
		const GSon = Game.Upgrades['Golden switch [on]'];
		if (!GSon.bought
			&& activeBoosts + activeClickBoosts <= 1
			&& GSon.getPrice() < Game.cookies * 0.1
		)
			GSon.click()

		// 1. Cycle & Find 2 good spells to dual-cast -------------------------------------
		// - either Click & building
		// - or 2 buildings
		// - OR allow exceptions...
		//** this is the most expensive call, as the calls to random within cause extra shenanigans
		const next2Spells = [0, 0].map((val, idx) => GMOD.forceHandSpell(GMOD, M.spellsCastTotal + idx));
		let boosts = 0;//aka CPS_boosts
		let click_boosts = 0;
		let exception = false;
		//let frenzy = 0;
		next2Spells.forEach((val, idx) => {
			switch (val.spell) {
				//too common to waste as a spell combination
				//		it's better to stack 4 BS or 3 BS + 1 click boost
				//case 'frenzy':
				//	COULD BE OPPORTUNISTICALLY USED, as a combo IF:
				// 		- 2 active BS, & 1 slotted Click Frenzy
				//frenzy++;
				//break;
				case 'building special':
					boosts += 1;
					break;
				case 'click frenzy':
					click_boosts += 1;
					break;
				// EXCEPTION: cast cookie storm on easter season & less than 20 eggs found
				case 'cookie storm':
					if (idx === 0 && Game.season === 'easter' && unlockedEggs < Game.easterEggs.length)
						exception = true;
					break;
				// EXCEPTION: cast sugar lump always!!!
				case 'free sugar lump':
					if (idx === 0)
						exception = true;
					break;
				default:
				//dragon harvest && dragonflight aren't found in the pool of fthof
				//trash spell, continue
			}
		})

		const name = loc("Force the Hand of Fate")
		const fthof_spell = M.spellsById.find((spell, idx) => spell.name === name)

		// if exceptions
		if (exception) {
			M.castSpell(fthof_spell)
			return;
		}

		const boostsRdy = boosts >= 2 || (boosts >= 1 && click_boosts >= 1)
		if (!boostsRdy) {
			//get cheap spell
			const temp = loc("Haggler's Charm");
			const cheap_spell = M.spellsById.find((spell, idx) => spell.name === temp);

			// OPPORTUNISTIC EXCEPTION:
			//	cast a click boost, if possibly good:
			//	- active boosts must be running
			//	-& no other click boost is running
			//  -& needs the autoclicker 4 best efficiency, otherwise do it manual, wise dude ¬_¬
			if (activeBoosts >= 2 && activeClickBoosts === 0 && click_boosts > 0 && GMOD.is_autoClicker_on) {
				//	if the magic allows it ofc
				let possible = M.magic >= GMOD.getSpellCost(cheap_spell) + GMOD.getSpellCost(fthof_spell)
				// if not on 1st index, cheap casting should move it for next function call
				if (next2Spells[0].spell !== 'click frenzy' && possible)
					M.castSpell(cheap_spell);
				else if (next2Spells[0].spell === 'click frenzy'){
					M.castSpell(fthof_spell);
				}
				else
					return;
			}

			// cycle spells, with cheap casting
			//	*Dragonflight changes the drop table, so lets avoid cycling during that
			if (M.magic === M.magicM && !Game.hasBuff('Dragonflight'))
				M.castSpell(cheap_spell)

			return;
		}

		//All natural effects cases:
		// - Notes:
		// (DH)dragon harvest	- x2.15 Frenzy
		//		^^^ It's lifetime would barely survive till more buffs... so consider it as a weaker Building Special
		// (DF)dragonflight		- x1.43 CPS
		//		^^^ can probably replace click frenzy, or not spawn if it's already active... so count as the same
		// (BS)Building Special - let's just assume the user has max buildings at this point, so it's always good
		//
		//---- 4 ???, consider as 3, if it could ever happen
		//---- 3 EFFECTS ----- (oddest case, natural 2x spawn after frenzy)
		// - 1x Frenzy 
		// - 2x BS - (DH)
		//---------
		// - 1x Frenzy 
		// - 1x BS / (DH)
		// - 1x Click boost / (DF)
		//
		//---------
		//---- 2 EFFECTS ----- (2x Spawn, or Frenzy && 2nd spawn)
		// - 2x BS - (DH)
		//---------
		// - 1x BS / (DH)
		// - 1x Click boost / (DF)
		//-----Frenzy------
		// - 1x Frenzy 
		// - 1x BS / (DH)
		//---------
		// - 1x Frenzy 
		// - 1x Click boost / (DF)
		//----- Ignore 1 EFFECT
		//--
		//
		// From many tests on the browser:
		// The BEST COMBO _ALWAYS_ should include atleast 1 Click boost, 
		// 		so either buildup:
		// 1x natural Click
		//		- 3+ boosts (1x natural, 2x saved)
		// 1x saved Click
		//		- 3+ boosts (2x natural, 1x saved)
		// *Oportunistically: TODO
		//		- slotted: 1x Frenzy & Click Frenzy
		//		- natural: 2 BS
		//		* requires checking activeBoosts to avoid frenzy overlap
		//Combining otherwise is a negligible difference, better to wait days for this exact opportunity, rather than years of smaller combos.
		// if there's 3+ natural effects including another click boost, ignore, waiting for that specific scenario could take tooooo long, so just hope for the best.

		// 2. Check if naturals are a good mix: ---------------------------------
		//	following the discussed criteria above
		const comboRdy = (activeClickBoosts >= 1 && activeBoosts >= 1 && boosts >= 2)
			|| (click_boosts >= 1 && activeBoosts >= 2 && boosts >= 1)

		// if not, or user fked with magic amount, wait for proper situation
		if (!comboRdy || M.magic !== M.magicM) {
			//cast fools season, if:
			// - no other season is active, (season switching is expensive, so let's avoid as often as possible)
			// - not expensive (less than 1% of bank), to speedup Golden cookie (GC) spawns
			//
			//fools season gives 5% extra GC spawn, without changing the GC outcomes for fthof
			if (!Game.season && Game.computeSeasonPrices() < Game.cookies * 0.01) {
				const switchy = Game.Upgrades['Fool\'s biscuit'];
				if (switchy && !switchy.bought)
					switchy.click();
			}

			return;
		}

		// ---------START-----------
		// 2.5*. Turn on Golden switch (if possible before things get pricier...)
		const GS = Game.Upgrades['Golden switch [off]'];
		if (!GS.bought && GS.getPrice() < Game.cookies * 0.1)
			GS.click()

		// 3. Cast 1st spell
		M.castSpell(fthof_spell);

		// 4. Cast 2nd spell
		const tmpMode = Game.buyMode;//since buyMode affects globally, temporarily save here & set it manually when needed
		//brute-forcefully finding biggest amount lol:
		let toSell = 0
		for (let i = ogBuildings; i > 0; i--) {
			if (M.magic >= GMOD.getSpellCost(fthof_spell, i)) {
				toSell = ogBuildings - i;
				break;
			}
		}
		if (toSell === 0) {
			console.error('GMOD - [grimoireCaster] Muh magic!', M.magic, M.magicM, M.parent.amount)
			return;
		}

		// - Sell enough towers
		Game.buyMode = -1;
		Game.Objects['Wizard tower'].sell(toSell)

		//force re-calculating MagicM, as it might not happen immediately after selling towers
		M.computeMagicM()

		// - Cast 2nd spell
		const out = M.castSpell(fthof_spell);

		//console.log('attempted: ', out, M.magic, M.getSpellCost(fthof_spell))

		// 5. Re-buy tower amount or closest below 40% bank 
		//	40% should relatively be possible to re-obtain with a combo, unless the user is making crazy shenanigans,
		//			for which case, this safeguard is useful

		let toBuy = toSell
		for (let i = toSell; i > 0; i--) {
			if (Game.Objects['Wizard tower'].getSumPrice(i) <= Game.cookies * 0.4) {
				toBuy = i;
				break;
			}
		}

		Game.buyMode = 1;
		Game.Objects['Wizard tower'].buy(toBuy)
		//restore user's settings
		Game.buyMode = tmpMode;


		// 6*. Cast loan 1 & 2, if available
		const B = Game.Objects['Bank'].minigame;
		if (Game.takeLoan) {
			B.takeLoan(1, false) //Game has its own inner checks for repeated calls
			B.takeLoan(2, false)
		}

		// END, logs
		const currentTime = new Date();
		const formattedTime = currentTime.toLocaleTimeString('en-US', { hour12: false });

		console.log(`%c[gmsHelper]${[formattedTime]} autoCaster COMBO! Stats below:`, 'color: yellow',)
		console.log(`Active Click boosts: `, activeClickBoostsArr)
		console.log(`Active boosts: `, activeBoostsArr)
		console.log(`Slotted boosts: `, next2Spells.map(val => val.spell))
	},
	toggle_autoCaster: function (GMOD) {
		GMOD.is_autoCaster_on = !GMOD.is_autoCaster_on;
		GMOD.resetMenu();
	},
	/**f() to handle auto market buying/selling */
	autoMarket: function (GMOD) {
		if (!GMOD.is_autoMarket_on) return;
		//code based on & scraped from minigameMarket.js
		const M = Game.Objects['Bank'].minigame;
		if (!M) return;//return if no minigame

		//autobuy grandma investor if cheapear than 5% of the bank
		if (M.brokers < M.getMaxBrokers() && Game.cookies*0.05 > M.getBrokerPrice()) {
			l('bankBrokersBuy')?.click()
		}

		///////////////
		//selling phase 
		//	goes 1st to make use of previous investments later
		const boughtStocks = M.goodsById.filter((good) => good.stock > 0);
		boughtStocks.forEach((stock) => {
			if (stock.last !== 0) return; //stock traded on same tick, skip
			//get value we want to sell @
			const lowestVal = 29 //cereal's expected value, from some excel & quick googling 
			let sellValue = lowestVal + 10 * stock.id;
			if (sellValue < 100) sellValue = 100; // let's get something worth it at least :)
			if (sellValue > 200) sellValue = 200; //	but neither push luck too far!

			const currStockVal = M.getGoodPrice(stock);
			if (currStockVal > sellValue) {
				M.sellGood(stock.id, stock.stock)
			}
		})

		///////////////
		//buying phase
		const ogBank = Game.cookies;
		//calculations from the buyGood f() in the minigame code
		const realStockCost = (good) => {
			const baseCost = M.getGoodPrice(good);
			const cpsCost = Game.cookiesPsRawHighest * baseCost;
			const overhead = 1 + 0.01 * (20 * Math.pow(0.95, M.brokers));
			return cpsCost * overhead;
		}
		//filter the cheap stocks we can buy
		const cheapStocks = M.goodsById.filter((good) => {
			if (good.last !== 0) return false; //stock traded on same tick, skip
			//if above 1.1, too expensive, return
			const baseCost = M.getGoodPrice(good);
			if (baseCost >= 1.1) return false;

			const realCost = realStockCost(good)
			const maxUncapped = Math.floor(Game.cookies / realCost);
			const maxPurchasable = Math.min(maxUncapped, M.getGoodMaxStock(good) - good.stock);
			const totalCost = realCost * maxPurchasable;
			// avoid using more than 10% of cookie bank, to avoid draining the user's bank
			if (totalCost > Game.cookies * 0.10) return false;

			return true;
		})
			.reverse();//starting from the most expensive buildings (biggest chance 4 profit)
		//now we buy
		let spentCookies = 0;
		cheapStocks.forEach((good) => {
			const realCost = realStockCost(good)
			const maxUncapped = Math.floor(Game.cookies / realCost);
			const maxPurchasable = Math.min(maxUncapped, M.getGoodMaxStock(good) - good.stock);
			const toSpend = realCost * maxPurchasable;
			//if we would be spending more than 50% of the user's original bank, return;
			if (spentCookies + toSpend > ogBank * 0.5)
				return;
			else { //buy
				spentCookies += toSpend;
				M.buyGood(good.id, maxPurchasable)
			}
		});
	},
	toggle_autoMarket: function (GMOD) {
		GMOD.is_autoMarket_on = !GMOD.is_autoMarket_on;
		GMOD.resetMenu();
	},
	/**🐉🎅f() to auto level pets krumblor & santa */
	autoLevelPets: function (GMOD) {
		if (!GMOD.is_autoLevelPets_on) return;
		if (Game.dragonLevel < Game.dragonLevels.length -1
			&& Game.Has('A crumbly egg')
		) {
			//console.log('[autoLevelPets] Dragon LVL:', Game.dragonLevel, Game.dragonLevels.length)
			Game.UpgradeDragon();
			Game.specialTab = 'dragon'
			Game.ToggleSpecialMenu(false);
		}
		if (Game.santaLevel < 14
			&& Game.Has('A festive hat')
			&& Game.cookies > Math.pow(Game.santaLevel + 1, Game.santaLevel + 1)
		) {
			Game.UpgradeSanta();
			Game.specialTab='santa'
			Game.ToggleSpecialMenu(false);
		}
	},
	toggle_autoLevelPets: function (GMOD) {
		GMOD.is_autoLevelPets_on = !GMOD.is_autoLevelPets_on;
		GMOD.resetMenu();
	},
	/**f() to auto pet krumblor */
	autoPet: function (GMOD) {
		if (!GMOD.is_autoPet_on || !Game.Has('Pet the dragon')) return;
		if (Game.dragonLevel >= 8 && (!Game.HasUnlocked('Dragon scale')
			|| !Game.HasUnlocked('Dragon claw')
			|| !Game.HasUnlocked('Dragon fang')
			|| !Game.HasUnlocked('Dragon teddy bear'))
		) {
			//Game.ClickSpecialPic()
			//...
			//copy pasted the drop giver code here:
			Math.seedrandom(Game.seed + '/dragonTime');
			var drops = ['Dragon scale', 'Dragon claw', 'Dragon fang', 'Dragon teddy bear'];
			drops = shuffle(drops);
			var drop = drops[Math.floor((new Date().getMinutes() / 60) * drops.length)];
			if (!Game.Has(drop) && !Game.HasUnlocked(drop)) {
				Game.Unlock(drop);
				Game.Notify(drop, '<b>' + loc("Your dragon dropped something!") + '</b>', Game.Upgrades[drop].icon);
			}
			Math.seedrandom();
		}
	},
	toggle_autoPet: function (GMOD) {
		GMOD.is_autoPet_on = !GMOD.is_autoPet_on;
		GMOD.resetMenu();
	},
	/**🐛f() to add a "pop ALL wrinklers" button, & its functionality*/
	wrinklerPopper: function (GMOD) {
		//shiny wrinklers are type=1
		//phase >0 seems to be used more to track if they are alive
		//	phase=0  - death
		//	phase=1  - approaching
		//	phase=2  - eating
		let onScreenWrinklers = 0
		// I use .close here instead to show button when wrinklers are visible
		Game.wrinklers.forEach((w) => { if (w.phase > 0) onScreenWrinklers++ });
		let prevButton = l('gm-wrinkler-button');
		//if no wrinklers remove button
		if (!onScreenWrinklers) {
			if (prevButton) prevButton.remove();
			return;
		}
		//if button is already drawn, return
		if (prevButton) {
			return
		}
		//else, add button & event
		const versionDiv = l('versionNumber')
		const leftWidth = versionDiv.getBoundingClientRect().right + 10;
		versionDiv.insertAdjacentHTML('afterend', `
			<a 
				style="font-size:12px; position:absolute; display:block; z-index: 10; left:${leftWidth}px; bottom:5px;" 
				class="smallFancyButton" 
				id="gm-wrinkler-button"
				title="AKA: Non-Auto wrinkler clicker. Doesn't pop shinies, ThOsE aRe AlWaYs mAnUaL"
			>
				Pop ALL wrinklers - ${tinyIcon([28, 11])}
			</a>
			`
		);
		const button = l('gm-wrinkler-button');
		//button.addEventListener('click', Game.CollectWrinklers);
		//reduce hp of all non-shinies to -10
		button.addEventListener('click', () => Game.wrinklers.forEach(w => {
			//return in the strange case it might be undefined
			if (!w) return;
			//if not shiny, kill wrinkler by setting hp to -10
			w.type !== 1 && (w.hp = -10)
		}));
	},
	/**f() to auto pop wrinklers*/
	autoWrinklerPopper: function (GMOD) {
		if (!GMOD.is_autoPopper_on) return;
		const max = Game.getWrinklersMax();
		const alive = Game.wrinklers.filter(w => w.phase > 0);
		// Randomize popping 1 if below max
		//		like this it stimulates more wrinkers spawning
		if (alive.length < max) {
			const rand = Math.random()
			if (rand < 0.999)//by testing this is ~20s-ish of life
				return;
			//console.log('Popping! ', rand)
		}

		//get only fed non-shinies, fed for atleast 30s
		let poppables = Game.wrinklers.filter((w) => w && w.type !== 1 && w.sucked > Game.cookiesPs * 30);
		let toPop = choose(poppables);
		if (!toPop) return;
		toPop.hp = -10;
	},
	toggle_autoWrinklerPopper: function (GMOD) {
		GMOD.is_autoPopper_on = !GMOD.is_autoPopper_on;
		GMOD.resetMenu();
	},
	/**⚪f() to auto-click Lumps*/
	autoLumpClicker: function (GMOD) {
		if (!GMOD.autoLumpClicker_choice || !Game.canLumps()) return;
		const age = Date.now() - Game.lumpT;

		//is fully mature (Ripe), harvest immediately
		if (age > Game.lumpRipeAge) {
			if (GMOD.is_bestLump_on) {
				GMOD.harvestLumpsBest(1);
				Game.computeLumpType();
			}
			else
				Game.clickLump();
		}
		//if selected the option to harvest on Mature, do so
		else if (GMOD.autoLumpClicker_choice === 1 && age > Game.lumpMatureAge) {
			if (GMOD.is_bestLump_on) {
				GMOD.harvestLumpsBest(1);
				Game.computeLumpType();
			}
			else
				Game.clickLump();
		}
	},
	onClick_autoLump: function (GMOD) {
		GMOD.autoLumpClicker_choice = ++GMOD.autoLumpClicker_choice % 3;
		GMOD.resetMenu();
	},
	toggle_bestLump: function (GMOD) {
		GMOD.is_bestLump_on = !GMOD.is_bestLump_on;
		GMOD.resetMenu();
	},
	/**Modified from the game's, it's the same f() but with the choices only being the best*/
	harvestLumpsBest: function (amount, silent) {
		if (!Game.canLumps()) return;
		Game.lumpT = Date.now();
		var total = amount;
		if (Game.lumpCurrentType == 1 && Game.Has('Sucralosia Inutilis') && Math.random() < 0.05) total *= 2;
		else if (Game.lumpCurrentType == 1) total *= choose([2]); //choose([1, 2]);
		else if (Game.lumpCurrentType == 2) {
			total *= choose([7]);//choose([2,3,4,5,6,7]);
			Game.gainBuff('sugar blessing', 24 * 60 * 60, 1);
			Game.Earn(Math.min(Game.cookiesPs * 60 * 60 * 24, Game.cookies));
			Game.Notify(loc("Sugar blessing activated!"), loc("Your cookies have been doubled.<br>+10% golden cookies for the next 24 hours."), [29, 16]);
		}
		else if (Game.lumpCurrentType == 3) total *= choose([2]);//choose([0,0,1,2,2]);
		else if (Game.lumpCurrentType == 4) {
			total *= choose([3]);//choose([1,2,3]);
			Game.lumpRefill = 0;//Date.now()-Game.getLumpRefillMax();
			Game.Notify(loc("Sugar lump cooldowns cleared!"), '', [29, 27]);
		}
		total = Math.floor(total);
		Game.gainLumps(total);
		if (Game.lumpCurrentType == 1) Game.Win('Sugar sugar');
		else if (Game.lumpCurrentType == 2) Game.Win('All-natural cane sugar');
		else if (Game.lumpCurrentType == 3) Game.Win('Sweetmeats');
		else if (Game.lumpCurrentType == 4) Game.Win('Maillard reaction');

		if (!silent) {
			var rect = l('lumpsIcon2').getBounds(); Game.SparkleAt((rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2 - 24 + 32 - TopBarOffset);
			if (total > 0) Game.Popup('<small>+' + loc("%1 sugar lump", LBeautify(total)) + '</small>', (rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2 - 48);
			else Game.Popup('<small>' + loc("Botched harvest!") + '</small>', (rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2 - 48);
			PlaySound('snd/pop' + Math.floor(Math.random() * 3 + 1) + '.mp3', 0.75);
		}
		Game.computeLumpTimes();
	},
	/**f() to save MOD data */
	save: function () {
		return JSON.stringify({
			is_autoClicker_on: this.is_autoClicker_on,
			is_gcClicker_on: this.is_gcClicker_on,
			is_pledgeRefresher_on: this.is_pledgeRefresher_on,
			is_newsTickerClicker_on: this.is_newsTickerClicker_on,
			is_reindeerClicker_on: this.is_reindeerClicker_on,
			is_autoMarket_on: this.is_autoMarket_on,
			is_autoLevelPets_on: this.is_autoLevelPets_on,
			is_autoPet_on: this.is_autoPet_on,
			is_autoPopper_on: this.is_autoPopper_on,
			//lumps
			autoLumpClicker_choice: this.autoLumpClicker_choice,
			is_bestLump_on: this.is_bestLump_on,
			//grimoire's
			is_autoCaster_on: this.is_autoCaster_on,
			spellsNum: this.spellsNum,
			spellsSep: this.spellsSep,
			//extras:
			GMOD_v: Game.version //save version only for future check //this.GMOD_v,
		})
	},
	/**f() to load MOD data */
	load: function (str) {
		const data = JSON.parse(str);
		console.log('%c[gmsHelper] Data loaded!', 'color: yellow', data)
		//console.log('%cINFO', 'color: yellow', this.V_MISMATCH, Game.version,data.GMOD_v)
		//🛡Version safeguard: prevent loading active toggles (all)
		if (!this.V_MISMATCH || Game.version == data.GMOD_v) {
			this.is_autoClicker_on = data.is_autoClicker_on;
			this.is_gcClicker_on = data.is_gcClicker_on;
			this.is_pledgeRefresher_on = data.is_pledgeRefresher_on;
			this.is_newsTickerClicker_on = data.is_newsTickerClicker_on;
			this.is_reindeerClicker_on = data.is_reindeerClicker_on;
			this.is_autoMarket_on = data.is_autoMarket_on;
			this.is_autoLevelPets_on = data.is_autoLevelPets_on;
			this.is_autoPet_on = data.is_autoPet_on;
			this.is_autoPopper_on = data.is_autoPopper_on;
			//lumps
			this.autoLumpClicker_choice = data.autoLumpClicker_choice || 0;
			this.is_bestLump_on = data.is_bestLump_on;
			//grimoire's
			this.is_autoCaster_on = data.is_autoCaster_on;
		}
		this.spellsNum = data.spellsNum || 7;
		this.spellsSep = data.spellsSep ?? '<br>';
		//extras:
		this.GMOD_v = data.GMOD_v || TESTED_V;
	},
});

//TODO somehow get this on another file & import
const menu = (Game, GMOD) => `
<id gmsHelper>
<h3>GM'S Helper Mod</h3>
<div class="block">
	${Game.tinyIcon(GMOD.icon)} 
	<div></div>
	<div style='position: absolute; right: 20px; top: 15px; font-size: 11px;'>
		v1.25
	</div>
	Hi! This is GM's helper Mod, below are some toggles you might find useful. Enjoy!
	${GMOD.V_MISMATCH ? `
		~~!!! UN-TESTED Mod version!!!~~<br>
		Your Cookie Clicker's version(${Game.version}) is different from ths Mod's target (${TESTED_V})!<br>
		Toggles have been reset to OFF only once for security, export your save before re-enabling them, they will now continue to save.<br>
		~This notice will go away once the mod has been tested & updated.~
	` : ''}
</div>
<div class="line"></div>

<div class="block" style="border: 0; text-align: left">
	<div 
		class="listing" 
		style="width: 100%;"
	>
		<a 
			class="smallFancyButton prefButton option ${GMOD.is_autoClicker_on ? "on" : "off"}" 
			id="gm-autoClicker-button"
			title="This kinda defeats the purpose, doesn't it?"
		>
			Auto Clicker - ${GMOD.is_autoClicker_on ? "ON" : "OFF"}
		</a>
		<label> Auto clicks the big cookie.</label>
		<br>

		<a
			class="smallFancyButton prefButton option ${GMOD.is_gcClicker_on ? "on" : "off"}" 
			id="gm-gcClicker-button" 
			title="*Also clicks wrath cookies, sorry not sorry :P"
		>
			GC Clicker- ${GMOD.is_gcClicker_on ? "ON" : "OFF"}
		</a>
		<label>🍪 Auto clicks golden cookies.*</label>
		<br>

		<a
			class="smallFancyButton prefButton option ${GMOD.is_pledgeRefresher_on ? "on" : "off"}" 
			id="gm-pledgeRefresher-button"
			title="AKA: Auto Pledge Clicker"
		>
			Auto Pledge - ${GMOD.is_pledgeRefresher_on ? "ON" : "OFF"}
		</a>
		<label>✨ Refreshes the pledge automatically.</label>
		<br>


		<a
			class="smallFancyButton prefButton option ${GMOD.is_newsTickerClicker_on ? "on" : "off"}" 
			id="gm-newsTicker-button"
			title="AKA: Auto News Clicker"
		>
			News Clicker - ${GMOD.is_newsTickerClicker_on ? "ON" : "OFF"}
		</a>
		<label>🥠 Clicks the news when it's a good fortune.</label>
		<br>

		<a
			class="smallFancyButton prefButton option ${GMOD.is_reindeerClicker_on ? "on" : "off"}" 
			id="gm-reindeerClicker-button"
			title="AKA: Bob the button"
		>
			Reindeer Clicker - ${GMOD.is_reindeerClicker_on ? "ON" : "OFF"}
		</a>
		<label>🦌 Auto-clicks Reindeers.</label>
		<br>

		<a
			class="smallFancyButton prefButton option ${GMOD.is_autoMarket_on ? "on" : "off"}" 
			id="gm-autoMarket-button"
			title="*Simply buys at $1, and sells at a good enough high value."
		>
			Auto Stocks - ${GMOD.is_autoMarket_on ? "ON" : "OFF"}
		</a>
		<label>💰 Trades stocks automatically. (& simply*)</label>
		<br>

		<a
			class="smallFancyButton prefButton option ${GMOD.is_autoLevelPets_on ? "on" : "off"}" 
			id="gm-autoLevelPets-button"
			title="Yes Santa is a pet too, NEVER forget to refill the milk & cookies."
		>
			Auto lvl Pets - ${GMOD.is_autoLevelPets_on ? "ON" : "OFF"}
		</a>
		<label>🎅🐉Auto levels up Santa & Krumblor ASAP.</label>
		<br>

		<a
			class="smallFancyButton prefButton option ${GMOD.is_autoPet_on ? "on" : "off"}" 
			id="gm-autoPet-button"
			title="Don't forget to pet krumblor once in a while :D"
		>
			Auto Krumblor - ${GMOD.is_autoPet_on ? "ON" : "OFF"}
		</a>
		<label>🐲 Pets Krumblor automatically.</label>
		<br>

		<a
			class="smallFancyButton prefButton option ${GMOD.is_autoPopper_on ? "on" : "off"}" 
			id="gm-autoPop-button"
			title="Except for shinies, those are always manual!"
		>
			Auto Popper - ${GMOD.is_autoPopper_on ? "ON" : "OFF"}
		</a>
		<label>🐛 Auto pops wrinklers when at max capacity.*</label>
		<br>

		${/*Lumps */''}
		<div class="line"></div>
		<a
			class="smallFancyButton prefButton option ${GMOD.autoLumpClicker_choice ? "on" : "off"}" 
			id="gm-autoLump-button"
			title="*Ripe: Harvest on fully ripe. *Mature: Harvests as soon as it's mature."
		>
			Lump Clicker - ${['OFF', 'Mature', 'Ripe'][GMOD.autoLumpClicker_choice]}
		</a>
		<label>⚪Auto harvests lumps.*</label>
		<br>
		
		<a
			class="smallFancyButton prefButton option ${GMOD.is_bestLump_on ? "on" : "off"}" 
			id="gm-bestLump-button"
			title="Useless if Lump Clicker is off."
		>
			Best Lump - ${GMOD.is_bestLump_on ? "ON" : "OFF"}
		</a>
		<label>Ensures auto-harvesting always gets the most lumps.</label>
		<br>
	</div>
</div>

${/*Grimoire options! */''}
<div class="line"></div>

<div class="block" style="border: 0; text-align: left">
	📘Grimoire options:
	<div
		class="listing"
		style="width: 100%;"
	>

		${/*AUTO Caster, 560 is roughly 90% of total achievement as of update 2.052 */''}
		${Game.AchievementsOwned > 560 && `<a
				class="smallFancyButton prefButton option ${GMOD.is_autoCaster_on ? "on" : "off"}" 
				id="gm-autoCaster-button"
				title="Buckle up! (Combos might happen at any time)"
			>
				Auto Caster - ${GMOD.is_autoCaster_on ? "ON" : "OFF"}
			</a>
			<label>🧙‍♂️Auto casts good COMBOs for the grimoire. Enjoy!</label>
			<br>`}

		Force the Hand of Fate:
		<br>
		<input id="gm-grimoire-spells" type="text" maxlength=3 value="${GMOD.spellsNum}" style="width: 35px;">
		<label> Number of future spell outcomes to show.</label>
		<br>

		<input id="gm-grimoire-separator" type="text" maxlength=4 value="${GMOD.spellsSep}" style="width: 35px;">
		<label> HTML separator between spell outcomes. Default: "&lt;br&gt;".</label>
		<br>
		<label> (Yes, this "HTML separator" inserts code so don't copy-paste anything here you don't know, althought you shouldn't be able to write more than 4 characters)</label>
	</div>
</div>
`
