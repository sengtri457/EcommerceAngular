import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-paroduct-gallery',
  imports: [CommonModule, FormsModule],
  templateUrl: './paroduct-gallery.html',
  styleUrl: './paroduct-gallery.css',
})
export class ParoductGallery {
  @Input() images: string[] = [];
  active = '';
  zoom = 0;
  get gallery() {
    return this.images?.length ? this.images : [];
  }
  ngOnChanges() {
    this.active = this.gallery[0];
  }
  onZoom(e: MouseEvent) {
    this.zoom = 1;
  }
}
