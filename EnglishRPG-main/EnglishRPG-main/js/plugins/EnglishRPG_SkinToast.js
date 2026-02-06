

(() => {

window.EnglishRPG_SkinToast = {};

EnglishRPG_SkinToast.show = function(skinName) {
    AudioManager.playSe({
        name: "Fanfare1", 
        volume: 90,
        pitch: 100,
        pan: 0
    });

    const scene = SceneManager._scene;
    if (!scene) return;

    const width = 420;
    const height = 110;

    const win = new Window_Base(
        new Rectangle(
            (Graphics.width - width) / 2,
            40,
            width,
            height
        )
    );


    win.contents.clear();
    win.contents.fontSize = 20;

    win.drawText("🎉 ODBLOKOWANO NOWY SKIN!", 0, 8, width - 24, "center");

    win.changeTextColor(ColorManager.textColor(14));
    win.contents.fontSize = 24;
    win.drawText(skinName, 0, 44, width - 24, "center");
    win.resetTextColor();

    scene.addChild(win);


    let time = 180;

    const _update = scene.update.bind(scene);
    scene.update = function() {
        _update();
        time--;

        if (time < 60) {
            win.opacity -= 4;
        }

        if (time <= 0) {
            this.removeChild(win);
            this.update = _update;
        }
    };
};

})();

