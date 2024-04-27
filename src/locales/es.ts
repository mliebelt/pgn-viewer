import {BaseTranslation, type Translation} from "../i18n/i18n-types"

const es: BaseTranslation = {
        "buttons:flipper" : "Voltear los lados del tablero",
        "buttons:first" : "Ir al primer movimiento",
        "buttons:prev" : "Ir al movimiento anterior",
        "buttons:next" : "Ir al siguiente movimiento",
        "buttons:play" : "Reproducir / detener todos los movimientos",
        "buttons:last" : "Ir al último movimiento",
        "buttons:deleteVar" : "Eliminar variación",
        "buttons:promoteVar" : "Promover la variación",
        "buttons:deleteMoves" : "Eliminar resto se mueve desde aquí",
        "buttons:nags" : "NAGs menu",
        "buttons:pgn" : "Mostrar PGN del juego actual",
        "buttons:hidePGN" : "Ocultar la PGN mostrada",
	"buttons:getHint": "Dar una pista",
	"buttons:makeMove": "Mostrar el siguiente movimiento",
	"buttons:showSolution": "Mostrar toda la solución",
        "chess:q": "D",
        "chess:k": "R",
        "chess:r": "T",
        "chess:b": "A",
        "chess:n": "C",
        "chess:Q": "D",
        "chess:K": "R",
        "chess:R": "T",
        "chess:B": "A",
        "chess:N": "C"
    } satisfies Translation

export default es;