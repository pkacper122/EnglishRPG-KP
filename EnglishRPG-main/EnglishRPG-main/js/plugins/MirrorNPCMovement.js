

(() => {

let mirrorEventId = null;

PluginManager.registerCommand("MirrorNPCMovement", "StartMirror", args => {
    mirrorEventId = Number(args.eventId);
});

PluginManager.registerCommand("MirrorNPCMovement", "StopMirror", () => {
    mirrorEventId = null;
});

const _Game_Player_moveStraight = Game_Player.prototype.moveStraight;
Game_Player.prototype.moveStraight = function(d) {
    _Game_Player_moveStraight.call(this, d);

    if (mirrorEventId) {
        const ev = $gameMap.event(mirrorEventId);
        if (ev) {
            ev.moveStraight(d);
        }
    }
};

})();

