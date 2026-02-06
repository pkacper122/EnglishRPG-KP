

(() => {



const ACTOR_ID = 1;
const SKIN_UNLOCK_SWITCH = 25;
const SKIN_TOAST_SHOWN_SWITCH = 26;



const SKINS = [
    {
        name: "Podstawowy",
        characterName: "Hero_Default",
        characterIndex: 0,
        unlocked: true
    },
    {
        name: "Szkolny",
        characterName: "Aktor2",
        characterIndex: 0,
        switchId: 25
    },
    {
        name: "Sportowy",
        characterName: "Actor1_Sport",
        characterIndex: 0,
        switchId: 40
    },
    {
        name: "Zimowy",
        characterName: "Actor1_Winter",
        characterIndex: 0,
        switchId: 41
    },
    {
        name: "Piżama",
        characterName: "Actor1_Pyjama",
        characterIndex: 0,
        switchId: 42
    }
];




const _Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    _Game_System_initialize.call(this);
    this._currentSkinIndex = 0; // domyślny
};


Window_MenuCommand.prototype.addOriginalCommands = function() {
    this.addCommand("Skiny", "skins", true);
};

Window_MenuCommand.prototype.addItemCommand = function() {};
Window_MenuCommand.prototype.addSkillCommand = function() {};
Window_MenuCommand.prototype.addEquipCommand = function() {};
Window_MenuCommand.prototype.addFormationCommand = function() {};

Window_MenuCommand.prototype.addMainCommands = function() {
    this.addCommand(TextManager.status, "status", true);
};



class Scene_Skins extends Scene_MenuBase {

    create() {
        super.create();
        this.createWindow();
    }

    createWindow() {
        const rect = new Rectangle(0, 0, Graphics.width, Graphics.height);
        this._window = new Window_Skins(rect);
        this._window.setHandler("ok", this.onOk.bind(this));
        this._window.setHandler("cancel", this.popScene.bind(this));
        this.addWindow(this._window);
        this._window.activate();
    }

    onOk() {
        const index = this._window.index();
        const skin = SKINS[index];

        if (!this._window.isUnlocked(skin)) {
            SoundManager.playBuzzer();
            this._window.activate();
            return;
        }

        const actor = $gameActors.actor(ACTOR_ID);
        actor.setCharacterImage(skin.characterName, skin.characterIndex);
        $gamePlayer.refresh();

        $gameSystem._currentSkinIndex = index;

        SoundManager.playOk();
        this._window.refresh();
        this._window.activate();
    }
}


class Window_Skins extends Window_Selectable {

    initialize(rect) {
        super.initialize(rect);
        this._skins = SKINS;
        this.refresh();
        this.select($gameSystem._currentSkinIndex || 0);
    }

    maxItems() {
        return this._skins.length;
    }

    isUnlocked(skin) {
        if (skin.unlocked) return true;
        if (skin.switchId) return $gameSwitches.value(skin.switchId);
        return false;
    }

    drawItem(index) {
        const skin = this._skins[index];
        if (!skin) return;

        const rect = this.itemRect(index);
        const unlocked = this.isUnlocked(skin);
        const isCurrent = index === $gameSystem._currentSkinIndex;


        if (isCurrent) {
            this.contents.fillRect(
                rect.x,
                rect.y,
                rect.width,
                rect.height,
                "rgba(255,215,0,0.35)"
            );
        }

        if (unlocked) {
            this.changeTextColor(ColorManager.normalColor());
            this.drawText(skin.name, rect.x + 20, rect.y, rect.width);
        } else {
            this.changeTextColor(ColorManager.textColor(8));
            this.drawText(`🔒 ${skin.name}`, rect.x + 20, rect.y, rect.width);
        }

        this.resetTextColor();
    }
}



const _Scene_Menu_createCommandWindow =
    Scene_Menu.prototype.createCommandWindow;

Scene_Menu.prototype.createCommandWindow = function() {
    _Scene_Menu_createCommandWindow.call(this);
    this._commandWindow.setHandler("skins", () => {
        SceneManager.push(Scene_Skins);
    });
};


class Sprite_SkinToast extends Sprite {

    constructor() {
        const w = 360;
        const h = 80;
        const bmp = new Bitmap(w, h);
        super(bmp);

        bmp.fillRect(0, 0, w, h, "rgba(0,0,0,0.75)");
        bmp.fontFace = $gameSystem.mainFontFace();
        bmp.outlineColor = "#000";
        bmp.outlineWidth = 3;

        bmp.fontSize = 20;
        bmp.textColor = "#FFD700";
        bmp.drawText("🎉 Odblokowano nowy skin!", 0, 8, w, 24, "center");

        bmp.fontSize = 14;
        bmp.textColor = "#FFFFFF";
        bmp.drawText("ESC → Menu → Skiny", 0, 40, w, 20, "center");

        this.x = Graphics.width - w - 20;
        this.y = Graphics.height - h - 20;

        this.opacity = 0;
        this._life = 180;

        AudioManager.playSe({
            name: "Fanfare1",
            volume: 90,
            pitch: 100,
            pan: 0
        });
    }

    update() {
        super.update();

        if (this._life > 0) {
            this._life--;
            if (this.opacity < 255) this.opacity += 12;
        } else {
            this.opacity -= 12;
            if (this.opacity <= 0 && this.parent) {
                this.parent.removeChild(this);
            }
        }
    }
}



const _Scene_Map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    _Scene_Map_update.call(this);

    if (
        $gameSwitches.value(SKIN_UNLOCK_SWITCH) &&
        !$gameSwitches.value(SKIN_TOAST_SHOWN_SWITCH)
    ) {
        this.addChild(new Sprite_SkinToast());
        $gameSwitches.setValue(SKIN_TOAST_SHOWN_SWITCH, true);
    }
};

})();

