

(() => {

const TASK_ID = 3;


const REQUIRED = ["Toilet", "Shower", "Brush teeth"];

const ITEMS = [
    { name: "Toilet", emoji: "🚽", correct: true, pl: "Skorzystałem z toalety" },
    { name: "Shower", emoji: "🚿", correct: true, pl: "Wziąłem prysznic" },
    { name: "Brush teeth", emoji: "🪥", correct: true, pl: "Umyłem zęby" },

    { name: "Phone", emoji: "📱", correct: false },
    { name: "Burger", emoji: "🍔", correct: false },
    { name: "Game", emoji: "🎮", correct: false }
];


class Window_ToiletInfo extends Window_Base {

    initialize(rect) {
        super.initialize(rect);
        this._mode = "task"; 
        this._pl = "";
        this._en = "";
        this.refresh();
    }

    showTask() {
        this._mode = "task";
        this.refresh();
    }

    showFeedback(pl, en) {
        this._mode = "feedback";
        this._pl = pl;
        this._en = en;
        this.refresh();
    }

    showDone() {
        this._mode = "done";
        this.refresh();
    }

    refresh() {
        this.contents.clear();
        let y = 0;

        this.changeTextColor(ColorManager.normalColor());
        this.drawText("Muszę zadbać o poranną toaletę", 0, y, this.contents.width, "center");
        y += 26;

        this.changeTextColor(ColorManager.textColor(18));
        this.drawText("I have to do my morning routine", 0, y, this.contents.width, "center");
        y += 36;

        if (this._mode === "feedback") {
            this.changeTextColor(ColorManager.normalColor());
            this.drawText(this._pl, 0, y, this.contents.width, "center");
            y += 24;

            this.changeTextColor(ColorManager.textColor(18));
            this.drawText(this._en, 0, y, this.contents.width, "center");
        }

        if (this._mode === "done") {
            this.changeTextColor(ColorManager.textColor(2));
            this.drawText("Poranna toaleta wykonana!", 0, y, this.contents.width, "center");
            y += 26;

            this.changeTextColor(ColorManager.textColor(18));
            this.drawText("Morning routine completed!", 0, y, this.contents.width, "center");
            y += 36;

            this.changeTextColor(ColorManager.textColor(4));
            this.drawText("Aby kontynuować kliknij ENTER", 0, y, this.contents.width, "center");
            y += 24;
            this.drawText("Press ENTER to continue", 0, y, this.contents.width, "center");
        }

        this.resetTextColor();
    }
}


class Window_ToiletGrid extends Window_Selectable {

    initialize(rect, infoWindow) {
        super.initialize(rect);
        this._items = ITEMS.map(i => ({ ...i }));
        this._selected = [];
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
        if (!item) return;

        if (item.correct && !this._selected.includes(item.name)) {
            this._selected.push(item.name);
            SoundManager.playOk();

            this._infoWindow.showFeedback(
                `Mam już: ${item.pl}`,
                `I have done: ${item.name.toLowerCase()}`
            );

           
            this._items.splice(this.index(), 1);
            this.refresh();
            this.select(Math.min(this.index(), this._items.length - 1));

            this.checkDone();
        } else {
            SoundManager.playBuzzer();
            this._infoWindow.showFeedback(
                "To nie jest część porannej toalety",
                "This is not part of the routine"
            );
        }

        this.activate(); 
    }

    checkDone() {
        if (REQUIRED.every(r => this._selected.includes(r))) {
            this._finished = true;
            this._infoWindow.showDone();

            if (window.EnglishRPG_Tasks) {
                EnglishRPG_Tasks.complete(TASK_ID);
            }
        }
    }
}


class Scene_Toilet extends Scene_MenuBase {

    create() {
        super.create();

        const infoRect = new Rectangle(
            0,
            Graphics.boxHeight - 220,
            Graphics.boxWidth,
            220
        );
        this._infoWindow = new Window_ToiletInfo(infoRect);
        this.addWindow(this._infoWindow);

        const gridRect = new Rectangle(
            0,
            0,
            Graphics.boxWidth,
            Graphics.boxHeight - 220
        );
        this._gridWindow = new Window_ToiletGrid(gridRect, this._infoWindow);
        this.addWindow(this._gridWindow);
    }
}


PluginManager.registerCommand(
    "EnglishRPG_Toilet",
    "OpenToilet",
    () => SceneManager.push(Scene_Toilet)
);

})();

