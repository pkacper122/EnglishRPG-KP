/*:
 * @target MZ
 * @plugindesc Ukrywa HP, MP i TP w menu statusu
 * @author Kacper
 */

(() => {
    Window_StatusBase.prototype.placeBasicGauges = function(actor, x, y) {
        // celowo puste – nie rysujemy HP / MP / TP
    };
})();
