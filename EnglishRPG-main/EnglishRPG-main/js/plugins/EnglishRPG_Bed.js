
(() => {

class Scene_Bed extends Scene_MenuBase {

    create() {
        super.create();
        this._timer = 0;
        this.startFadeOut(60);
    }

    update() {
        super.update();
        this._timer++;


        if (this._timer === 120) {
            AudioManager.playSe({
                name: "Phone",
                volume: 90,
                pitch: 100,
                pan: 0
            });
        }


        if (this._timer >= 240) {
            SceneManager.pop();
        }
    }
}

PluginManager.registerCommand(
    "EnglishRPG_Bed",
    "Sleep",
    () => SceneManager.push(Scene_Bed)
);

})();

