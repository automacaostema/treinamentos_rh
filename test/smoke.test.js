const { expect } = require('chai');
const { JSDOM } = require('jsdom');

describe('Smoke Test - JSDOM Script Injection', () => {
    it('deve conseguir injetar um script simples no JSDOM', () => {
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { runScripts: "dangerously" });
        const { window } = dom;
        
        const script = window.document.createElement("script");
        script.textContent = "window.testVar = 'sucesso';";
        window.document.body.appendChild(script);
        
        expect(window.testVar).to.equal('sucesso');
    });
});
