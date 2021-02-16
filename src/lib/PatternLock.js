
var svgns = 'http://www.w3.org/2000/svg'
var moveEvent = 'touchmove mousemove'

const onEvent = (elem, events, handler) => events.split(' ').forEach(evtName => elem.addEventListener(evtName, handler));
const offEvent = (elem, events, handler) => events.split(' ').forEach(evtName => elem.removeEventListener(evtName, handler));
const onOneEvent = (elem, events, handler) => events.split(' ').forEach(evtName => {
    let wrapper = (e) => {
        elem.removeEventListener(evtName, wrapper);
        handler(e);
    }
    elem.addEventListener(evtName, wrapper);
});
const addClass = (elem, names) => elem.classList.add(...names.split(' '));
const removeClass = (elem, names) => elem.classList.remove(...names.split(' '));

var scrollKeys = {
    37: true, // left
    38: true, // up
    39: true, // right
    40: true, // down
    32: true, // spacebar
    38: true, // pageup
    34: true, // pagedown
    35: true, // end
    36: true, // home
};

function vibrate() {
    navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
    if (navigator.vibrate) {
        window.navigator.vibrate(25)
    }
}

function PatternLock(svgSelector, options) {
    let self = this
    let doc = options.document || document;
    let svg = doc.querySelector(svgSelector)
    let dots = svg.querySelectorAll('.lock-dots circle')
    let lines = svg.querySelector('.lock-lines')
    let actives = svg.querySelector('.lock-actives')
    var pt = svg.createSVGPoint();
    let code = []
    let currentline
    let currenthandler

    options = Object.assign(PatternLock.defaults, options || {})

    onEvent(svg, 'touchstart mousedown', (e) => {
        clear()
        e.preventDefault()
        disableScroll()
        onEvent(svg, moveEvent, discoverDot);
        let endEvent = e.type == 'touchstart' ? 'touchend' : 'mouseup';
        onOneEvent(doc, endEvent, (e) => {
            end()
        })
    });

    // Exported methods
    Object.assign(this, {
        clear,
        success,
        error,
        getPattern,
    })

    function success() {
        removeClass(svg, 'error')
        addClass(svg, 'success')
    }

    function error() {
        removeClass(svg, 'success')
        addClass(svg, 'error')
    }

    function getPattern() {
        return parseInt(code.map((i) => Array.prototype.indexOf.call(dots, i) + 1).join(''))
    }

    function end() {
        enableScroll()
        stopTrack(currentline)
        currentline && currentline.parentElement.removeChild(currentline)
        offEvent(svg, moveEvent, discoverDot)
        let pattern = getPattern();
        if (!isNaN(pattern)) {
            let val = options.onPattern.call(self, getPattern())
            if (val === true) {
                success()
            } else if (val === false) {
                error()
            }
        }
    }

    function clear() {
        code = []
        currentline = undefined
        currenthandler = undefined
        removeClass(svg, 'success error')
        lines.innerHTML = '';
        actives.innerHTML = '';
    }

    function preventDefault(e) {
        e = e || window.event;
        if (e.preventDefault)
            e.preventDefault();
        e.returnValue = false;
    }

    function preventDefaultForScrollKeys(e) {
        if (scrollKeys[e.keyCode]) {
            preventDefault(e);
            return false;
        }
    }

    function disableScroll() {
        if (window.addEventListener) // older FF
            window.addEventListener('DOMMouseScroll', preventDefault, false);
        window.onwheel = preventDefault; // modern standard
        window.onmousewheel = doc.onmousewheel = preventDefault; // older browsers, IE
        window.ontouchmove = preventDefault; // mobile
        doc.onkeydown = preventDefaultForScrollKeys;
    }

    function enableScroll() {
        if (window.removeEventListener)
            window.removeEventListener('DOMMouseScroll', preventDefault, false);
        window.onmousewheel = doc.onmousewheel = null;
        window.onwheel = null;
        window.ontouchmove = null;
        doc.onkeydown = null;
    }

    function isUsed(target) {
        for (let i = 0; i < code.length; i++) {
            if (code[i] === target) {
                return true
            }
        }
        return false
    }

    function isAvailable(target) {
        for (let i = 0; i < dots.length; i++) {
            if (dots[i] === target) {
                return true
            }
        }
        return false
    }

    function updateLine(line) {
        return function(e) {
            e.preventDefault()
            if (currentline !== line) return
            let pos = svgPosition(e.target, e)
            line.setAttribute('x2', pos.x)
            line.setAttribute('y2', pos.y)
            return false
        }
    }

    function discoverDot(e) {
        let target = e.target;
        if (e.type == 'touchmove') {
            let {x, y} = getMousePos(e)
            target = doc.elementFromPoint(x, y);
        }
        if (isAvailable(target) && !isUsed(target)) {
            stopTrack(currentline, target)
            currentline = beginTrack(target)
        }
    }

    function stopTrack(line, target) {
        if (line === undefined) return
        if (currenthandler) {
            offEvent(svg, 'touchmove mousemove', currenthandler)
        }
        if (target === undefined) return
        let x = target.getAttribute('cx')
        let y = target.getAttribute('cy')
        line.setAttribute('x2', x)
        line.setAttribute('y2', y)
    }

    function beginTrack(target) {
        code.push(target)
        let x = target.getAttribute('cx')
        let y = target.getAttribute('cy')
        var line = createNewLine(x, y)
        var marker = createNewMarker(x, y)
        actives.appendChild(marker)
        currenthandler = updateLine(line)
        onEvent(svg, 'touchmove mousemove', currenthandler)
        lines.appendChild(line);
        if(options.vibrate) vibrate()
        return line
    }

    function createNewMarker(x, y) {
        var marker = document.createElementNS(svgns, "circle")
        marker.setAttribute('cx', x)
        marker.setAttribute('cy', y)
        marker.setAttribute('r', 6)
        return marker
    }

    function createNewLine(x1, y1, x2, y2) {
        var line = document.createElementNS(svgns, "line")
        line.setAttribute('x1', x1)
        line.setAttribute('y1', y1)
        if (x2 === undefined || y2 == undefined) {
            line.setAttribute('x2', x1)
            line.setAttribute('y2', y1)
        } else {
            line.setAttribute('x2', x2)
            line.setAttribute('y2', y2)
        }
        return line
    }

    function getMousePos(e) {
        return {
            x: e.clientX || e.touches[0].clientX,
            y :e.clientY || e.touches[0].clientY
        }
    }

    function svgPosition(element, e) {
        let {x, y} = getMousePos(e)
        pt.x = x; pt.y = y;
        return pt.matrixTransform(element.getScreenCTM().inverse());
    }
}


PatternLock.defaults = {
    onPattern: () => {},
    vibrate: true,
}


export default PatternLock;