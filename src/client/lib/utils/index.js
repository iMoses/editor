export function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

export function mouseDrag(emmiter, handleMouseDrag, handleComplete) {
    const handleMouseUp = event => {
        emmiter.off('mousedrag', handleMouseDrag);
        emmiter.off('mouseup', handleMouseUp);
        typeof handleComplete === 'function' && handleComplete(event);
    };
    emmiter.on('mousedrag', handleMouseDrag);
    emmiter.on('mouseup', handleMouseUp);
}
