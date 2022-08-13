export class PgnEvent {
    name: string
    callbacks: Array<Function>
    constructor(name: string){
        this.name = name
        this.callbacks = []
    }
    registerCallback(callback:Function):void{
        this.callbacks.push(callback)
    }
}


export class Reactor{
    events: {[key: string]: PgnEvent}
    constructor() {
        this.events = {}
    }

    registerEvent = function(eventName:string){
        let event:PgnEvent = new PgnEvent(eventName)
        this.events[eventName] = event
    }

    dispatchEvent = function(eventName:string, eventArgs:any){
        this.events[eventName].callbacks.forEach(function(callback:Function){
            callback(eventArgs)
        })
    }

    addEventListener = function(eventName:string, callback:Function){
        this.events[eventName].registerCallback(callback)
    }

}