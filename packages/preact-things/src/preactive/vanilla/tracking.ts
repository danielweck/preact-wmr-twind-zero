let _doNotTrack = false;

export const isTrackingPaused = () => {
	return _doNotTrack;
};

export const resumeTracking = (func: () => void) => {
	const currentDoNotTrack = _doNotTrack;
	_doNotTrack = false;
	try {
		func();
	} finally {
		_doNotTrack = currentDoNotTrack;
	}
};

export const pauseTracking = <T>(func: () => T): T => {
	const currentDoNotTrack = _doNotTrack;
	_doNotTrack = true;
	try {
		return func();
	} finally {
		_doNotTrack = currentDoNotTrack;
	}
};
