import { hello } from './modules/hello';

export function myFunction() {
  return hello('World');
}

export function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate();
}
