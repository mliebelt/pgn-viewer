import * as cg from 'chessground/types';

/**
 * Original source taken from: https://github.com/ornicar/lila/blob/master/ui/common/src/resize.ts
 * @param els ??
 */
export default function resizeHandle(that, outer, els, _width, resizeFunction) {
    const el = document.createElement('cg-resize');
    els.appendChild(el);

    const startResize = (start) => {
        start.preventDefault();

        const mousemoveEvent = start.type === 'touchstart' ? 'touchmove' : 'mousemove';
        const mouseupEvent = start.type === 'touchstart' ? 'touchend' : 'mouseup';
        const startPos = eventPosition(start);
        const initialWidth = _width;
        let width = initialWidth;

        const resize = (move) => {
            const pos = eventPosition(move);
            const delta = pos[0] - startPos[0];
            // if (delta < 16) { return }
            // console.log("Delta: " + delta)

            width = initialWidth + delta;

            that.configuration.boardSize = width
            // console.log("Width: " + width)
            resizeFunction.call()
            els.style.width = width + 'px'
            els.style.height = width + 'px'
            outer.style.width = width + 'px'
            outer.style.height = width + 'px'
            // els.style.display = 'none';
            // els.style.display = 'block';
            // window.getComputedStyle(outer)
            // that.board.set({ width: width + 'px'})
            // window.dispatchEvent(new Event('resize'));
            // window.dispatchEvent(new Event('chessground.resize'));

        };

        document.body.classList.add('resizing');

        document.addEventListener(mousemoveEvent, resize);

        document.addEventListener(
            mouseupEvent,
            () => {
                document.removeEventListener(mousemoveEvent, resize);
                document.body.classList.remove('resizing');
            },
            { once: true }
        );
    };

    el.addEventListener('touchstart', startResize, { passive: false });
    el.addEventListener('mousedown', startResize, { passive: false });

    // if (pref === Prefs.ShowResizeHandle.OnlyAtStart) {
    //     const toggle = (ply) => el.classList.toggle('none', visible ? !visible(ply) : ply >= 2);
    //     toggle(ply);
    //     lichess.pubsub.on('ply', toggle);
    // }
}

function eventPosition(e) {
    if (e.clientX || e.clientX === 0) return [e.clientX, e.clientY];
    if (e.targetTouches[0]) return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
    return;
}