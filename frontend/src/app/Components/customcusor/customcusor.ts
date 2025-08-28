import {
  Component,
  OnDestroy,
  OnInit,
  ElementRef,
  Renderer2,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'app-customcusor',
  imports: [],
  templateUrl: './customcusor.html',
  styleUrl: './customcusor.css',
})
export class Customcusor implements OnDestroy {
  private cursorElement!: HTMLElement;
  private mouseX = 0;
  private mouseY = 0;
  private isHovering = false;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.cursorElement =
      this.elementRef.nativeElement.querySelector('.custom-cursor');

    // Hide default cursor on body
    this.renderer.setStyle(document.body, 'cursor', 'none');

    // Add hover listeners to interactive elements
    this.addHoverListeners();
  }

  ngOnDestroy(): void {
    // Restore default cursor
    this.renderer.removeStyle(document.body, 'cursor');
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    if (this.cursorElement) {
      this.renderer.setStyle(this.cursorElement, 'left', `${this.mouseX}px`);
      this.renderer.setStyle(this.cursorElement, 'top', `${this.mouseY}px`);
    }
  }

  @HostListener('document:mousedown')
  onMouseDown(): void {
    if (this.cursorElement) {
      this.renderer.addClass(this.cursorElement, 'click');
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    if (this.cursorElement) {
      this.renderer.removeClass(this.cursorElement, 'click');
    }
  }

  @HostListener('document:mouseleave')
  onMouseLeave(): void {
    if (this.cursorElement) {
      this.renderer.setStyle(this.cursorElement, 'opacity', '0');
    }
  }

  @HostListener('document:mouseenter')
  onMouseEnter(): void {
    if (this.cursorElement) {
      this.renderer.setStyle(this.cursorElement, 'opacity', '1');
    }
  }

  private addHoverListeners(): void {
    // Add event listeners for interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], input, textarea, select, .clickable'
    );

    interactiveElements.forEach((element) => {
      this.renderer.listen(element, 'mouseenter', () => {
        this.onElementHover(true);
      });

      this.renderer.listen(element, 'mouseleave', () => {
        this.onElementHover(false);
      });
    });
  }

  private onElementHover(isHovering: boolean): void {
    this.isHovering = isHovering;

    if (this.cursorElement) {
      if (isHovering) {
        this.renderer.addClass(this.cursorElement, 'hover');
      } else {
        this.renderer.removeClass(this.cursorElement, 'hover');
      }
    }
  }

  // Public methods to change cursor style
  setDarkMode(isDark: boolean): void {
    if (this.cursorElement) {
      if (isDark) {
        this.renderer.addClass(this.cursorElement, 'dark-mode');
      } else {
        this.renderer.removeClass(this.cursorElement, 'dark-mode');
      }
    }
  }

  setColoredMode(isColored: boolean): void {
    if (this.cursorElement) {
      if (isColored) {
        this.renderer.addClass(this.cursorElement, 'colored');
      } else {
        this.renderer.removeClass(this.cursorElement, 'colored');
      }
    }
  }
}
