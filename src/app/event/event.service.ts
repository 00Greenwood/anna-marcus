import { Injectable } from '@angular/core';
import { Image } from '../image/image.component';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  getImages(event: string): Promise<Array<Image>> {
    return fetch('../../assets/events/' + event + '.json').then((response) => response.json()).then((data) => data.images);
  }

  getPassword(event: string): Promise<string> {
    return fetch('../../assets/events/' + event + '.json').then((response) => response.json()).then((data) => data.password);
  }
}

