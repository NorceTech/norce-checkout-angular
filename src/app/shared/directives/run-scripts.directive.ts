import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({ selector: '[runScripts]' })
export class RunScriptsDirective implements OnInit {
  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    setTimeout(() => {
      // wait for DOM rendering
      this.reinsertScripts();
    });
  }

  reinsertScripts(): void {
    const scripts = Array.from(
      <HTMLScriptElement[]>(
        this.elementRef.nativeElement.getElementsByTagName('script')
      ),
    );

    // This is necessary otherwise the scripts tags are not going to be evaluated
    for (let i = 0; i < scripts.length; i++) {
      const scriptTag = scripts[i];
      if (!scriptTag) throw new Error('Could not find script tag node');
      const parentNode = scriptTag.parentNode;
      if (!parentNode)
        throw new Error('Could not find parent node of script tag');

      const newScript = document.createElement('script');
      newScript.type = 'text/javascript';

      // Copy all attributes from the old script tag
      scripts[i].getAttributeNames().forEach((name) => {
        newScript.setAttribute(name, scriptTag.getAttribute(name) || '');
      });

      // Copy the content of the old script tag
      newScript.text = scriptTag.text;

      // Save it for later so we can remove it after loop
      // Replace the old script tag with the new one
      parentNode.removeChild(scriptTag);
      parentNode.appendChild(newScript);
    }
  }
}
