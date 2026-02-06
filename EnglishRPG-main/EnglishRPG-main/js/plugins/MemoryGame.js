

(() => {

const pluginName = "MemoryGame";

const MEMORY_WORDS = {
    home: [
        ["sleep", "spać", "😴"],
        ["bed", "łóżko", "🛏️"],
        ["tired", "zmęczony", "🥱"],
        ["night", "noc", "🌙"],
        ["wake up", "obudzić się", "⏰"],
        ["go to sleep", "iść spać", "🛌"],

        ["toilet", "toaleta", "🚽"],
        ["shower", "prysznic", "🚿"],
        ["brush teeth", "myć zęby", "🪥"],
        ["bathroom", "łazienka", "🛁"],
        ["soap", "mydło", "🧼"],
        ["clean", "czysty", "✨"],

        ["sandwich", "kanapka", "🥪"],
        ["bread", "chleb", "🍞"],
        ["cheese", "ser", "🧀"],
        ["ham", "szynka", "🍖"],
        ["eat", "jeść", "🍽️"],
        ["hungry", "głodny", "😋"]
    ],


    leave_home: [
        ["socks", "skarpetki", "🧦"],
        ["pants", "spodnie", "👖"],
        ["t-shirt", "koszulka", "👕"],
        ["hoodie", "bluza", "🧥"],
        ["shoes", "buty", "👟"],

        ["backpack", "plecak", "🎒"],
        ["book", "książka", "📘"],
        ["notebook", "zeszyt", "📓"],
        ["pencil case", "piórnik", "🖊️"],
        ["pencil", "ołówek", "✏️"],
        ["sandwich", "kanapka", "🥪"],

        ["phone", "telefon", "📱"],
        ["school", "szkoła", "🏫"],
        ["test", "sprawdzian", "📝"],
        ["late", "spóźniony", "⏰"],
        ["hurry", "spiesz się", "🏃"]
    ]
};

function securePairs(category) {
    const list = MEMORY_WORDS[category] || MEMORY_WORDS.home;
    return list.map((p, i) => ({
        id: i,
        en: p[0],
        pl: p[1],
        icon: p[2]
    }));
}


PluginManager.registerCommand(pluginName, "StartMemory", args => {
    window.MemoryMiniGame = {
        pairs: securePairs(args.category || "home"),
        taskId: Number(args.taskId || 0)
    };
    SceneManager.push(Scene_MemoryGame);
});


class Scene_MemoryGame extends Scene_Base {

    create() {
        super.create();
        this._pairs = window.MemoryMiniGame.pairs.slice();
        this._taskId = window.MemoryMiniGame.taskId; 
        this._totalPairs = this._pairs.length;
        this._comboCount = 0;
        this._bestCombo = 0;
        this._confetti = [];
        this._finished = false;

        this.createBackground();
        this.createLearnWindow();
    }

    createBackground() {
        const bg = new Sprite();
        bg.bitmap = SceneManager.backgroundBitmap();
        this.addChild(bg);
    }

    createLearnWindow() {
        this._learn = new Window_MemoryLearn(
            new Rectangle(0, 0, Graphics.width, Graphics.height),
            this._pairs
        );
        this._learn.setHandler("ok", this.startMatch.bind(this));
        this._learn.setHandler("cancel", () => SceneManager.pop());
        this.addChild(this._learn);
        this._learn.activate();
    }

    startMatch() {
        this._learn.hide();

        this._leftList = shuffle(this._pairs.map(p => ({
            id: p.id, text: p.en, icon: p.icon
        })));

        this._rightList = shuffle(this._pairs.map(p => ({
            id: p.id, text: p.pl
        })));

        this.createMatchWindows();
    }

    createMatchWindows() {
        const W = Graphics.width / 2;
        const H = Graphics.height - 60;

        this._left = new Window_MemoryColumn(
            new Rectangle(0, 0, W, H),
            "📘 English",
            this._leftList,
            "blue",
            true
        );

        this._right = new Window_MemoryColumn(
            new Rectangle(W, 0, W, H),
            "📗 Polski",
            this._rightList,
            "green",
            false
        );

        this._left.setHandler("ok", this.onLeftOk.bind(this));
        this._right.setHandler("ok", this.onRightOk.bind(this));

        this._right.setHandler("cancel", () => {
            this._right.deactivate();
            this._left.activate();
            this._selectedLeft = null;
        });

        this.addChild(this._left);
        this.addChild(this._right);

        this.createComboBar();
        this.refreshComboBar();

        this._left.activate();
    }


    createComboBar() {
        const h = 60;
        this._comboBar = new Sprite(new Bitmap(Graphics.width, h));
        this._comboBar.y = Graphics.height - h;
        this._comboBar.z = 999;
        this.addChild(this._comboBar);
    }

    refreshComboBar() {
        const b = this._comboBar.bitmap;
        b.clear();
        b.fillRect(0, 0, Graphics.width, 60, "#1e1e1e");

        b.fontSize = 22;
        b.outlineWidth = 4;
        b.outlineColor = "#000";
        b.textColor = "#ffffff";
        b.drawText(`COMBO: ${this._comboCount}`, 0, 6, Graphics.width, 24, "center");

        const ratio = Math.min(this._comboCount / 15, 1);
        const barW = Math.floor((Graphics.width - 80) * ratio);

        let color = "#00ff00";
        if (this._comboCount >= 10) color = "#BA55D3";
        else if (this._comboCount >= 5) color = "#00BFFF";

        b.fillRect(40, 36, Graphics.width - 80, 12, "#444");
        b.fillRect(40, 36, barW, 12, color);
    }

    onLeftOk() {
        const item = this._left.item();
        if (!item) return;
        this._selectedLeft = item.id;
        SoundManager.playOk();
        this._left.deactivate();
        this._right.activate();
    }

    onRightOk() {
        if (this._finished) return;

        const item = this._right.item();
        if (!item) return;

        if (item.id === this._selectedLeft) {
            SoundManager.playOk();
            this._comboCount++;
            this._bestCombo = Math.max(this._bestCombo, this._comboCount);
            this.refreshComboBar();

            if (this._comboCount === 5) {
                this.showComboText("WOW! 5 Z RZĘDU!", "#FFD700");
                this.spawnConfetti(40, 96, 120);
            }
            if (this._comboCount === 10) {
                this.showComboText("SUPER! 10 Z RZĘDU!", "#00BFFF");
                this.spawnConfetti(70, 120, 150);
            }
            if (this._comboCount === 15) {
                this.showComboText("MEGA! 15 Z RZĘDU!", "#BA55D3");
                this.spawnConfetti(110, 150, 200);
            }

            this.removeMatched(item.id);
        } else {
            SoundManager.playBuzzer();
            this._comboCount = 0;
            this.refreshComboBar();
        }

        this._selectedLeft = null;
        this._right.deactivate();
        this._left.activate();

        if (this._leftList.length === 0) {
            this.finishGame();
        }
    }

    finishGame() {
        this._finished = true;
        this._left.deactivate();
        this._right.deactivate();

   
        if (this._taskId > 0 && window.EnglishRPG_Tasks) {
            EnglishRPG_Tasks.complete(this._taskId);
        }

        this._summary = new Window_Base(
            new Rectangle(
                Graphics.width / 2 - 300,
                Graphics.height / 2 - 180,
                600,
                360
            )
        );
        this.addChild(this._summary);

        let y = 40;
        this._summary.contents.fontSize = 36;
        this._summary.drawText("🎉 Świetna robota!", 0, y, 600, "center");
        y += 80;

        this._summary.contents.fontSize = 24;
        this._summary.drawText(`🔢 Pary: ${this._totalPairs}`, 0, y, 600, "center");
        y += 40;

        this._summary.drawText(`🔥 Najlepsze combo: ${this._bestCombo}`, 0, y, 600, "center");
        y += 60;

        if (this._bestCombo >= this._totalPairs) {
            this._summary.changeTextColor(ColorManager.textColor(14));
            this._summary.drawText("⭐ BEZ BŁĘDÓW!", 0, y, 600, "center");
            this._summary.resetTextColor();
        }

        this._summary.contents.fontSize = 18;
        this._summary.drawText("ENTER / ESC → wróć do gry", 0, 300, 600, "center");
    }

    update() {
        super.update();

   
        this._confetti.forEach(s => {
            s.y += s.vy;
            s.life--;
            s.opacity = s.life * 2;
        });
        this._confetti = this._confetti.filter(s => {
            if (s.life <= 0) {
                this.removeChild(s);
                return false;
            }
            return true;
        });

    
        if (this._finished && (Input.isTriggered("ok") || Input.isTriggered("cancel"))) {
            SceneManager.pop();
        }
    }

    showComboText(text, color) {
        const s = new Sprite(new Bitmap(Graphics.width, 140));
        s.bitmap.fontSize = 58;
        s.bitmap.textColor = color;
        s.bitmap.outlineColor = "#000";
        s.bitmap.outlineWidth = 6;
        s.bitmap.drawText(text, 0, 0, Graphics.width, 140, "center");
        s.y = Graphics.height / 2 - 70;
        this.addChild(s);

        let t = 70;
        const oldUpdate = this.update.bind(this);
        this.update = () => {
            oldUpdate();
            s.opacity -= 3;
            s.scale.x = s.scale.y = 1 + Math.sin(t / 6) * 0.1;
            t--;
            if (t <= 0) {
                this.removeChild(s);
                this.update = oldUpdate;
            }
        };
    }

    spawnConfetti(amount, size, life) {
        this._confetti.forEach(c => this.removeChild(c));
        this._confetti = [];

        for (let i = 0; i < amount; i++) {
            const s = new Sprite();
            s.bitmap = new Bitmap(size, size);
            s.bitmap.drawText("🎉", 0, 0, size, size, "center");
            s.x = Math.random() * Graphics.width;
            s.y = -Math.random() * 300;
            s.vy = 4 + Math.random() * 5;
            s.life = life;
            this._confetti.push(s);
            this.addChild(s);
        }
    }

    removeMatched(id) {
        this._leftList = this._leftList.filter(i => i.id !== id);
        this._rightList = this._rightList.filter(i => i.id !== id);
        this._left.setData(this._leftList);
        this._right.setData(this._rightList);
    }
}


class Window_MemoryLearn extends Window_Selectable {
    constructor(rect, pairs) {
        super(rect);
        this._pairs = pairs;
        this.refresh();
        this.select(0);
    }
    maxItems() { return this._pairs.length; }
    drawItem(index) {
        const p = this._pairs[index];
        const rect = this.itemRect(index);
        this.drawText(`${p.icon} ${p.en}  -  ${p.pl}`, rect.x + 20, rect.y, rect.width);
    }
    refresh() {
        this.contents.clear();
        this.drawText("🧠 ZAPAMIĘTAJ PARY", 0, 0, this.contentsWidth(), "center");
        super.refresh();
        this.drawText("ENTER → start", 0, this.height - 60, this.contentsWidth(), "center");
    }
}

class Window_MemoryColumn extends Window_Selectable {
    constructor(rect, title, data, colorType, showIcons) {
        super(rect);
        this._title = title;
        this._data = data;
        this._colorType = colorType;
        this._showIcons = showIcons;
        this.refresh();
        this.select(0);
    }
    setData(data) {
        this._data = data;
        this.refresh();
        this.select(0);
    }
    maxItems() { return this._data.length; }
    item() { return this._data[this.index()]; }
    drawItem(index) {
        const item = this._data[index];
        if (!item) return;
        const rect = this.itemRect(index);
        this.contents.fillRect(
            rect.x + 4, rect.y + 4,
            rect.width - 8, rect.height - 4,
            this._colorType === "blue"
                ? "rgba(120,180,255,0.6)"
                : "rgba(120,220,120,0.6)"
        );
        const text = this._showIcons && item.icon
            ? `${item.icon} ${item.text}`
            : item.text;
        this.drawText(text, rect.x + 10, rect.y, rect.width);
    }
    refresh() {
        this.contents.clear();
        this.drawText(this._title, 0, 0, this.contentsWidth(), "center");
        super.refresh();
    }
}

function shuffle(arr) {
    return arr.slice().sort(() => Math.random() - 0.5);
}

})();

