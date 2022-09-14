const mkError = (err) => (err instanceof Error ? err : Error(String(err)));
const ERR_CIRCULAR = 'ErRoR1';
let _curComp = null;
let _lastUpdateID = 0;
let _inCompPars = false;
let _inCompParsQ = null;
let _skip = false;
export const reset = () => {
    _curComp = null;
    _lastUpdateID = 0;
    _inCompPars = false;
    _inCompParsQ = null;
    _skip = false;
};
export const obs = (v, opts) => {
    const fn = typeof v === 'function';
    const thiz = {
        _evts: null,
        _pars: null,
        _childsPrev: null,
        _childsI: -1,
        _childs: null,
        _inComp: false,
        _updateID: -1,
        _err: null,
        _compFn: fn ? v : null,
        _eq: opts ? opts.equals : null,
        _dirty: fn,
        _v: fn ? undefined : v,
    };
    if (fn) {
        get(thiz);
    }
    return thiz;
};
export const get = (thiz) => {
    if (thiz._dirty && thiz._compFn && thiz._updateID !== _lastUpdateID) {
        _comp(thiz);
    }
    if (!_skip && _curComp) {
        const childs = _curComp._childs;
        const childsPrev = _curComp._childsPrev;
        let addToPars = false;
        if (childs) {
            if (!childs.includes(thiz) &&
                (!childsPrev || !_childsPrevInclude(thiz))) {
                childs.push(thiz);
                addToPars = true;
            }
        }
        else {
            const i = _curComp._childsI + 1;
            if (childsPrev && i < childsPrev.length && childsPrev[i] === thiz) {
                _curComp._childsI = i;
            }
            else if (!childsPrev || !_childsPrevInclude(thiz)) {
                _curComp._childs = [thiz];
                addToPars = true;
            }
        }
        if (addToPars) {
            if (thiz._pars) {
                thiz._pars.push(_curComp);
            }
            else {
                thiz._pars = [_curComp];
            }
        }
    }
    if (thiz._err) {
        throw thiz._err;
    }
    return thiz._v;
};
export const skip = (fn) => {
    _skip = true;
    let v;
    try {
        v = fn();
    }
    finally {
        _skip = false;
    }
    return v;
};
export const set = (thiz, val) => {
    if (thiz._compFn) {
        return;
    }
    thiz._updateID = ++_lastUpdateID;
    _val(thiz, typeof val === 'function' ? val(thiz._v) : val);
};
export const stop = (thiz) => {
    _off(thiz);
    for (let childs = thiz._childs, i = childs ? childs.length : 0; i !== 0;) {
        _rmPar(childs[--i], thiz);
    }
    thiz._childs = null;
};
export const on = (thiz, evtCB) => {
    const evtCBs = thiz._evts;
    if (!evtCBs) {
        thiz._evts = evtCB;
    }
    else if (Array.isArray(evtCBs)) {
        if (!evtCBs.includes(evtCB)) {
            evtCBs.push(evtCB);
        }
    }
    else if (evtCBs !== evtCB) {
        thiz._evts = [evtCBs, evtCB];
    }
    return () => {
        _off(thiz, evtCB);
    };
};
const _off = (thiz, evtCB) => {
    if (evtCB) {
        const evtCBs = thiz._evts;
        if (evtCBs) {
            if (Array.isArray(evtCBs)) {
                let i = evtCBs.length;
                if (i === 1) {
                    if (evtCBs[0] === evtCB) {
                        thiz._evts = null;
                    }
                }
                else {
                    for (; i !== 0;) {
                        if (evtCBs[--i] === evtCB) {
                            evtCBs.splice(i, 1);
                            break;
                        }
                    }
                }
            }
            else if (evtCBs === evtCB) {
                thiz._evts = null;
            }
        }
    }
    else {
        thiz._evts = null;
    }
};
const _tryEmit = (evtCB, curV, prevV, err) => {
    try {
        evtCB(err, curV, prevV);
    }
    catch (_ex) {
    }
};
const _emit = (thiz, curV, prevV, err) => {
    const evtCBs = thiz._evts;
    if (evtCBs) {
        if (Array.isArray(evtCBs)) {
            let i = evtCBs.length;
            if (i === 1) {
                _tryEmit(evtCBs[0], curV, prevV, err);
            }
            else {
                for (; i !== 0;) {
                    _tryEmit(evtCBs[--i], curV, prevV, err);
                }
            }
        }
        else {
            _tryEmit(evtCBs, curV, prevV, err);
        }
    }
};
const _rmPar = (thiz, par) => {
    const pars = thiz._pars;
    let i = pars ? pars.length : 0;
    if (i === 1) {
        if (pars[0] === par) {
            thiz._pars = null;
        }
    }
    else {
        for (; i !== 0;) {
            if (pars[--i] === par) {
                pars.splice(i, 1);
                break;
            }
        }
    }
};
const _compPars = (thiz) => {
    _inCompPars = true;
    _inCompParsQ = null;
    for (let pars = thiz._pars ? thiz._pars.slice() : null, i = 0, l = pars ? pars.length : -1; i < l; i++) {
        const p = pars[i];
        p._dirty = true;
        if (p._updateID !== _lastUpdateID) {
            _comp(p);
        }
    }
    _inCompPars = false;
    if (_inCompParsQ) {
        const q = _inCompParsQ.slice();
        for (let i = 0, l = q.length; i < l; i++) {
            _compPars(q[i]);
        }
    }
};
const _comp = (thiz) => {
    if (thiz._inComp) {
        throw Error(ERR_CIRCULAR);
    }
    thiz._inComp = true;
    const prevComp = _curComp;
    _curComp = thiz;
    thiz._childsPrev = thiz._childs;
    thiz._childsI = -1;
    thiz._childs = null;
    let childsPrev = null;
    let childsI = -1;
    let compVal;
    let compErr;
    try {
        compVal = thiz._compFn(thiz._v);
    }
    catch (err) {
        compErr = mkError(err);
        if (compErr.message === ERR_CIRCULAR) {
            thiz._dirty = false;
            thiz._updateID = _lastUpdateID;
            throw compErr;
        }
    }
    finally {
        _curComp = prevComp;
        thiz._inComp = false;
        childsPrev = thiz._childsPrev;
        childsI = thiz._childsI;
        thiz._childsPrev = null;
        thiz._childsI = -1;
    }
    let i = childsI + 1;
    if (!thiz._childs) {
        if (childsPrev) {
            if (childsI === childsPrev.length - 1) {
                thiz._childs = childsPrev;
            }
            else {
                thiz._childs = childsPrev.slice(0, i);
                for (; i < childsPrev.length; i++) {
                    const child = childsPrev[i];
                    _rmPar(child, thiz);
                }
            }
        }
    }
    else if (childsPrev) {
        if (childsI !== childsPrev.length - 1) {
            for (; i < childsPrev.length; i++) {
                const child = childsPrev[i];
                if (!thiz._childs.includes(child)) {
                    _rmPar(child, thiz);
                }
            }
            childsPrev.length = childsI + 1;
        }
        thiz._childs = childsPrev.concat(thiz._childs);
    }
    if (compErr) {
        thiz._dirty = false;
        thiz._updateID = _lastUpdateID;
        _emitErr(thiz, compErr);
        return;
    }
    _val(thiz, compVal);
};
const _val = (thiz, newV) => {
    thiz._dirty = false;
    thiz._updateID = _lastUpdateID;
    if (thiz._err) {
        _emitErr(thiz, null);
    }
    const prevV = thiz._v;
    if (thiz._eq === false ? true : thiz._eq ? !thiz._eq(prevV, newV) : newV !== prevV) {
        thiz._v = newV;
        if (_inCompPars) {
            if (_inCompParsQ) {
                _inCompParsQ.push(thiz);
            }
            else {
                _inCompParsQ = [thiz];
            }
            for (let pars = thiz._pars ? thiz._pars : null, i = 0, l = pars ? pars.length : -1; i < l; i++) {
                pars[i]._dirty = true;
            }
        }
        else {
            _compPars(thiz);
        }
        if (thiz._evts) {
            _emit(thiz, newV, prevV, null);
        }
    }
};
const _emitErr = (thiz, error) => {
    if (thiz._err !== error) {
        thiz._err = error;
        if (error) {
            _emit(thiz, null, null, error);
        }
    }
};
const _childsPrevInclude = (thiz) => {
    for (let i = 0; i <= _curComp._childsI; i++) {
        if (_curComp._childsPrev[i] === thiz) {
            return true;
        }
    }
    return false;
};
//# sourceMappingURL=index.js.map