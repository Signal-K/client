export type EventHandler = (arg: any) => void;

export class EventEmitter {
	private _events: { [key: string]: EventHandler[] } = {};

	public bind(event: string, handler: EventHandler) {
		this._events[event] = this._events[event] || [];
		this._events[event].push(handler);
	}

	public once(event: string, handler: EventHandler) {
		this.bind(event, function h (args) {
			this.unbind(event, h);
			handler.call(null, args);
		});
	}

	public unbind(event: string, handler: EventHandler) {
		if (!this._events[event]) return;

		let index = this._events[event].indexOf(handler);
		if (index === -1) return;

		this._events[event].splice(index, 1);
	}

	public emit(event: string, args: any) {
		if (!this._events[event]) return;

		let handlers = this._events[event].slice();
		let count = handlers.length;

		for (let i = 0; i < count; i++) {
			handlers[i].call(null, args);
		}
	}
}