
(() => {

window.EnglishRPG_Tasks = {

    tasks: [
        { id: 3, pl: "Wykąp się",      en: "Take a bath",      done: false, visible: true  },
        { id: 2, pl: "Zrób kanapkę",   en: "Make a sandwich", done: false, visible: false },
        { id: 4, pl: "Odrób lekcje",   en: "Do homework",     done: false, visible: false },
        { id: 1, pl: "Połóż się spać", en: "Go to sleep",     done: false, visible: false },
        { id: 99, pl: "Odbierz telefon", en: "Answer the phone", done: false, visible: false },
        { id: 98, pl: "Ubierz się", en: "Get dressed", done: false, visible: false },
        { id: 97, pl: "Spakuj plecak", en: "Pack your backpack", done: false, visible: false },
        { id: 96, pl: "Wyjdź z domu", en: "Leave the house", done: false, visible: false },
        { id: 95, pl: "Porozmawiaj z kolegą", en: "Talk with your friend", done: false, visible: false },
        { id: 94, pl: "Idź do klasy", en: "Go to class", done: false, visible: false },

    ],

    complete(id) {
        const index = this.tasks.findIndex(t => t.id === id);
        if (index === -1) return;

        this.tasks[index].done = true;
        this.tasks[index].visible = false;

        const next = this.tasks[index + 1];
        if (next) next.visible = true;
    }
};


class Window_TaskHUD extends Window_Base {

    initialize() {
        const w = 300;
        const h = 110;
        super.initialize(
            new Rectangle(Graphics.boxWidth - w - 10, 10, w, h)
        );
        this.opacity = 200;
        this._lastId = null;
        this.refresh();
    }

    refresh() {
        const task = EnglishRPG_Tasks.tasks.find(t => t.visible);
        if (!task || task.id === this._lastId) return;

        this._lastId = task.id;
        this.contents.clear();

        let y = 0;
        this.changeTextColor(ColorManager.textColor(3));
        this.drawText("Zadanie", 0, y, this.contents.width, "center");
        y += 28;

        this.changeTextColor(ColorManager.normalColor());
        this.drawText(`□ ${task.pl}`, 0, y, this.contents.width);
        y += 22;

        this.changeTextColor(ColorManager.textColor(18));
        this.drawText(task.en, 16, y, this.contents.width);
        this.resetTextColor();
    }

    update() {
        super.update();
        this.refresh();
    }
}

const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function() {
    _Scene_Map_createAllWindows.call(this);
    this._taskHUD = new Window_TaskHUD();
    this.addWindow(this._taskHUD);
};

PluginManager.registerCommand(
    "EnglishRPG_TaskSystem",
    "CompleteTask",
    args => EnglishRPG_Tasks.complete(Number(args.taskId))
);

})();

