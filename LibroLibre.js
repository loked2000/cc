"use strict";
// fate prediction adapted from Clairvoyance by boba: https://bobatealee.com/hosting/mods/clairvoyance/main.js
// menu stuff adapted from FortuneHelper by OrchidAlloy: https://steamcommunity.com/sharedfiles/filedetails/?id=2693901672
// and Phena's Automation by Boku: https://steamcommunity.com/sharedfiles/filedetails/?id=2907577018

var defaultConfig = {
    // Main Controls
    modEnabled: false,
    multiCastNumber: 1,
    dualCast: false,
    castStretchTime: false,
    cpsTarget: 1,
    toggleGoldenSwitch: false,
    easterCookieStorm: true,

    // Optimization
    ignoreShortBuffs: true,
    waitForShortCasts: false,
    waitForElderFrenzies: true,

    // Advanced/Mod Compatibility
    autoClick: true,
    clickShimmer: true,
    clickWrath: true,
    avertGrandmapocalypse: true
};

if (!libroLibre) var libroLibre = {
    name: "Libro Libre",
    id: "libroLibre",
    version: "1.2.1",
    gameVersion: "2.052",
    isLoaded: false,
    grimoire: undefined,

    config: defaultConfig,

    spellInvoice: [],
    spellQueue: [],
    dreamTimer: 0,
    buyTarget: 0,

    init: function() {
        const LL = this;
        const GameUpdateMenu = Game.UpdateMenu;
        Game.UpdateMenu = function() {
            GameUpdateMenu();
            LL.addOptionsMenu();
        }
        Game.registerHook("logic", this.logicLoop.bind(this));
        this.isLoaded = true;
    },

    load: function(str) {
        const config = JSON.parse(str);
        for(const c in config) this.config[c] = config[c];
    },

    save: function() {
        return JSON.stringify(this.config);
    },

    logicLoop: function() {
        const LL = this;
        if (!this.config.modEnabled) return;
        if (Game.OnAscend || Game.AscendTimer) return;
        this.config.multiCastNumber = this.config.dualCast ? 2 : 1;

        utility();

        this.grimoire = Game.Objects["Wizard tower"].minigame;
        if (this.grimoire === undefined) return;
        const ownedTowers = this.grimoire.parent.amount;
        if (ownedTowers === 0) return;

        if (this.dreamTimer > 0) {
            this.dreamTimer--;
            return;
        }

        if (Game.T % 5 !== 0) return;

        if (this.spellQueue.length > 0) {
            if (buySellTowers(calculateTowerTarget(false), ownedTowers, -1)) 
                return; // Return to update grimoire

            castSpell();
            return;
        }

        if (this.config.toggleGoldenSwitch && !Object.keys(Game.buffs).find((buff) => Game.buffs[buff].multCpS > 1))
            Game.Upgrades["Golden switch [on]"].buy();

        this.buyTarget = calculateTowerTarget(true)

        if (buySellTowers(ownedTowers, this.buyTarget, 1))
            return; // Return to update grimoire


        if (this.grimoire.magic === this.grimoire.magicM && ownedTowers >= this.buyTarget)
            this.buildSpellQueue();

        function utility() {
            let holdPledge = false;
            if (LL.config.autoClick) Game.ClickCookie();
            if (LL.config.clickShimmer) Game.shimmers.forEach(shimmer => {
                if (shimmer.wrath) holdPledge = true;
                else shimmer.pop();
            });
    
            if (LL.config.avertGrandmapocalypse) {
                if (!(holdPledge && LL.config.clickWrath) && Game.UpgradesInStore.find((upgrade) => upgrade.name === "Elder Pledge")) Game.Upgrades["Elder Pledge"].buy();
                Game.Upgrades[Game.UpgradesInStore.find((upgrade) => upgrade.pool === "tech" || upgrade.name === "Sacrificial rolling pins")?.name]?.buy(1);
                if (Game.elderWrath !== 0) return;
            }
    
            if (LL.config.clickShimmer && LL.config.clickWrath) Game.shimmers.forEach(shimmer => {shimmer.pop();});
        }

        function calculateTowerTarget(buying) {
            if (buying) {
                var magicTotal = 0;
                generateSpellInvoice();
            }
            const cap = 2000;
    
            for (let testTowers = 1; testTowers < cap; testTowers++) {
                let testMaxMagic = LL.getMaxMagic(testTowers);
                if (buying) var testSpellCost = LL.getSpellCost(LL.spellInvoice[0], testMaxMagic);
                if (testMaxMagic >= (buying ? testSpellCost + magicTotal : Math.floor(LL.grimoire.magic))) {
                    if (buying) {
                        magicTotal += testSpellCost;
                        LL.spellInvoice.shift();
                        if (LL.spellInvoice.length) continue;
                    }
                    return testTowers;
                }
            }
            return buying ? 1 : LL.grimoire.parent.amount;

            function generateSpellInvoice() {
                LL.spellInvoice = [];
        
                if (LL.config.castStretchTime) LL.spellInvoice.push(LL.grimoire.spells["stretch time"]);
                for (let spells = 0; spells < LL.config.multiCastNumber; spells++)
                    LL.spellInvoice.push(LL.grimoire.spells["hand of fate"])
            }
        }

        function buySellTowers(low, high, buyMode) {
            const difference = high - low;
            const affordable = (buyMode === -1 ? true : (Game.cookies > LL.grimoire.parent.getSumPrice(difference)))
            if ((LL.config.multiCastNumber > 1 || LL.config.castStretchTime) && difference > 0 && affordable) {
                const savedBuyMode = Game.buyMode;
                const savedBuyBulk = Game.buyBulk;
                Game.buyMode = buyMode;
                Game.buyBulk = high - low;
                LL.grimoire.parent.buy();
                Game.buyMode = savedBuyMode;
                Game.buyBulk = savedBuyBulk;
                return true;
            }
            return false;
        }

        function castSpell() {
            let spell = LL.spellQueue.shift();
            typeof spell === "object" ? LL.grimoire.castSpell(spell) : Game.Upgrades[spell].buy();
            if (spell === LL.grimoire.spells["gambler's fever dream"])
                LL.dreamTimer = Game.fps;
        }
    },

    getMaxMagic: function(towers) {
        return Math.floor(4 + Math.pow(towers, 0.6) + Math.log((towers + (this.grimoire.parent.level - 1) * 10) / 15 + 1) * 15);
    },

    buildSpellQueue: function() {
        const LL = this;
        let cpsBuffs = buffCount("CpS");
        let clickBuffs = buffCount("Click");
        let magic = this.grimoire.magic;
        let exceptionFound = false;
        let elderFrenzyFound = false;
        let costlySpells = 0;
        const seasonModifier = Game.season === "valentines" || Game.season === "easter" ? 1 : 0;
        const spellsCast = this.grimoire.spellsCastTotal;
        const handOfFate = this.grimoire.spells["hand of fate"];
        const feverDream = this.grimoire.spells["gambler's fever dream"];
        const haggleCharm = this.grimoire.spells["haggler's charm"];
        const stretchTime = this.grimoire.spells["stretch time"];

        if (cpsBuffs === -1 || clickBuffs === -1) return;

        this.spellQueue = [];

        while (costlySpells < this.config.multiCastNumber) {
            if (exceptionFound) return;

            let fate = fateScry(spellsCast + this.spellQueue.length, seasonModifier, this.grimoire.getFailChance(handOfFate));
            if (fateCheck(fate)) {
                this.spellQueue.push(handOfFate);
                costlySpells++;
                magic -= this.getSpellCost(handOfFate, magic);
                continue;
            }
            if (exceptionFound) return;

            let dream = dreamScry(spellsCast + this.spellQueue.length, magic);
            if (dream.spell === handOfFate) {
                let dreamFate = fateScry(spellsCast + this.spellQueue.length + 1, seasonModifier, dream.fail);
                if (fateCheck(dreamFate)) {
                    this.spellQueue.push(feverDream);
                    costlySpells++;
                    magic -= dream.cost;
                    continue;
                }
            }
            if (exceptionFound) return;

            if (freeDreamCheck(dream, costlySpells)) {
                this.spellQueue.push(feverDream);
                continue;
            }

            break;
        }
            
        if (cpsBuffs >= this.config.cpsTarget && clickBuffs >= 1 && this.spellQueue.length) {
            if (this.config.castStretchTime)
                queueStretchTime(spellsCast + this.spellQueue.length, magic);

            if (this.config.toggleGoldenSwitch)
                this.spellQueue.unshift("Golden switch [off]");

            return;
        }

        if (costlySpells >= this.config.multiCastNumber || (this.config.waitForShortCasts && costlySpells > 0) || (elderFrenzyFound && this.config.waitForElderFrenzies)) {
            this.spellQueue = [];
            return;
        }

        // Prevent squandering a combo that's valid after Dragonflight expires
        if (!Game.hasBuff("Dragonflight")) {
            this.spellQueue = [pickSkippingSpell()];
            return;
        }
        
        return;

        function buffCount(type) {
            const secondThreshold = 8;
            let buffs = 0;
            for (let key in Game.buffs) {
                if (Game.buffs[key]["mult" + type] >= 5 && !(Game.buffs[key].time < secondThreshold * 30 && LL.config.ignoreShortBuffs)) buffs++;
                if (Game.buffs[key]["mult" + type] < 1) return -1;
            }
            return buffs;
        }

        function fateScry(spellsCast, seasonModifier, failChance) {
            let scriedFate = "";
            Math.seedrandom(Game.seed + "/" + spellsCast);
            const roll = Math.random();
    
            // This accounts for the randomly-selected images for golden/wrath cookies during Valentine's and Easter
            if (seasonModifier > 0) Math.random();
            // These account for the random x and y positioning
            Math.random();
            Math.random();
    
            let choices = [];
            if (roll < 1 - failChance) {
                choices.push("frenzy", "multiply cookies");
                if (!Game.hasBuff("Dragonflight")) choices.push("click frenzy");
                if (Math.random() < 0.1) choices.push("cookie storm", "cookie storm", "blab");
                if (Game.BuildingsOwned >= 10 && Math.random()<0.25) choices.push("building special");
                if (Math.random() < 0.15) choices = ["cookie storm drop"];
                if (Math.random() < 0.0001) choices.push("free sugar lump");
            }
            else {
                choices.push("clot", "ruin cookies");
                if (Math.random() < 0.1) choices.push("cursed finger", "blood frenzy");
                if (Math.random() < 0.003) choices.push("free sugar lump");
                if (Math.random() < 0.1) choices = ["blab"];
            }
            scriedFate = choose(choices);
    
            Math.seedrandom();
            return scriedFate;
        }

        function dreamScry(spellsCast, magic) {
            let spells = [];
            let selfCost = LL.getSpellCost(LL.grimoire.spells["gambler's fever dream"], magic);
            let spell = {};
            let dream = {};
    
            for (let i in LL.grimoire.spells)
                if (i !== "gambler's fever dream" && (magic - selfCost) >= LL.getSpellCost(LL.grimoire.spells[i], magic) * 0.5)
                    spells.push(LL.grimoire.spells[i]);

            if (spells.length === 0) return -1;
    
            Math.seedrandom(Game.seed + "/" + spellsCast);
            spell = choose(spells);
    
            Math.seedrandom(Game.seed + "/" + (spellsCast + 1));
            dream = {
                spell: spell,
                fail: (Math.random() < (1 - Math.max(LL.grimoire.getFailChance(spell), 0.5))) ? 0 : 1,
                cost: LL.getSpellCost(spell, magic) * 0.5 + selfCost
            }
    
            Math.seedrandom();
            return dream;
        }

        function fateCheck(fate) {
            switch (fate) {
                case "cookie storm":
                    if (!(Game.season === "easter" && Game.easterEggs.find((egg) => !(Game.HasUnlocked(egg))) && LL.config.easterCookieStorm)) {
                        break;
                    }
                case "free sugar lump":
                    exceptionFound = true;
                    if (LL.spellQueue.length === 0) {
                        return true;
                    }
                    break;
                case "blood frenzy":
                    elderFrenzyFound = true;
                case "building special":
                    cpsBuffs++;
                    return true;
                case "click frenzy":
                    if (clickBuffs === 0) {
                        clickBuffs++;
                        return true;
                    }
                    break;
                default: break;
            }
            return false;
        }

        function freeDreamCheck(dream, costlySpells) {
            if (dream === -1) return false;
            
            if (dream.spell === LL.grimoire.spells["resurrect abomination"] && resurrectRefundCheck())
                return true;
    
            if (dream.spell === LL.grimoire.spells["stretch time"] && Object.keys(Game.buffs).length === 0)
                return true;
    
            if (dream.fail)
                return false;
    
            if (dream.spell === LL.grimoire.spells["spontaneous edifice"] && Object.keys(Game.Objects).every(i => Game.Objects[i].amount >= 400) && !costlySpells)
                return true;
    
            return false;

            function resurrectRefundCheck() {
                if (Game.elderWrath === 0) return true;
        
                if (Game.wrinklers.slice(0, Game.getWrinklersMax())
                    .every(wrinkler => Math.min(wrinkler.phase, 1) !== dream.fail)) return true;
        
                return false;
            }
        }

        function queueStretchTime(spellsCast, magic) {
            let dream = dreamScry(spellsCast, magic);
            if (dream.spell === stretchTime && !dream.fail) {
                LL.spellQueue.push(feverDream);
                return true;
            }

            Math.seedrandom(Game.seed + "/" + spellsCast);
            const roll = Math.random();
            Math.seedrandom();
            if (roll < 1 - LL.grimoire.getFailChance(stretchTime)) {
                LL.spellQueue.push(stretchTime);
                return true;
            }

            return false;
        }

        function pickSkippingSpell() {
            let magic = LL.grimoire.magic;
            let dream = dreamScry(spellsCast, magic);

            if (freeDreamCheck(dream, 0) || (dream.cost < LL.getSpellCost(haggleCharm, magic) && !dream.fail)) {
                return feverDream;
            }
            
            return haggleCharm;
        }
    },

    getSpellCost: function(spell, magic) {
        const magicMin = this.getMaxMagic(1);
        magic = Math.max(magic, magicMin);
        return Math.floor((spell.costMin + magic * spell.costPercent) * (1 - 0.1 * Game.auraMult('Supreme Intellect')));
    },

    addOptionsMenu: function() {
        const LL = this;
        let body = `<div class="title">${this.name}</div>`
        + toggle("modEnabled", this.name, "font-size:17px;")

        + header("Main Controls")
        + toggle("dualCast", "Dual-Casting", 0, "automatically buy and sell wizard towers to allow consecutive hands of fate")
        + toggle("castStretchTime", "Cast Stretch Time", 0, "after casting other non-skipping spells; buys and sells towers to reduce the magic cost of this")
        + `<div class="listing"><b>Target:</b> ${Beautify(this.buyTarget)} wizard ${this.buyTarget === 1 ? "tower" : "towers"}<label>(setting one of Krumblor's auras to Supreme Intellect will SIGNIFICANTLY reduce this number)</label></div>`
        + `<div class="listing"><b>Cost to reach:</b> <div class="price plain">${Game.tinyCookie()}${Beautify(Game.Objects["Wizard tower"].getSumPrice(this.buyTarget-Game.Objects["Wizard tower"].amount))}</div></div>`
        + slider("cpsTarget", "Target Number of CpS Buffs", 1, 3, "the quantity of CpS buffs desired after casting; predicted frenzies are skipped, as their multiplier is too low; also ignores active effects with low multipliers, specifically building specials where the source building numbers fewer than 40")
        + toggle("toggleGoldenSwitch", "Toggle Golden Switch", 0, "attempt to turn golden switch on before casting Force the Hand of Fate and back off after CpS buffs have worn off")
        + toggle("easterCookieStorm", "Easter Cookie Storm", 0, "Force the Hand of Fate on a predicted cookie storm if it's Easter and not all eggs have been found")

        + header("Optimization")
        + subHeader("These are set by default to what I, personally, think they should be, but you're welcome to tweak them as you see fit.")
        + toggle("ignoreShortBuffs", "Ignore Short Buffs", 0, "ignore buffs with fewer than eight seconds remaining when counting currently active buffs")
        + toggle("waitForShortCasts", "Wait For Short Casts", 0, "wait for good conditions to single-cast spells; e.g. if the next spell is a building special that can't be multi-cast with anything, wait for natural golden cookie effects that allow it to stack to the target number of CpS buffs rather than skipping it")
        + toggle("waitForElderFrenzies", "Wait For Elder Frenzies", 0, "wait for elder frenzies regardless of previous setting")

        + header("Advanced/Mod Compatibility")
        + subHeader(`${this.name} assumes these are on and may behave poorly if they're disabled without suitable alternatives from other mods; disable at your own risk.`)
        + toggle("autoClick", "Auto Click", 0, "30 per second")
        + toggle("clickShimmer", "Click Shimmers", 0, "click golden cookies and reindeer")
        + toggle("clickWrath", "Click Wrath Cookies", 0, "click wrath cookies, too, if above setting enabled")
        + toggle("avertGrandmapocalypse", "Avert Grandmapocalypse", 0, "auto-research and auto-pledge; prevents this mod from clicking wrath cookies until pledge activated, to avoid unintentional wrath effects")
        + restoreDefault("if you are experiencing bugs, try this", "Restore Default Settings");

		var div = document.createElement('div');
		div.innerHTML = `
        <div class="block" style="padding:0px;margin:8px 4px;">
            <div class="subsection" style="padding:0px;">${body}</div>
        </div>`;

        if (Game.onMenu === 'prefs') {
            const menu = l('menu');
            const [titleSection] = menu.getElementsByClassName('section');
            menu.insertBefore(div, titleSection.nextSibling);
        }

        function header(title) {
            return `
                <div class="listing" style="padding: 20px 16px 4px; opacity: 0.95;
                font-size: 22px; font-family: Kavoon, Georgia, serif;">${title}</div>`
        }
    
        function subHeader(description) {
            return `
                <div class="listing" style="padding: 4px 16px 10px; opacity: 0.6;
                font-size: 14px; font-family: Kavoon, Georgia, serif;">${description}</div>`
        }

        function toggle(config, text, style, label) {
            const id = `${LL.id}-${config}-button`;
            const callback = `${LL.id}.toggleCallback('${config}', '${id}', '${text}');`
            const value = LL.config[config];
            return `
                <div class="listing">
                    <a class="smallFancyButton prefButton option ${value ? "" : " off"}"
                        id="${id}"${style ? ' style="' + style + '"' : ''}"
                        ${Game.clickStr}="${callback}">${text + (value ? " ON" : " OFF")}</a>
                    ${label ? "<label>(" + label + ")</label>" : ""}
                </div>`;
        }

        function slider(config, text, min, max, label) {
            const id = `${LL.id}${config}slider`;
            const value = LL.config[config];
            const callback = `${LL.id}.sliderCallback('${config}', '${id}');`
            return `
            <div class="listing">
                <div class="sliderBox">
                    <div style="float:left;">${text}</div>
                    <div style="float:right;" id="${id}Value">${value}</div>
                    <input class="slider" id="${id}" style="clear:both;"
                        type="range" min="${min}" max="${max}" step="1"
                        value="${value}" onchange="${callback}" oninput="${callback}"
                        onmouseup="PlaySound(\'snd/tick.mp3\');"/>
                </div>
                <label>(${label})</label>
            </div>`;
        }

        function restoreDefault(label, text) {
            const id = `${LL.id}-restore-default-button`;
            return `
            <div class="listing" style="text-align:right;">
                ${label ? "<label>(" + label + ")</label>" : ""}
                <a class="smallFancyButton title option warning tight"
                id="${id}" style="font-size:14px;text-align:center;"
                ${Game.clickStr}="Game.mods['${LL.id}'].restoreDefaultCallback();PlaySound('snd/tick.mp3');">
                    ${text}
                </a>
            </div>`;
        }
    },

    toggleCallback: function(config, id, text) {
        const value = !this.config[config];
        this.config[config] = value;
        l(id).innerHTML = text + (value ? " ON" : " OFF")
        l(id).className = `smallFancyButton prefButton option ${value ? "" : " off"}`
        PlaySound("snd/tick.mp3");
    },

    sliderCallback: function(config, slider) {
        const value = Math.round(l(slider).value);
        l(slider+'Value').innerHTML = value;
        this.config[config] = value;
    },

    restoreDefaultCallback: function() {
        Game.Prompt(
			`<h3>Restore Default Settings</h3>
            <div class="block">This will restore ${this.name} to its default settings and clear its
            saved mod data. The game will be saved and reloaded.<br><br>
            Do you wish to proceed?</div>`,
			[["Yes",
                `Game.ClosePrompt();
                Game.mods['${this.id}'].config = {};
                Game.toSave=true;
                Game.toReload=true;`
            ],["No",
                "Game.ClosePrompt();"
            ]],0,"prompt legacyPrompt");
    }
};

for (let func of Object.getOwnPropertyNames(libroLibre).filter(property => typeof libroLibre[property] === "function"))
    libroLibre[func] = libroLibre[func].bind(libroLibre);

Game.registerMod(libroLibre.id, libroLibre);