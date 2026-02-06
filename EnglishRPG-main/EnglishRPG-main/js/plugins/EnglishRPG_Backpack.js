
(() => {

const TASK_ID = 97;


const ORDER = [
    { name: "Book",    emoji: "📘", pl: "książkę" },
    { name: "Notebook",emoji: "📓", pl: "zeszyt" },
    { name: "Pencil case", emoji: "🖊️", pl: "piórnik" },
    { name: "Pencil",  emoji: "✏️", pl: "ołówek" },
    { name: "Sandwich",emoji: "🥪", pl: "kanapkę" }
];


const ITEMS = [
    ...ORDER.map(i => ({ ...i, correct: true })),

    { name: "Toy",    emoji: "🧸", correct: false },
    { name: "Phone",  emoji: "📱", correct: false },
    { name: "Ball",   emoji: "⚽", correct: false },
    { name: "Towel",  emoji: "🧻", correct: false }
];


class Window_BackpackInfo extends Window_Base {

    initialize(rect) {
        super.initialize(rect);
        this._step = 0;
        this.refresh();
    }

    nextStep() {
        this._step++;
        this.refresh();
    }

    showDone() {
        this._step = -1;
        this.refresh();
    }

    refresh() {
        this.contents.clear();
        let y = 0;

        if (this._step >= 0 && this._step < ORDER.length) {
            const item = ORDER[this._step];

            this.changeTextColor(ColorManager.normalColor());
            this.drawText(
                `Muszę spakować ${item.pl}`,
                0, y, this.contents.width, "center"
            );
            y += 28;

            this.changeTextColor(ColorManager.textColor(18));
            this.drawText(
                `I need to pack ${item.name.toLowerCase()}`,
                0, y, this.contents.width, "center"
            );
        } else {
            this.changeTextColor(ColorManager.textColor(2));
            this.drawText("Plecak jest gotowy!", 0, y, this.contents.width, "center");
            y += 28;

            this.changeTextColor(ColorManager.textColor(18));
            this.drawText("The backpack is ready!", 0, y, this.contents.width, "center");
            y += 36;

            this.changeTextColor(ColorManager.textColor(4));
            this.drawText("Naciśnij ENTER", 0, y, this.contents.width, "center");
            y += 24;
            this.drawText("Press ENTER", 0, y, this.contents.width, "center");
        }

        this.resetTextColor();
    }
}


class Window_BackpackGrid extends Window_Selectable {

    initialize(rect, infoWindow) {
        super.initialize(rect);
        this._items = ITEMS.map(i => ({ ...i })).sort(() => Math.random() - 0.5);

        this._step = 0;
        this._finished = false;
        this._infoWindow = infoWindow;

        this.setHandler("ok", this.onOk.bind(this));
        this.activate();
        this.select(0);
        this.refresh();
    }

    maxCols() { return 3; }
    maxItems() { return this._items.length; }
    itemHeight() { return 100; }

    drawItem(index) {
        const item = this._items[index];
        if (!item) return;

        const r = this.itemRect(index);
        this.contents.fontSize = 40;
        this.drawText(item.emoji, r.x, r.y + 6, r.width, "center");
        this.contents.fontSize = 18;
        this.drawText(item.name, r.x, r.y + 60, r.width, "center");
    }

    onOk() {
        if (this._finished) {
            SceneManager.pop();
            return;
        }

        const item = this._items[this.index()];
        const expected = ORDER[this._step];

        if (item && expected && item.name === expected.name) {
            SoundManager.playOk();

            this._items.splice(this.index(), 1);
            this.refresh();
            this.select(Math.min(this.index(), this._items.length - 1));

            this._step++;
            this._infoWindow.nextStep();

            if (this._step >= ORDER.length) {
                this.finish();
            }
        } else {
            SoundManager.playBuzzer();
        }

        this.activate();
    }

    finish() {
        this._finished = true;
        this._infoWindow.showDone();

        if (window.EnglishRPG_Tasks) {
            EnglishRPG_Tasks.complete(TASK_ID);
        }
    }
}


class Scene_Backpack extends Scene_MenuBase {

    create() {
        super.create();

        const infoRect = new Rectangle(
            0,
            Graphics.boxHeight - 220,
            Graphics.boxWidth,
            220
        );
        this._infoWindow = new Window_BackpackInfo(infoRect);
        this.addWindow(this._infoWindow);

        const gridRect = new Rectangle(
            0,
            0,
            Graphics.boxWidth,
            Graphics.boxHeight - 220
        );
        this._gridWindow = new Window_BackpackGrid(gridRect, this._infoWindow);
        this.addWindow(this._gridWindow);
    }
}


PluginManager.registerCommand(
    "EnglishRPG_Backpack",
    "OpenBackpack",
    () => SceneManager.push(Scene_Backpack)
);

})();

