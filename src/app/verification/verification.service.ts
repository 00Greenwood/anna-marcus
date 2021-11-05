import { Injectable } from '@angular/core';
import { SHA256 } from 'crypto-js';
import { Observable, Subscriber } from 'rxjs';

export enum VerificationState {
  Unknown,
  InProgress,
  Denied,
  Allowed
}

type StateChangeCallback = (event: string, state: VerificationState) => void;

@Injectable({
  providedIn: 'root'
})
export class VerificationService {
  private observables: Array<Observable<VerificationState>> = new Array();
  private subscribers: Map<string, Subscriber<VerificationState>> = new Map();
  private callbacks: Map<string, Array<StateChangeCallback>> = new Map();
  private states: Map<string, VerificationState> = new Map();

  setState(event: string, state: VerificationState) {
    this.states.set(event, state);
  }

  addEvent(event: string): void {
    let observable = new Observable<VerificationState>(subscriber => {
      this.subscribers.set(event, subscriber);
    });
    observable.subscribe(state => this.callbacks.get(event)?.forEach(callback => callback(event, state)));
    this.addCallback(event, this.setState.bind(this));
    this.subscribers.get(event)?.next(VerificationState.Unknown);
    this.observables.push(observable);
  }

  addCallback(event: string, callback: StateChangeCallback): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Array());
    }
    this.callbacks.get(event)?.push(callback);
  }

  verify(event: string, date: string): void {
    if (date == '' || this.states.get(event) == VerificationState.InProgress) {
      return;
    }
    this.subscribers.get(event)?.next(VerificationState.InProgress);
    this.loadPassword(event)
      .then(password => {
        this.subscribers.get(event)?.next(
          password == SHA256(date).toString()
            ? VerificationState.Allowed
            : VerificationState.Denied
        );
      });
  }

  loadPassword(event: string): Promise<string> {
    return fetch('../../assets/events/' + event + '.json')
      .then(response => response.json())
      .then(data => data.password);
  }
}
