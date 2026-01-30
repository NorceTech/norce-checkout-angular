import { RunScriptsDirective } from './run-scripts.directive';
import { ElementRef } from '@angular/core';

describe('RunScriptsDirective', () => {
  let element: HTMLElement;
  let directive: RunScriptsDirective;

  beforeEach(() => {
    // Create a host element.
    element = document.createElement('div');

    // Add a sample script element.
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.setAttribute('data-test', 'value');
    script.text = 'console.log("original script");';
    element.appendChild(script);

    // Instantiate the directive with the ElementRef wrapping our host element.
    directive = new RunScriptsDirective(new ElementRef(element));
  });

  it('should call reinsertScripts on ngOnInit after a timeout', async () => {
    vi.useFakeTimers();
    vi.spyOn(directive, 'reinsertScripts');
    directive.ngOnInit();

    // Run the pending timers
    vi.runAllTimers();
    vi.useRealTimers();

    expect(directive.reinsertScripts).toHaveBeenCalled();
  });

  it('should reinsert script tags preserving attributes and content', () => {
    const originalScript = element.querySelector('script') as HTMLScriptElement;
    expect(originalScript).toBeTruthy();
    // Save the reference to the original script element for comparison.
    const originalScriptRef = originalScript;

    // Call reinsertScripts to process the script elements.
    directive.reinsertScripts();

    // After processing, check that there is exactly one script element.
    const scripts = element.getElementsByTagName('script');
    expect(scripts.length).toBe(1);

    const newScript = scripts[0] as HTMLScriptElement;
    // Ensure the new script is a different element.
    expect(newScript).not.toBe(originalScriptRef);
    // Validate that attributes are preserved.
    expect(newScript.getAttribute('data-test')).toBe('value');
    expect(newScript.type).toBe('text/javascript');
    // Validate that the content is preserved.
    expect(newScript.text).toBe('console.log("original script");');
  });

  it('should do nothing if no script tags are present', () => {
    // Replace inner HTML with content that has no script tags.
    element.innerHTML = '<p>No scripts here</p>';
    expect(element.getElementsByTagName('script').length).toBe(0);
    expect(() => directive.reinsertScripts()).not.toThrow();
    expect(element.innerHTML).toContain('<p>No scripts here</p>');
  });

  it('should throw an error if a script tag is missing (null element)', () => {
    // Override getElementsByTagName to return an array containing null.
    vi.spyOn(element, 'getElementsByTagName').mockReturnValue([null] as any);
    expect(() => directive.reinsertScripts()).toThrowError(
      'Could not find script tag node',
    );
  });

  it('should throw an error if a script tag has no parent node', () => {
    // Create a script element and simulate a missing parent node.
    const scriptWithoutParent = document.createElement('script');
    scriptWithoutParent.type = 'text/javascript';
    scriptWithoutParent.text = 'console.log("no parent")';
    // Force parentNode to be null.
    Object.defineProperty(scriptWithoutParent, 'parentNode', {
      value: null,
      writable: true,
    });
    vi.spyOn(element, 'getElementsByTagName').mockReturnValue([
      scriptWithoutParent,
    ] as any);
    expect(() => directive.reinsertScripts()).toThrowError(
      'Could not find parent node of script tag',
    );
  });
});
