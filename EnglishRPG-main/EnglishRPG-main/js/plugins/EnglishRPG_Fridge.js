
(() => {

const TASK_ID = 2;


const REQUIRED = ["Bread", "Cheese", "Ham"];

const ITEMS = [
    { name: "Bread",  emoji: "🍞", correct: true,  pl: "Mam już chleb" },
    { name: "Cheese", emoji: "🧀", correct: true,  pl: "Mam już ser" },
    { name: "Ham",    emoji: "🥩", correct: true,  pl: "Mam już szynkę" },

    { name: "Milk",   emoji: "🥛", correct: false },
    { name: "Apple",  emoji: "🍎", correct: false },
    { name: "Tomato", emoji: "🍅", correct: false }
];


class Window_FridgeInfo extends Window_Base {

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
        this.drawText("Muszę zrobić kanapkę", 0, y, this.contents.width, "center");
        y += 26;

        this.changeTextColor(ColorManager.textColor(18));
        this.drawText("I have to make a sandwich", 0, y, this.contents.width, "center");
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
            this.drawText("Kanapka gotowa!", 0, y, this.contents.width, "center");
            y += 26;

            this.changeTextColor(ColorManager.textColor(18));
            this.drawText("The sandwich is ready!", 0, y, this.contents.width, "center");
            y += 36;

            this.changeTextColor(ColorManager.textColor(4));
            this.drawText("Aby kontynuować kliknij ENTER", 0, y, this.contents.width, "center");
            y += 24;
            this.drawText("Press ENTER to continue", 0, y, this.contents.width, "center");
        }

        this.resetTextColor();
    }
}


class Window_FridgeGrid extends Window_Selectable {

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
                item.pl,
                `I already have ${item.name.toLowerCase()}`
            );

           
            this._items.splice(this.index(), 1);
            this.refresh();
            this.select(Math.min(this.index(), this._items.length - 1));

            this.checkDone();
        } else {
            SoundManager.playBuzzer();
            this._infoWindow.showFeedback(
                "To nie pasuje do kanapki",
                "This does not belong in a sandwich"
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


class Scene_Fridge extends Scene_MenuBase {

    create() {
        super.create();

        const infoRect = new Rectangle(
            0,
            Graphics.boxHeight - 220,
            Graphics.boxWidth,
            220
        );
        this._infoWindow = new Window_FridgeInfo(infoRect);
        this.addWindow(this._infoWindow);

        const gridRect = new Rectangle(
            0,
            0,
            Graphics.boxWidth,
            Graphics.boxHeight - 220
        );
        this._gridWindow = new Window_FridgeGrid(gridRect, this._infoWindow);
        this.addWindow(this._gridWindow);
    }
}


PluginManager.registerCommand(
    "EnglishRPG_Fridge",
    "OpenFridge",
    () => SceneManager.push(Scene_Fridge)
);

})();

